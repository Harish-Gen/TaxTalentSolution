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

function parseErrorBody(status: number, body: string): string {
  try {
    const data = JSON.parse(body) as { detail?: string | Array<{ msg?: string }> };
    const detail = data.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg ?? String(item)).join(", ");
    }
  } catch {
    // ignore invalid JSON
  }
  return `Request failed (${status})`;
}

async function parseError(response: Response): Promise<string> {
  const body = await response.text().catch(() => "");
  return parseErrorBody(response.status, body);
}

export type UploadProgressCallback = (percent: number) => void;

export async function listStorageFiles(): Promise<StorageFile[]> {
  const response = await fetch(`${API_BASE_URL}/api/files/`);
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function uploadStorageFile(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<StorageFile> {
  const formData = new FormData();
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/api/files/upload`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as StorageFile);
        } catch {
          reject(new Error("Invalid response from server"));
        }
        return;
      }
      reject(new Error(parseErrorBody(xhr.status, xhr.responseText)));
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));

    xhr.send(formData);
  });
}

/** Upload with an optional folder prefix (e.g. resumes, profiles). */
export async function uploadFileToStorage(
  file: File,
  folder?: string,
  onProgress?: UploadProgressCallback
): Promise<StorageFile> {
  const blobPath = storageBlobPath(folder ?? "", file.name);
  return uploadStorageFile(fileWithBlobPath(file, blobPath), onProgress);
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
