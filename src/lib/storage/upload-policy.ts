const DEFAULT_ALLOWED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".zip",
  ".rar",
  ".7z",
  ".png",
  ".jpg",
  ".jpeg",
];

export const MAX_SINGLE_FILE_SIZE_BYTES =
  Number(process.env.UPLOAD_MAX_FILE_MB ?? "20") * 1024 * 1024;
export const MAX_TOTAL_SIZE_BYTES =
  Number(process.env.UPLOAD_MAX_TOTAL_MB ?? "100") * 1024 * 1024;

export function getAllowedExtensions() {
  const fromEnv = process.env.UPLOAD_ALLOWED_EXTENSIONS;
  if (!fromEnv) {
    return DEFAULT_ALLOWED_EXTENSIONS;
  }

  return fromEnv
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function getFileExtension(name: string) {
  const index = name.lastIndexOf(".");
  if (index < 0) {
    return "";
  }
  return name.slice(index).toLowerCase();
}

export function assertUploadAllowed(name: string, sizeBytes: number) {
  if (sizeBytes <= 0) {
    throw new Error("Empty file is not allowed.");
  }

  if (sizeBytes > MAX_SINGLE_FILE_SIZE_BYTES) {
    throw new Error(
      `Single file exceeds limit (${Math.floor(MAX_SINGLE_FILE_SIZE_BYTES / 1024 / 1024)}MB).`,
    );
  }

  const ext = getFileExtension(name);
  const allowed = getAllowedExtensions();
  if (!allowed.includes(ext)) {
    throw new Error(`File type "${ext || "unknown"}" is not allowed.`);
  }
}
