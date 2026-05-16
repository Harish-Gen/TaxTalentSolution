// =====================================================
// Azure AD B2C Configuration
// Tax Talent Solution – User Management
// =====================================================
// SETUP INSTRUCTIONS:
// 1. Go to Azure Portal → Azure AD B2C → App registrations → Register your app
// 2. Copy the Application (client) ID → paste into B2C_CLIENT_ID
// 3. Copy the Directory (tenant) ID or tenant domain → paste into B2C_TENANT_NAME
// 4. Create User Flows:
//    - Sign up and sign in  → name: B2C_1_signupsignin
//    - Password reset       → name: B2C_1_passwordreset
//    - Profile editing      → name: B2C_1_profileediting
// 5. Under Authentication add:
//    - SPA platform with redirect URI: http://localhost:5173
//    - Enable Access tokens & ID tokens
// 6. Under API permissions add: openid, offline_access
// =====================================================

export const B2C_TENANT_NAME   = "YOURB2CTENANT";          // e.g.  "taxtalentsolution"
export const B2C_TENANT_DOMAIN = `${B2C_TENANT_NAME}.onmicrosoft.com`;
export const B2C_CLIENT_ID     = "YOUR_B2C_APPLICATION_CLIENT_ID"; // GUID from App Registration

// User-flow / policy names (must match what you created in the portal)
export const B2C_POLICIES = {
  signUpSignIn:   "B2C_1_signupsignin",
  passwordReset:  "B2C_1_passwordreset",
  profileEditing: "B2C_1_profileediting",
} as const;

// Authority base – do NOT change the path structure
const AUTHORITY_BASE = `https://${B2C_TENANT_NAME}.b2clogin.com/${B2C_TENANT_DOMAIN}`;

export const B2C_AUTHORITIES = {
  signUpSignIn:   { authority: `${AUTHORITY_BASE}/${B2C_POLICIES.signUpSignIn}` },
  passwordReset:  { authority: `${AUTHORITY_BASE}/${B2C_POLICIES.passwordReset}` },
  profileEditing: { authority: `${AUTHORITY_BASE}/${B2C_POLICIES.profileEditing}` },
} as const;

// Scopes requested during sign-in (openid + offline_access for refresh tokens)
export const B2C_SCOPES = {
  signIn: ["openid", "offline_access"],
  api:    [`https://${B2C_TENANT_DOMAIN}/taxtalent-api/user.read`],
};

import { appRootUrl } from "../appPaths";

// MSAL configuration object
export const msalConfig = {
  auth: {
    clientId:             B2C_CLIENT_ID,
    authority:            B2C_AUTHORITIES.signUpSignIn.authority,
    knownAuthorities:     [`${B2C_TENANT_NAME}.b2clogin.com`],
    redirectUri:          appRootUrl(),
    postLogoutRedirectUri: appRootUrl(),
  },
  cache: {
    cacheLocation:        "sessionStorage" as const, // sessionStorage – safer for SPAs
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: number, message: string, containsPii: boolean) => {
        if (containsPii) return;
        if (import.meta.env.DEV) {
          console.log(`[MSAL][${level}] ${message}`);
        }
      },
    },
  },
};

// Login request used for interactive sign-in / sign-up
export const loginRequest = {
  scopes:       B2C_SCOPES.signIn,
  prompt:       "select_account" as const,
};

// Silent token-refresh request
export const silentRequest = {
  scopes:    B2C_SCOPES.signIn,
  authority: B2C_AUTHORITIES.signUpSignIn.authority,
};
