import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-aefcc52e/health", (c) => {
  return c.json({ status: "ok" });
});

// User signup endpoint
app.post("/make-server-aefcc52e/signup", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Signup error for ${email}: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    console.log(`User created successfully: ${email}`);
    return c.json({ 
      success: true, 
      message: "Account created successfully",
      user: { id: data.user?.id, email: data.user?.email }
    });

  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: "Internal server error during signup" }, 500);
  }
});

// ─── Razorpay MCP client ────────────────────────────────────────────────────

const MCP_URL = "https://mcp.razorpay.com/mcp";

/** Parse a JSON-RPC response from the MCP server (handles both JSON and SSE). */
async function parseMcpResponse(res: Response): Promise<unknown> {
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("text/event-stream")) {
    const text = await res.text();
    for (const line of text.split("\n")) {
      if (line.startsWith("data: ")) {
        try { return JSON.parse(line.slice(6)); } catch { /* skip non-JSON lines */ }
      }
    }
    throw new Error("No parseable data in MCP SSE stream");
  }
  return res.json();
}

/**
 * Create a Razorpay order via the MCP server's `create_order` tool.
 * Credentials never leave the server.
 */
async function mcpCreateOrder(
  amount: number,
  currency: string,
  receipt: string,
  notes: Record<string, unknown>,
  credentials: string,
): Promise<{ id: string; amount: number; currency: string }> {
  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Basic ${credentials}`,
    "Accept": "application/json, text/event-stream",
  };

  // 1. Initialize MCP session
  const initRes = await fetch(MCP_URL, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "tax-talent-solution", version: "1.0.0" },
      },
      id: 1,
    }),
  });

  const sessionId = initRes.headers.get("Mcp-Session-Id");
  await parseMcpResponse(initRes); // consume init response

  const sessionHeaders: Record<string, string> = { ...baseHeaders };
  if (sessionId) sessionHeaders["Mcp-Session-Id"] = sessionId;

  // 2. Send initialized notification (fire-and-forget; no id = notification)
  await fetch(MCP_URL, {
    method: "POST",
    headers: sessionHeaders,
    body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }),
  }).catch(() => { /* non-critical */ });

  // 3. Call the create_order tool
  const toolRes = await fetch(MCP_URL, {
    method: "POST",
    headers: sessionHeaders,
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: "create_order",
        arguments: { amount, currency, receipt, notes },
      },
      id: 2,
    }),
  });

  if (!toolRes.ok) {
    const body = await toolRes.text().catch(() => "");
    throw new Error(`MCP server returned ${toolRes.status}: ${body}`);
  }

  type McpToolResult = {
    result?: { content?: Array<{ type: string; text: string }>; isError?: boolean };
    error?: { code: number; message: string };
  };

  const data = await parseMcpResponse(toolRes) as McpToolResult;

  if (data.error) throw new Error(`MCP error ${data.error.code}: ${data.error.message}`);
  if (data.result?.isError) throw new Error("MCP tool reported an error");

  const text = data.result?.content?.[0]?.text;
  if (!text) throw new Error("Unexpected MCP response: missing content text");

  const order = JSON.parse(text);
  return { id: order.id, amount: order.amount, currency: order.currency };
}

// ─── Razorpay create order endpoint ─────────────────────────────────────────

app.post("/make-server-aefcc52e/razorpay/create-order", async (c) => {
  try {
    const { amount_paise, currency = "INR", receipt, notes } = await c.req.json();

    if (!amount_paise || typeof amount_paise !== "number" || amount_paise < 100) {
      return c.json({ error: "Invalid amount. Minimum is 100 paise (₹1)." }, 400);
    }

    // Key ID is public; secret must stay server-side only
    const keyId = "rzp_test_Sm529wVNWwQI3D";
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "rdOpZzzNquvd6jbTtVsnesGb";
    const credentials = btoa(`${keyId}:${keySecret}`);

    const order = await mcpCreateOrder(
      amount_paise,
      currency,
      receipt ?? `rcpt_${Date.now()}`,
      notes ?? {},
      credentials,
    );

    console.log(`Razorpay order created via MCP: ${order.id}`);
    return c.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });

  } catch (error) {
    console.error("Razorpay create-order (MCP) error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

Deno.serve(app.fetch);