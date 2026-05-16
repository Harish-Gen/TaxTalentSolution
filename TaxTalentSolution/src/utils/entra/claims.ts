/**
 * Read phone from Entra id_token claims (if present in token).
 * Claim name is discovered automatically — no env var needed.
 */
export function getPhoneFromClaims(claims: Record<string, unknown>): string {
  for (const [key, value] of Object.entries(claims)) {
    if (
      typeof value === "string" &&
      value &&
      key.startsWith("extension_") &&
      /phone/i.test(key)
    ) {
      return value;
    }
  }
  for (const key of ["phone_number", "mobile", "PhoneNumber"]) {
    const value = claims[key];
    if (value) return String(value);
  }
  return "";
}
