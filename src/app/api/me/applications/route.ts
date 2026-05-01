import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { listApplicationsByApplicantUserId } from "@/server/repositories/application-repository";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser.id) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const applications = await listApplicationsByApplicantUserId(sessionUser.id);
  return NextResponse.json({ applications, sessionUser });
}
