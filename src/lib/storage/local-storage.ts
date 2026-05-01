import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
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
  return path.join(process.cwd(), "public", "uploads");
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
    publicUrl: `/${storageKey}`,
    sizeBytes: bytes.byteLength,
    mimeType: input.file.type || "application/octet-stream",
  };
}
