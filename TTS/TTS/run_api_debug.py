"""
Use this file as the startup script when debugging in Visual Studio (F5).

Runs uvicorn WITHOUT reload so breakpoints in controllers/repositories are hit.
Normal run: use TTS.py (reload enabled for development).
"""
import os
import uvicorn

os.environ.setdefault("ENVIRONMENT", "Development")

if __name__ == "__main__":
    uvicorn.run(
        "TTS:app",
        host="127.0.0.1",
        port=8000,
        reload=False,
        log_level="debug",
    )
