import logging
from typing import Optional
from urllib.parse import quote

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response
from pydantic import BaseModel

from utils import blob_storage

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/files",
    tags=["Files"],
)

MAX_UPLOAD_BYTES = 50 * 1024 * 1024


class BlobFileInfo(BaseModel):
    name: str
    size: int
    contentType: Optional[str] = None
    lastModified: Optional[str] = None


@router.get("/", response_model=list[BlobFileInfo])
def list_files():
    try:
        return blob_storage.list_blobs()
    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Failed to list blob files")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/upload", response_model=BlobFileInfo)
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="File name is required")

    try:
        data = await file.read()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read file: {exc}") from exc

    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum size of {MAX_UPLOAD_BYTES // (1024 * 1024)} MB",
        )

    blob_name = file.filename.replace("\\", "/").lstrip("/")
    try:
        return blob_storage.upload_blob(
            blob_name,
            data,
            content_type=file.content_type,
        )
    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Failed to upload blob file")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/download/{blob_name:path}")
def download_file(blob_name: str):
    try:
        data, filename, content_type = blob_storage.download_blob(blob_name)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="File not found") from exc
    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Failed to download blob file")
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    safe_name = filename.split("/")[-1]
    encoded_name = quote(safe_name)
    headers = {
        "Content-Disposition": f'attachment; filename="{safe_name}"; filename*=UTF-8\'\'{encoded_name}'
    }
    return Response(
        content=data,
        media_type=content_type or "application/octet-stream",
        headers=headers,
    )


@router.delete("/{blob_name:path}", status_code=204)
def delete_file(blob_name: str):
    try:
        blob_storage.delete_blob(blob_name)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="File not found") from exc
    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Failed to delete blob file")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
