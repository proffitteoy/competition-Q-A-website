import { NextResponse } from "next/server";

import { listCompetitions } from "@/server/repositories/competition-repository";

export async function GET() {
  const competitions = await listCompetitions();
  return NextResponse.json({ competitions });
}

