import { randomUUID } from "node:crypto";

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import type { SaveUploadedFileInput, UploadedFileMeta } from "@/lib/storage/types";

import { sanitizeFileName, sanitizeSegment } from "./local-storage";

let cachedClient: S3Client | null = null;

function parseBoolean(value: string | undefined, defaultValue: boolean) {
  if (value === undefined) return defaultValue;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function getS3Config() {
  const bucket = process.env.S3_BUCKET?.trim();
  const region = process.env.S3_REGION?.trim();
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
  const endpoint = process.env.S3_ENDPOINT?.trim();
  const forcePathStyle = parseBoolean(process.env.S3_FORCE_PATH_STYLE, true);
  const objectPrefix = sanitizeSegment(
    process.env.S3_OBJECT_PREFIX?.trim() || "uploads",
  );
  const publicBaseUrl =
    process.env.S3_PUBLIC_BASE_URL?.trim() ||
    process.env.UPLOAD_PUBLIC_BASE_URL?.trim() ||
    "";

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "S3 storage requires S3_BUCKET/S3_REGION/S3_ACCESS_KEY_ID/S3_SECRET_ACCESS_KEY.",
    );
  }

  return {
    bucket,
    region,
    accessKeyId,
    secretAccessKey,
    endpoint,
    forcePathStyle,
    objectPrefix,
    publicBaseUrl,
  };
}

function getS3Client() {
  if (cachedClient) {
    return cachedClient;
  }

  const config = getS3Config();
  cachedClient = new S3Client({
    region: config.region,
    endpoint: config.endpoint || undefined,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return cachedClient;
}

function buildPublicUrl(storageKey: string, publicBaseUrl: string, bucket: string) {
  if (publicBaseUrl) {
    const normalizedBase = publicBaseUrl.endsWith("/")
      ? publicBaseUrl.slice(0, -1)
      : publicBaseUrl;
    return `${normalizedBase}/${storageKey}`;
  }

  return `s3://${bucket}/${storageKey}`;
}

export async function readS3File(storageKey: string): Promise<Buffer> {
  const config = getS3Config();
  const client = getS3Client();
  const response = await client.send(
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: storageKey,
    }),
  );
  if (!response.Body) {
    throw new Error("S3 object body is empty.");
  }
  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function saveS3File(
  input: SaveUploadedFileInput,
): Promise<UploadedFileMeta> {
  const config = getS3Config();
  const client = getS3Client();
  const scopeDir = sanitizeSegment(input.scope);
  const competitionDir = input.competitionId
    ? sanitizeSegment(input.competitionId)
    : "common";
  const originalName = sanitizeFileName(input.file.name);
  const storedName = `${Date.now()}-${randomUUID()}-${originalName}`;
  const storageKey = `${config.objectPrefix}/${scopeDir}/${competitionDir}/${storedName}`;
  const bytes = Buffer.from(await input.file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: storageKey,
      Body: bytes,
      ContentType: input.file.type || "application/octet-stream",
      ContentLength: bytes.byteLength,
    }),
  );

  return {
    originalName,
    storedName,
    storageKey,
    publicUrl: buildPublicUrl(storageKey, config.publicBaseUrl, config.bucket),
    sizeBytes: bytes.byteLength,
    mimeType: input.file.type || "application/octet-stream",
  };
}
