import { NextResponse } from "next/server";

import { isContentManagerRole } from "@/lib/auth/authorization";
import { getSessionUser } from "@/lib/auth/session";
import { listApplications } from "@/server/repositories/application-repository";
import { listCompetitions } from "@/server/repositories/competition-repository";
import { listNotices } from "@/server/repositories/notice-repository";
import { listAdminUsers } from "@/server/repositories/user-repository";

interface TrendRow {
  week: string;
  total: number;
}

function parseDate(value: string) {
  if (!value || value.includes("未") || value === "-") return undefined;
  const normalized = value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

function buildWeeklyTrend(submittedAtList: string[]) {
  const result: TrendRow[] = [
    { week: "W-3", total: 0 },
    { week: "W-2", total: 0 },
    { week: "W-1", total: 0 },
    { week: "W0", total: 0 },
  ];

  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  for (const submittedAt of submittedAtList) {
    const date = parseDate(submittedAt);
    if (!date) continue;

    const diff = now - date.getTime();
    if (diff < 0) continue;
    const weekIndex = Math.floor(diff / weekMs);
    if (weekIndex > 3) continue;

    const bucket = 3 - weekIndex;
    result[bucket].total += 1;
  }

  return result;
}

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!isContentManagerRole(sessionUser.role)) {
    return NextResponse.json({ message: "Forbidden." }, { status: 403 });
  }

  const [competitions, applications, notices, users] = await Promise.all([
    listCompetitions(),
    listApplications(),
    listNotices(),
    listAdminUsers(),
  ]);

  const reviewTrend = buildWeeklyTrend(applications.map((item) => item.submittedAt));

  return NextResponse.json({
    stats: {
      competitions: competitions.length,
      applications: applications.length,
      notices: notices.length,
      users: users.length,
    },
    reviewTrend,
  });
}
