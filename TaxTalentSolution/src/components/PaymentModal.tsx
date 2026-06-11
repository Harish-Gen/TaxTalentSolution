import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle, X, Lock, Star, Building, AlertCircle, CreditCard } from "lucide-react";
import { getStoredEntraUser } from "../utils/entra/tokenUtils";
import { paymentService } from "../api/paymentService";
import { loadProfile } from "../database/profileStore";

// Razorpay checkout.js injects a global constructor
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}
interface RazorpayInstance {
  open(): void;
  on(event: string, handler: () => void): void;
}
interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PendingPlan {
  name: string;
  price: string;
  period: string;
  billing?: "monthly" | "annual";
}

interface PaymentModalProps {
  plan: PendingPlan;
  onClose: () => void;
  onSuccess: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Convert a display price string (e.g. "₹1,000") to paise */
function priceToPaise(price: string): number {
  const num = parseInt(price.replace(/[₹,\s]/g, ""), 10);
  return isNaN(num) ? 0 : num * 100;
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window.Razorpay !== "undefined") { resolve(); return; }
    const existing = document.getElementById("razorpay-checkout-js");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PaymentModal({ plan, onClose, onSuccess }: PaymentModalProps) {
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFree = plan.price === "Free";

  const handleFreeActivate = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setPaid(true);
      setTimeout(() => onSuccess(), 2000);
    }, 800);
  };

  const handleRazorpay = async () => {
    setError(null);
    setProcessing(true);
    try {
      // Get user details from entra session
      const entraUser = getStoredEntraUser();
      const userId = entraUser?.id as string | undefined;
      if (!userId) {
        throw new Error("No active user session found. Please sign in again.");
      }

      // Load Razorpay checkout.js
      await loadRazorpayScript();

      // Convert plan display price to Rupees (base currency units)
      const amountInRupees = parseInt(plan.price.replace(/[₹,\s]/g, ""), 10);
      if (isNaN(amountInRupees) || amountInRupees <= 0) {
        throw new Error("Invalid plan price.");
      }

      // Generate a receipt ID
      const receiptId = `rcpt_plan_${plan.name.replace(/\s+/g, "_").toLowerCase()}_${Date.now()}`;

      // Create order on FastAPI backend
      const orderResponse = await paymentService.createOrder(
        amountInRupees,
        receiptId,
        undefined, // assessmentId
        plan.name  // planName
      );

      // Open Razorpay hosted checkout
      const options: RazorpayOptions = {
        key: orderResponse.key_id,
        amount: orderResponse.amount, // from backend
        currency: orderResponse.currency, // from backend
        name: "Tax Talent Solution",
        description: `${plan.name} – ${plan.period}`,
        order_id: orderResponse.order_id, // from backend
        handler: async (response: RazorpayPaymentResponse) => {
          try {
            setProcessing(true);
            // Verify payment signature on FastAPI backend (saves record in DB)
            await paymentService.verifySignature(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature,
              userId,
              undefined, // assessmentId
              plan.name, // planName
              orderResponse.amount // amount in paise
            );

            setProcessing(false);
            setPaid(true);
            setTimeout(() => onSuccess(), 2000);
          } catch (verifyErr) {
            setProcessing(false);
            setError(
              verifyErr instanceof Error 
                ? verifyErr.message 
                : "Payment verification failed. Please contact support."
            );
          }
        },
        prefill: {
          name: userId ? (loadProfile(userId)?.name || (entraUser?.user_metadata as any)?.name || "") : "",
          email: userId ? (loadProfile(userId)?.email || (entraUser?.email as string) || "") : "",
          contact: userId ? (loadProfile(userId)?.phone || "") : "",
        },
        theme: { color: "#6366f1" },
        modal: {
          ondismiss: () => setProcessing(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setProcessing(false);
        setError("Payment failed. Please try again or use a different payment method.");
      });
      rzp.open();
    } catch (err) {
      setProcessing(false);
      setError(err instanceof Error ? err.message : "Could not initiate payment. Please try again.");
    }
  };

  const planIcon = plan.name === "Premium" ? Building : plan.name === "Professional Pro" ? Star : CheckCircle;
  const PlanIcon = planIcon;

  // ── Success screen ───────────────────────────────────────────────────────────
  if (paid) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md shadow-2xl text-center">
          <CardContent className="pt-10 pb-10">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground">
              Welcome to <strong>{plan.name}</strong>. Your account has been activated.
            </p>
            <p className="text-sm text-muted-foreground mt-2">Redirecting to your dashboard…</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Payment modal ────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Complete Your Subscription</CardTitle>
            <button
              onClick={onClose}
              disabled={processing}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Plan Summary */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <PlanIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-foreground">{plan.name}</p>
                {plan.billing === "annual" && (
                  <Badge className="text-xs bg-emerald-100 text-emerald-700 border-0">Annual</Badge>
                )}
                {plan.billing === "monthly" && (
                  <Badge variant="secondary" className="text-xs">Monthly</Badge>
                )}
              </div>
              <p className="text-2xl font-bold text-primary mt-1">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground ml-1">{plan.period}</span>
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Free plan */}
          {isFree ? (
            <div>
              <p className="text-muted-foreground text-sm text-center mb-4">
                No payment required. Activate your free account now.
              </p>
              <Button className="w-full" onClick={handleFreeActivate} disabled={processing}>
                {processing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Activating…
                  </span>
                ) : (
                  "Activate Free Account"
                )}
              </Button>
            </div>
          ) : (
            /* Paid plan – Razorpay hosted checkout */
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-3.5 h-3.5" />
                Secured payment powered by Razorpay
              </div>

              <Button className="w-full" size="lg" onClick={handleRazorpay} disabled={processing}>
                {processing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Opening Payment Gateway…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Pay {plan.price} with Razorpay
                  </span>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                You'll be redirected to Razorpay's secure checkout.
                Supports cards, UPI, net banking &amp; wallets.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
