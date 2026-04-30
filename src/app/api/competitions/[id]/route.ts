import { NextResponse } from "next/server";

import { getCompetitionById } from "@/server/repositories/competition-repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const competition = await getCompetitionById(id);
  if (!competition) {
    return NextResponse.json({ message: "比赛不存在" }, { status: 404 });
  }
  return NextResponse.json({ competition });
}

