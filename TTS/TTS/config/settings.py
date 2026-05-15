import json
import os

class Settings:
    def __init__(self):
        # Path to appsettings.json relative to this file's directory
        settings_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'appsettings.json')
        with open(settings_path, 'r') as file:
            self._config = json.load(file)

    @property
    def database_connection_string(self) -> str:
        return self._config.get("Database", {}).get("ConnectionString", "")

    @property
    def default_candidate_role_id(self) -> str:
        return self._config.get("AppConfig", {}).get("DefaultCandidateRoleId", "")

settings = Settings()
