import { API_BASE_URL, getEntraRedirectUri } from "../utils/entra/config";

export interface EntraConfigResponse {
  Enabled: boolean;
  TenantName: string;
  UserFlow: string;
  RedirectUri: string;
  ClientId?: string;
}

export interface EntraLoginUrlResponse {
  AuthorizeUrl: string;
  RedirectUri: string;
}

let cachedEntraConfig: EntraConfigResponse | null = null;

export async function fetchEntraConfig(
  forceRefresh = false
): Promise<EntraConfigResponse> {
  if (cachedEntraConfig && !forceRefresh) {
    return cachedEntraConfig;
  }
  const response = await fetch(`${API_BASE_URL}/api/account/entra-config`);
  if (!response.ok) {
    throw new Error(`Failed to load Entra config (${response.status})`);
  }
  const data = (await response.json()) as EntraConfigResponse;
  cachedEntraConfig = {
    Enabled: data.Enabled === true,
    TenantName: data.TenantName,
    UserFlow: data.UserFlow,
    RedirectUri: data.RedirectUri,
    ClientId: data.ClientId,
  };
  return cachedEntraConfig;
}

/** Single source of truth: API `Entra:Enabled` in appsettings.{Environment}.json */
export async function isEntraEnabled(): Promise<boolean> {
  try {
    const config = await fetchEntraConfig();
    return config.Enabled;
  } catch {
    return false;
  }
}

export async function fetchEntraLoginUrl(
  redirectUri?: string,
  forSignup = false
): Promise<EntraLoginUrlResponse> {
  const resolvedRedirect = redirectUri ?? getEntraRedirectUri();
  const params = new URLSearchParams({
    redirect_uri: resolvedRedirect,
    for_signup: String(forSignup),
  });
  const response = await fetch(
    `${API_BASE_URL}/api/account/entra-login-url?${params.toString()}`
  );
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { detail?: string }).detail ||
        `Failed to build Entra login URL (${response.status})`
    );
  }
  return response.json() as Promise<EntraLoginUrlResponse>;
}
