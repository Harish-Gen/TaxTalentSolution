import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
from controllers.candidate_controller import router as candidate_router
from controllers.assessment_controller import router as assessment_router
from controllers.employer_controller import router as employer_router
from controllers.jobposting_controller import router as jobposting_router
from controllers.user_controller import router as user_router
from controllers.account_controller import router as account_router
from controllers.question_controller import router as question_router
from controllers.usercompetency_controller import router as usercompetency_router
from controllers.userassessment_controller import router as userassessment_router
from controllers.userassessmentanswer_controller import router as userassessmentanswer_router
from controllers.file_controller import router as file_router
from controllers.jobapplication_controller import router as jobapplication_router
from controllers.certificate_controller import router as certificate_router
from controllers.notification_controller import router as notification_router
from controllers.savedcandidate_controller import router as savedcandidate_router
from controllers.profileview_controller import router as profileview_router
from controllers.adminuser_controller import router as adminuser_router

app = FastAPI(title="TTS API Endpoints", description="A structured FastAPI application with Repository Pattern")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(candidate_router)
app.include_router(assessment_router)
app.include_router(employer_router)
app.include_router(jobposting_router)
app.include_router(user_router)
app.include_router(account_router)
app.include_router(question_router)
app.include_router(usercompetency_router)
app.include_router(userassessment_router)
app.include_router(userassessmentanswer_router)
app.include_router(file_router)
app.include_router(jobapplication_router)
app.include_router(certificate_router)
app.include_router(notification_router)
app.include_router(savedcandidate_router)
app.include_router(profileview_router)
app.include_router(adminuser_router)


def _ui_static_directory() -> Path:
    """
    Azure Oryx runs the app from /tmp/...; UI uploaded via FTP lives in
    /home/site/wwwroot/static — use that when present.
    """
    override = os.environ.get("UI_STATIC_DIR", "").strip()
    if override:
        return Path(override)
    wwwroot_static = Path("/home/site/wwwroot/static")
    if (wwwroot_static / "index.html").is_file():
        return wwwroot_static
    return Path(__file__).resolve().parent / "static"


_STATIC_DIR = _ui_static_directory()
_INDEX_HTML = _STATIC_DIR / "index.html"


@app.get("/")
def read_root():
    return {"message": "Welcome to the TTS API"}


@app.get("/health", include_in_schema=False)
def health():
    return {
        "status": "ok",
        "staticDir": str(_STATIC_DIR),
        "uiIndexPresent": _INDEX_HTML.is_file(),
    }


def _serve_ui_index():
    if _INDEX_HTML.is_file():
        return FileResponse(_INDEX_HTML)
    raise HTTPException(status_code=404, detail="UI index not found")


if _STATIC_DIR.is_dir():
    @app.get("/static", include_in_schema=False)
    def static_ui_trailing_slash():
        return RedirectResponse(url="/static/", status_code=302)

    # Entra redirects here with #id_token=... — server only sees /static/parsetoken.
    # StaticFiles does not SPA-fallback this path; must return index.html explicitly.
    @app.get("/static/parsetoken", include_in_schema=False)
    @app.get("/static/parsetoken/", include_in_schema=False)
    def static_parsetoken_callback():
        return _serve_ui_index()

    app.mount(
        "/static",
        StaticFiles(directory=str(_STATIC_DIR), html=True),
        name="ui",
    )


if __name__ == "__main__":
    import os as _os

    _os.environ.setdefault("ENVIRONMENT", "Development")
    use_reload = _os.getenv("TTS_RELOAD", "true").lower() in ("1", "true", "yes")
    uvicorn.run("TTS:app", host="127.0.0.1", port=8000, reload=use_reload)
