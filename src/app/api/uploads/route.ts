import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth/session";
import { uploadFilesService } from "@/server/services/upload-service";

const scopeSchema = z.enum(["registration", "notice", "competition"]);

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

    // Keep auth access pattern consistent with current MVP.
    await getSessionUser();

    const uploaded = await uploadFilesService({
      files,
      scope,
      competitionId,
    });

    return NextResponse.json({ files: uploaded }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
