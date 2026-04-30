import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { listApplicationsByApplicant } from "@/server/repositories/application-repository";

export async function GET() {
  const sessionUser = await getSessionUser();
  const applications = await listApplicationsByApplicant(sessionUser.name);
  return NextResponse.json({ applications, sessionUser });
}
