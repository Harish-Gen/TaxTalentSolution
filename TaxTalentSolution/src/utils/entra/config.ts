import { parseTokenUrl } from "../appPaths";

/** TTS API base URL from `.env.development` / `.env.production` (`VITE_API_URL`). */
function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL?.trim();
  if (!raw) {
    throw new Error(
      "VITE_API_URL is not set. Add it to .env.development or .env.production."
    );
  }
  return raw.replace(/\/+$/, "");
}

export const API_BASE_URL = resolveApiBaseUrl();

/** Client redirect URI sent to API when building the Entra login URL. */
export function getEntraRedirectUri(): string {
  return parseTokenUrl();
}
