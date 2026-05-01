import { NextResponse } from "next/server";
import { z } from "zod";

import { isContentManagerRole } from "@/lib/auth/authorization";
import { getSessionUser } from "@/lib/auth/session";
import { assertCanEditCompetitionContent } from "@/server/permissions/competition-permissions";
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
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
