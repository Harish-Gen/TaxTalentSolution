import json
import os
from copy import deepcopy
from typing import Any


def _deep_merge(base: dict, overlay: dict) -> dict:
    result = deepcopy(base)
    for key, value in overlay.items():
        if (
            key in result
            and isinstance(result[key], dict)
            and isinstance(value, dict)
        ):
            result[key] = _deep_merge(result[key], value)
        else:
            result[key] = value
    return result


def _load_config() -> dict:
    base_dir = os.path.dirname(os.path.dirname(__file__))
    config_path = os.path.join(base_dir, "appsettings.json")
    with open(config_path, "r", encoding="utf-8") as file:
        config = json.load(file)

    environment = os.getenv("ENVIRONMENT", "Development")
    env_path = os.path.join(base_dir, f"appsettings.{environment}.json")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as file:
            env_config = json.load(file)
            config = _deep_merge(config, env_config)
    return config


class Settings:
    def __init__(self):
        self._config = _load_config()

    @property
    def database_connection_string(self) -> str:
        return self._config.get("Database", {}).get("ConnectionString", "")

    @property
    def default_candidate_role_id(self) -> str:
        return self._config.get("AppConfig", {}).get("DefaultCandidateRoleId", "")

    @property
    def default_employer_role_id(self) -> str:
        return self._config.get("AppConfig", {}).get("DefaultEmployerRoleId", "")

    @property
    def entra(self) -> dict[str, Any]:
        section = self._config.get("Entra", {})
        tenant_name = section.get("TenantName", "TaxTalentExternal")
        return {
            "enabled": bool(section.get("Enabled", False)),
            "tenant_name": tenant_name,
            "tenant_domain": f"{tenant_name}.onmicrosoft.com",
            "client_id": section.get("ClientId", ""),
            "user_flow": section.get("UserFlow", "sign-up-sign-in"),
            "redirect_uri": section.get(
                "RedirectUri", "http://localhost:3000/static/parsetoken"
            ),
            "scopes": section.get("Scopes", "openid profile email"),
            "response_type": section.get("ResponseType", "id_token"),
            "prompt": section.get("Prompt", "login"),
        }

    @property
    def entra_enabled(self) -> bool:
        return self.entra["enabled"] and bool(self.entra["client_id"])


settings = Settings()
