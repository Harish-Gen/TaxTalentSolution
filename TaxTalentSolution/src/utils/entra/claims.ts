/**
 * Read phone from Entra id_token claims (if present in token).
 * Claim name is discovered automatically — no env var needed.
 */
export function getPhoneFromClaims(claims: Record<string, unknown>): string {
  for (const [key, value] of Object.entries(claims)) {
    if (typeof value === "string" && value) {
      const k = key.toLowerCase();
      if (k.startsWith("extension_") && k.includes("phone")) {
        return value;
      }
    }
  }
  for (const key of ["phone_number", "mobile", "PhoneNumber", "telephoneNumber"]) {
    const value = claims[key];
    if (value) return String(value);
  }
  return "";
}

export function getLinkedInFromClaims(claims: Record<string, unknown>): string {
  for (const [key, value] of Object.entries(claims)) {
    if (typeof value === "string" && value) {
      const k = key.toLowerCase();
      if (k.includes("linkedin")) {
        return value;
      }
    }
  }
  for (const key of ["linkedin", "linkedin_url", "linkedInUrl", "LinkedInUrl", "LinkedInProfileURL"]) {
    const value = claims[key];
    if (value) return String(value);
  }
  return "";
}

export function getCityFromClaims(claims: Record<string, unknown>): string {
  for (const [key, value] of Object.entries(claims)) {
    if (value && (typeof value === "string" || typeof value === "number")) {
      const k = key.toLowerCase();
      if (
        k.includes("city") ||
        k.includes("locality") ||
        k === "l" ||
        k === "loc"
      ) {
        return String(value);
      }
    }
  }
  for (const key of ["city", "city_name", "cityName", "City", "locality", "l"]) {
    const value = claims[key];
    if (value) return String(value);
  }
  return "";
}

export function getStateFromClaims(claims: Record<string, unknown>): string {
  for (const [key, value] of Object.entries(claims)) {
    if (value && (typeof value === "string" || typeof value === "number")) {
      const k = key.toLowerCase();
      if (
        k.includes("state") ||
        k.includes("province") ||
        k.includes("region") ||
        k === "st"
      ) {
        return String(value);
      }
    }
  }
  for (const key of ["state", "state_name", "stateName", "State", "province", "Province", "st", "st_name"]) {
    const value = claims[key];
    if (value) return String(value);
  }
  return "";
}

export function getCountryFromClaims(claims: Record<string, unknown>): string {
  for (const [key, value] of Object.entries(claims)) {
    if (value && (typeof value === "string" || typeof value === "number")) {
      const k = key.toLowerCase();
      if (k.includes("country") || k === "co" || k === "cntry" || k === "ctry") {
        return String(value);
      }
    }
  }
  for (const key of ["country", "country_name", "countryName", "Country", "co", "ctry"]) {
    const value = claims[key];
    if (value) return String(value);
  }
  return "";
}


