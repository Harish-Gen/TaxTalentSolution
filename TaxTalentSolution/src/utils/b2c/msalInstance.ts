// =====================================================
// MSAL PublicClientApplication Singleton
// Tax Talent Solution – Azure AD B2C
// =====================================================
import { PublicClientApplication, EventType, type AuthenticationResult } from "@azure/msal-browser";
import { msalConfig } from "./config";

// Create the singleton MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Initialise – must be called before any auth interaction
let _initialised = false;
export async function initialiseMsal(): Promise<void> {
  if (_initialised) return;
  await msalInstance.initialize();
  _initialised = true;

  // If a redirect just completed, handle the response
  const response = await msalInstance.handleRedirectPromise();
  if (response) {
    msalInstance.setActiveAccount(response.account);
  }

  // Keep the active account in sync whenever a login event fires
  msalInstance.addEventCallback((event) => {
    if (
      event.eventType === EventType.LOGIN_SUCCESS ||
      event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
    ) {
      const payload = event.payload as AuthenticationResult;
      if (payload?.account) {
        msalInstance.setActiveAccount(payload.account);
      }
    }
  });
}
