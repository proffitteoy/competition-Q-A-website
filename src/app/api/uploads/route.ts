import { NextResponse } from "next/server";
import { z } from "zod";
import path from "node:path";

import { isContentManagerRole } from "@/lib/auth/authorization";
import { getSessionUser } from "@/lib/auth/session";
import { readUploadedFile } from "@/lib/storage/storage-driver";
import { assertCanEditCompetitionContent } from "@/server/permissions/competition-permissions";
import { uploadFilesService } from "@/server/services/upload-service";

const scopeSchema = z.enum(["registration", "notice", "competition"]);
const storageKeySchema = z.string().min(1);

function resolveMimeType(storageKey: string) {
  const ext = path.extname(storageKey).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".doc") return "application/msword";
  if (ext === ".docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (ext === ".xls") return "application/vnd.ms-excel";
  if (ext === ".xlsx") {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }
  if (ext === ".ppt") return "application/vnd.ms-powerpoint";
  if (ext === ".pptx") {
    return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  }
  if (ext === ".zip") return "application/zip";
  return "application/octet-stream";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storageKey = storageKeySchema.parse(searchParams.get("key"));
    const file = await readUploadedFile(storageKey);
    const fileName = storageKey.split("/").pop() ?? "download";

    return new NextResponse(new Uint8Array(file), {
      status: 200,
      headers: {
        "Content-Type": resolveMimeType(storageKey),
        "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid file key." }, { status: 400 });
    }
    console.error("[uploads:GET] failed:", error);
    return NextResponse.json({ message: "File not found." }, { status: 404 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const scopeRaw = String(formData.get("scope") ?? "registration");
    const scope = scopeSchema.parse(scopeRaw);
    const competitionIdRaw = formData.get("competitionId");
    const competitionId =
      typeof competitionIdRaw === "string" && competitionIdRaw.trim().length > 0
        ? competitionIdRaw.trim()
        : undefined;

    const files = formData
      .getAll("files")
      .filter((item): item is File => item instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ message: "No files uploaded." }, { status: 400 });
    }

    const sessionUser = await getSessionUser();
    if (!sessionUser.id) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    if (!competitionId) {
      return NextResponse.json(
        { message: "competitionId is required for uploads." },
        { status: 400 },
      );
    }

    if (scope !== "registration") {
      if (!isContentManagerRole(sessionUser.role)) {
        return NextResponse.json({ message: "Forbidden." }, { status: 403 });
      }

      assertCanEditCompetitionContent(
        {
          role: sessionUser.role,
          scopedCompetitionIds: sessionUser.scopedCompetitionIds,
        },
        competitionId,
      );
    }

    const uploaded = await uploadFilesService({
      files,
      scope,
      competitionId,
    });

    return NextResponse.json({ files: uploaded }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid upload parameters." }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Upload failed.";
    const isClientError =
      message.includes("not allowed") ||
      message.includes("exceeds limit") ||
      message.includes("Empty file") ||
      message.includes("competitionId is required");
    console.error("[uploads:POST] failed:", error);
    return NextResponse.json({ message }, { status: isClientError ? 400 : 500 });
  }
}
