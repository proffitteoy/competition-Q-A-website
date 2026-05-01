import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { randomUUID } from "node:crypto";

import type { SaveUploadedFileInput, UploadedFileMeta } from "@/lib/storage/types";

export function sanitizeSegment(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function sanitizeFileName(input: string) {
  const normalized = input.replace(/[\\/:*?"<>|]/g, "-").trim();
  return normalized.length > 0 ? normalized : "file";
}

function resolveUploadRootDir() {
  const fromEnv = process.env.UPLOAD_LOCAL_DIR?.trim();
  if (fromEnv) {
    return path.resolve(fromEnv);
  }
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[storage] UPLOAD_LOCAL_DIR is not set — using OS tmpdir. Uploaded files may be lost on restart.",
    );
    return path.join(os.tmpdir(), "competition-qa-platform", "uploads");
  }
  return path.join(process.cwd(), ".uploads");
}

export function buildLocalFilePublicUrl(storageKey: string) {
  return `/api/uploads?key=${encodeURIComponent(storageKey)}`;
}

export function resolveLocalFilePath(storageKey: string) {
  const normalized = storageKey.replace(/\\/g, "/");
  if (!normalized.startsWith("uploads/")) {
    throw new Error("Invalid local storage key.");
  }

  const rootDir = path.resolve(resolveUploadRootDir());
  const relativePath = normalized.slice("uploads/".length);
  const absolutePath = path.resolve(rootDir, relativePath);

  if (absolutePath !== rootDir && !absolutePath.startsWith(`${rootDir}${path.sep}`)) {
    throw new Error("Invalid local storage path.");
  }

  return absolutePath;
}

export async function readLocalFileByStorageKey(storageKey: string) {
  return readFile(resolveLocalFilePath(storageKey));
}

export async function saveLocalFile(
  input: SaveUploadedFileInput,
): Promise<UploadedFileMeta> {
  const rootDir = resolveUploadRootDir();
  const scopeDir = sanitizeSegment(input.scope);
  const competitionDir = input.competitionId
    ? sanitizeSegment(input.competitionId)
    : "common";
  const subDir = path.join(scopeDir, competitionDir);
  const targetDir = path.join(rootDir, subDir);
  await mkdir(targetDir, { recursive: true });

  const originalName = sanitizeFileName(input.file.name);
  const storedName = `${Date.now()}-${randomUUID()}-${originalName}`;
  const absolutePath = path.join(targetDir, storedName);
  const bytes = Buffer.from(await input.file.arrayBuffer());
  await writeFile(absolutePath, bytes);

  const storageKey = path.posix.join(
    "uploads",
    scopeDir,
    competitionDir,
    storedName,
  );

  return {
    originalName,
    storedName,
    storageKey,
    publicUrl: buildLocalFilePublicUrl(storageKey),
    sizeBytes: bytes.byteLength,
    mimeType: input.file.type || "application/octet-stream",
  };
}
