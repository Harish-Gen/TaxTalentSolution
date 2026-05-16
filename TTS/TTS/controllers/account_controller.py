import base64
import json
import logging
from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from pydantic import BaseModel
from uuid import UUID
from repository.user_repository import UserRepository
from models.user import UserCreateUpdate
from config.settings import settings
from utils.entra_claims import phone_from_claims
from utils.entra_auth import build_entra_authorize_url

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/account",
    tags=["Account"],
)


class SignUpOrSignInRequest(BaseModel):
    Token: str


class SignUpOrSignInResponse(BaseModel):
    Token: str
    IsNewUser: bool = False
    user: Optional[dict] = None


class EntraConfigResponse(BaseModel):
    Enabled: bool
    TenantName: str
    UserFlow: str
    RedirectUri: str
    ClientId: str = ""


class EntraLoginUrlResponse(BaseModel):
    AuthorizeUrl: str
    RedirectUri: str


def _decode_jwt_payload(token: str) -> dict:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Invalid JWT format")
        payload = parts[1]
        padding = "=" * ((4 - len(payload) % 4) % 4)
        decoded = base64.urlsafe_b64decode(payload + padding)
        return json.loads(decoded)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid token: {exc}") from exc


def _email_from_claims(claims: dict) -> str:
    email = claims.get("email") or claims.get("preferred_username")
    if not email:
        raise HTTPException(status_code=400, detail="Email claim missing from token")
    return str(email).lower()


def _name_from_claims(claims: dict) -> str:
    if claims.get("name"):
        return str(claims["name"])
    parts = [claims.get("given_name"), claims.get("family_name")]
    joined = " ".join(p for p in parts if p)
    if joined:
        return joined
    return _email_from_claims(claims).split("@")[0]


@router.get("/entra-config", response_model=EntraConfigResponse)
def get_entra_config():
    """Entra CIAM settings for the UI (from appsettings.{Environment}.json)."""
    entra = settings.entra
    return EntraConfigResponse(
        Enabled=settings.entra_enabled,
        TenantName=entra["tenant_name"],
        UserFlow=entra["user_flow"],
        RedirectUri=entra["redirect_uri"],
        ClientId=entra["client_id"] if settings.entra_enabled else "",
    )


@router.get("/entra-login-url", response_model=EntraLoginUrlResponse)
def get_entra_login_url(redirect_uri: Optional[str] = None):
    """Build the Microsoft Entra authorize URL server-side."""
    if not settings.entra_enabled:
        raise HTTPException(
            status_code=400,
            detail="Entra sign-in is not enabled in API configuration.",
        )
    resolved_redirect = redirect_uri or settings.entra["redirect_uri"]
    return EntraLoginUrlResponse(
        AuthorizeUrl=build_entra_authorize_url(resolved_redirect),
        RedirectUri=resolved_redirect,
    )


@router.post("/sign-up-or-sign-in", response_model=SignUpOrSignInResponse)
def sign_up_or_sign_in(
    request: SignUpOrSignInRequest,
    authorization: Optional[str] = Header(None),
):
    """
  Exchange an Azure External Entra id_token for an application session.
  Token signature validation should be added via Azure JWKS in production.
    """
    token = request.Token
    if not token and authorization and authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()
    if not token:
        raise HTTPException(status_code=400, detail="Token is required")

    try:
        claims = _decode_jwt_payload(token)
        email = _email_from_claims(claims)
        name = _name_from_claims(claims)
        phone = phone_from_claims(claims)

        repo = UserRepository()
        existing = repo.get_user_by_email(email)
        is_new_user = existing is None

        if is_new_user:
            new_user = UserCreateUpdate(
                name=name,
                email=email,
                phone=phone,
                roleid=UUID(settings.default_candidate_role_id),
                isactive=True,
            )
            user = repo.upsert_user(new_user)
        else:
            user = existing

        role_name = user.role.get("name") if user.role else "candidate"

        return SignUpOrSignInResponse(
            Token=token,
            IsNewUser=is_new_user,
            user={
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "role": role_name,
            },
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("sign-up-or-sign-in failed for Entra user")
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        ) from exc
