import {
  assertUploadAllowed,
  MAX_TOTAL_SIZE_BYTES,
} from "@/lib/storage/upload-policy";
import { saveLocalFile } from "@/lib/storage/local-storage";
import type { UploadedFileMeta } from "@/lib/storage/types";

interface UploadFilesInput {
  files: File[];
  scope: "registration" | "notice" | "competition";
  competitionId?: string;
}

export async function uploadFilesService(
  input: UploadFilesInput,
): Promise<UploadedFileMeta[]> {
  if (input.files.length === 0) {
    throw new Error("No files uploaded.");
  }

  const totalSize = input.files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > MAX_TOTAL_SIZE_BYTES) {
    throw new Error(
      `Total upload size exceeds limit (${Math.floor(MAX_TOTAL_SIZE_BYTES / 1024 / 1024)}MB).`,
    );
  }

  for (const file of input.files) {
    assertUploadAllowed(file.name, file.size);
  }

  const results: UploadedFileMeta[] = [];
  for (const file of input.files) {
    const saved = await saveLocalFile({
      file,
      scope: input.scope,
      competitionId: input.competitionId,
    });
    results.push(saved);
  }
  return results;
}
