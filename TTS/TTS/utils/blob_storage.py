import logging
from datetime import datetime, timezone
from typing import Optional

from azure.core.exceptions import ResourceNotFoundError
from azure.storage.blob import BlobServiceClient, ContentSettings

from config.settings import settings

logger = logging.getLogger(__name__)

_blob_service_client: Optional[BlobServiceClient] = None


def _get_blob_service_client() -> BlobServiceClient:
    global _blob_service_client
    if _blob_service_client is None:
        connection_string = settings.azure_storage_connection_string
        if not connection_string:
            raise ValueError(
                "Azure Storage is not configured. Set AzureStorage:ConnectionString "
                "or the AZURE_STORAGE_CONNECTION_STRING environment variable."
            )
        _blob_service_client = BlobServiceClient.from_connection_string(
            connection_string
        )
    return _blob_service_client


def _get_container_client():
    client = _get_blob_service_client()
    container = client.get_container_client(settings.azure_storage_container_name)
    if not container.exists():
        container.create_container()
    return container


def list_blobs() -> list[dict]:
    container = _get_container_client()
    items: list[dict] = []
    for blob in container.list_blobs():
        last_modified = blob.last_modified
        if last_modified and last_modified.tzinfo is None:
            last_modified = last_modified.replace(tzinfo=timezone.utc)
        items.append(
            {
                "name": blob.name,
                "size": blob.size or 0,
                "contentType": getattr(blob, "content_settings", None)
                and blob.content_settings.content_type,
                "lastModified": last_modified.isoformat() if last_modified else None,
            }
        )
    items.sort(key=lambda item: item["name"].lower())
    return items


def upload_blob(
    blob_name: str, data: bytes, content_type: Optional[str] = None
) -> dict:
    container = _get_container_client()
    blob_client = container.get_blob_client(blob_name)
    content_settings = (
        ContentSettings(content_type=content_type) if content_type else None
    )
    blob_client.upload_blob(
        data,
        overwrite=True,
        content_settings=content_settings,
    )
    props = blob_client.get_blob_properties()
    last_modified = props.last_modified
    if last_modified and last_modified.tzinfo is None:
        last_modified = last_modified.replace(tzinfo=timezone.utc)
    return {
        "name": blob_name,
        "size": props.size,
        "contentType": props.content_settings.content_type
        if props.content_settings
        else content_type,
        "lastModified": last_modified.isoformat() if last_modified else datetime.now(
            timezone.utc
        ).isoformat(),
    }


def download_blob(blob_name: str) -> tuple[bytes, str, Optional[str]]:
    container = _get_container_client()
    blob_client = container.get_blob_client(blob_name)
    try:
        stream = blob_client.download_blob()
    except ResourceNotFoundError as exc:
        raise FileNotFoundError(blob_name) from exc
    props = blob_client.get_blob_properties()
    content_type = (
        props.content_settings.content_type
        if props.content_settings
        else "application/octet-stream"
    )
    return stream.readall(), blob_name, content_type


def delete_blob(blob_name: str) -> None:
    container = _get_container_client()
    blob_client = container.get_blob_client(blob_name)
    try:
        blob_client.delete_blob()
    except ResourceNotFoundError as exc:
        raise FileNotFoundError(blob_name) from exc
