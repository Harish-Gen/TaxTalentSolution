"""
Map fields from Azure External Entra id_token JWT payloads.
No fixed claim name required — scans extension_* keys containing 'phone'.
"""


def phone_from_claims(claims: dict) -> str:
    """Return phone from token; empty string if not in token (SQL NOT NULL column)."""
    for key, value in claims.items():
        if not value:
            continue
        if key.startswith("extension_") and "phone" in key.lower():
            return str(value)
    for key in ("phone_number", "mobile", "PhoneNumber"):
        value = claims.get(key)
        if value:
            return str(value)
    return ""
