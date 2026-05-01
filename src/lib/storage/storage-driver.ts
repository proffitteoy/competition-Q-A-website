import type { SaveUploadedFileInput, UploadedFileMeta } from "@/lib/storage/types";

import { saveLocalFile } from "./local-storage";
import { saveS3File } from "./s3-storage";

export type StorageDriver = "local" | "s3";

function resolveStorageDriver(): StorageDriver {
  const raw = (process.env.UPLOAD_STORAGE_DRIVER ?? "local").trim().toLowerCase();
  if (raw === "local" || raw === "s3") {
    return raw;
  }
  throw new Error(`Unsupported UPLOAD_STORAGE_DRIVER: ${raw}`);
}

export async function saveUploadedFile(
  input: SaveUploadedFileInput,
): Promise<UploadedFileMeta> {
  const driver = resolveStorageDriver();
  if (driver === "s3") {
    return saveS3File(input);
  }
  return saveLocalFile(input);
}
