import json
import os
from copy import deepcopy


def _deep_merge(base: dict, overlay: dict) -> dict:
    result = deepcopy(base)
    for key, value in overlay.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = _deep_merge(result[key], value)
        else:
            result[key] = value
    return result


def load_connection_string() -> str:
    """Read Database:ConnectionString from TTS appsettings (same as API)."""
    migrations_dir = os.path.dirname(os.path.dirname(__file__))
    tts_dir = os.path.join(migrations_dir, "..", "TTS")
    base_path = os.path.join(tts_dir, "appsettings.json")

    with open(base_path, "r", encoding="utf-8") as file:
        config = json.load(file)

    environment = os.getenv("ENVIRONMENT", "Development")
    env_path = os.path.join(tts_dir, f"appsettings.{environment}.json")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as file:
            config = _deep_merge(config, json.load(file))

    conn = config.get("Database", {}).get("ConnectionString", "").strip()
    if not conn:
        raise ValueError(
            "Database:ConnectionString is missing. Set it in TTS/appsettings.Development.json"
        )
    return conn
