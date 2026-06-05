from urllib.parse import urlencode

from config.settings import settings


def build_entra_authorize_url(redirect_uri: str | None = None) -> str:
    """Build CIAM authorize URL from appsettings Entra section."""
    entra = settings.entra
    tenant = entra["tenant_name"]
    tenant_domain = f"{tenant}.onmicrosoft.com"
    redirect = redirect_uri or entra["redirect_uri"]

    params = {
        "p": entra["user_flow"],
        "client_id": entra["client_id"],
        "nonce": "defaultNonce",
        "scope": entra["scopes"],
        "response_type": entra["response_type"],
        "redirect_uri": redirect,
    }
    prompt = entra.get("prompt")
    if prompt:
        params["prompt"] = prompt

    query = urlencode(params)
    return (
        f"https://{tenant}.ciamlogin.com/{tenant_domain}/oauth2/v2.0/authorize?"
        f"{query}"
    )
