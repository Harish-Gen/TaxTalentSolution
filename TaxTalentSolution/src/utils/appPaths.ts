/** Vite `base` — `/static/` for Azure App Service, `./` for Capacitor. */
export const APP_BASE = import.meta.env.BASE_URL;

function normalizeBase(): string {
  if (APP_BASE === "./") return "./";
  return APP_BASE.endsWith("/") ? APP_BASE : `${APP_BASE}/`;
}

/** Public asset under `public/` (e.g. `images/logo.png`). */
export function assetUrl(path: string): string {
  const clean = path.replace(/^\//, "");
  return `${normalizeBase()}${clean}`;
}

/** App root path (e.g. `/static/`). */
export function appRootPath(): string {
  const base = normalizeBase();
  return base === "./" ? "/" : base;
}

/** Full URL to app root, optional query (e.g. `?view=dashboard`). */
export function appRootUrl(query = ""): string {
  const q = query && !query.startsWith("?") ? `?${query}` : query;
  return `${window.location.origin}${appRootPath()}${q}`;
}

export function parseTokenPath(): string {
  const root = appRootPath();
  if (root === "/") return "/parsetoken";
  return `${root}parsetoken`.replace(/\/+/g, "/");
}

export function parseTokenUrl(): string {
  return `${window.location.origin}${parseTokenPath()}`;
}

export function isParseTokenRoute(): boolean {
  const path = window.location.pathname.toLowerCase();
  return path.endsWith("/parsetoken");
}
