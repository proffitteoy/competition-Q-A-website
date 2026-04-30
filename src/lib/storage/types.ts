export interface UploadedFileMeta {
  originalName: string;
  storedName: string;
  storageKey: string;
  publicUrl: string;
  sizeBytes: number;
  mimeType: string;
}
