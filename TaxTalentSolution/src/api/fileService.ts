import { API_BASE_URL } from "../utils/entra/config";

export interface StorageFile {
  name: string;
  size: number;
  contentType?: string;
  lastModified?: string;
}

/** Build a unique blob path (optionally under a folder prefix). */
export function storageBlobPath(folder: string, fileName: string): string {
  const baseName =
    fileName.replace(/\\/g, "/").split("/").pop() || "file";
  const safe = baseName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const stamped = `${Date.now()}-${safe}`;
  const prefix = folder.replace(/\/+$/, "");
  return prefix ? `${prefix}/${stamped}` : stamped;
}

function fileWithBlobPath(file: File, blobPath: string): File {
  return new File([file], blobPath, { type: file.type });
}

export function isExternalFileUrl(ref: string): boolean {
  return /^https?:\/\//i.test(ref);
}

export function resolveStorageDownloadUrl(ref: string): string {
  if (!ref) return "";
  if (isExternalFileUrl(ref)) return ref;
  return getStorageFileDownloadUrl(ref);
}

async function parseError(response: Response): Promise<string> {
  const data = await response.json().catch(() => ({}));
  const detail = (data as { detail?: string }).detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg ?? String(item)).join(", ");
  }
  return `Request failed (${response.status})`;
}

export async function listStorageFiles(): Promise<StorageFile[]> {
  const response = await fetch(`${API_BASE_URL}/api/files/`);
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function uploadStorageFile(file: File): Promise<StorageFile> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

/** Upload with an optional folder prefix (e.g. resumes, profiles). */
export async function uploadFileToStorage(
  file: File,
  folder?: string
): Promise<StorageFile> {
  const blobPath = storageBlobPath(folder ?? "", file.name);
  return uploadStorageFile(fileWithBlobPath(file, blobPath));
}

export async function downloadStorageFile(
  blobName: string,
  displayName?: string
): Promise<void> {
  const response = await fetch(getStorageFileDownloadUrl(blobName));
  if (!response.ok) throw new Error(await parseError(response));
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = displayName ?? blobName.split("/").pop() ?? "download";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export function getStorageFileDownloadUrl(name: string): string {
  const encoded = name
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${API_BASE_URL}/api/files/download/${encoded}`;
}

export async function deleteStorageFile(name: string): Promise<void> {
  const encoded = name
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const response = await fetch(`${API_BASE_URL}/api/files/${encoded}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(await parseError(response));
}
