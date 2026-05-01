export interface UploadedFileMeta {
  originalName: string;
  storedName: string;
  storageKey: string;
  publicUrl: string;
  sizeBytes: number;
  mimeType: string;
}

export type UploadScope = "registration" | "notice" | "competition" | "avatar" | "experience_cover";

export interface SaveUploadedFileInput {
  file: File;
  scope: UploadScope;
  competitionId?: string;
}
