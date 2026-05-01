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

interface StatusDistributionRow {
  status: "submitted" | "approved" | "rejected" | "withdrawn" | "cancelled" | "draft";
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

function countRecentSubmissions(submittedAtList: string[], days: number) {
  const now = Date.now();
  const threshold = now - days * 24 * 60 * 60 * 1000;

  return submittedAtList.reduce((count, value) => {
    const date = parseDate(value);
    if (!date) return count;
    return date.getTime() >= threshold && date.getTime() <= now ? count + 1 : count;
  }, 0);
}

function buildStatusDistribution(
  statuses: Array<
    "draft" | "submitted" | "approved" | "rejected" | "withdrawn" | "cancelled"
  >,
): StatusDistributionRow[] {
  const map = new Map<StatusDistributionRow["status"], number>([
    ["draft", 0],
    ["submitted", 0],
    ["approved", 0],
    ["rejected", 0],
    ["withdrawn", 0],
    ["cancelled", 0],
  ]);

  for (const status of statuses) {
    map.set(status, (map.get(status) ?? 0) + 1);
  }

  return [...map.entries()].map(([status, total]) => ({ status, total }));
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

  const scopeIds =
    sessionUser.role === "super_admin"
      ? null
      : new Set(sessionUser.scopedCompetitionIds);

  const visibleCompetitions =
    scopeIds === null
      ? competitions
      : competitions.filter((item) => scopeIds.has(item.id));

  const visibleApplications =
    scopeIds === null
      ? applications
      : applications.filter((item) => scopeIds.has(item.competitionId));

  const visibleNotices =
    scopeIds === null
      ? notices
      : notices.filter((item) => scopeIds.has(item.competitionId));

  const reviewTrend = buildWeeklyTrend(
    visibleApplications.map((item) => item.submittedAt),
  );
  const statusDistribution = buildStatusDistribution(
    visibleApplications.map((item) => item.status),
  );
  const approvedCount = visibleApplications.filter(
    (item) => item.status === "approved",
  ).length;
  const rejectedCount = visibleApplications.filter(
    (item) => item.status === "rejected",
  ).length;
  const reviewClosedCount = approvedCount + rejectedCount;
  const approvalRate =
    reviewClosedCount === 0
      ? 0
      : Math.round((approvedCount / reviewClosedCount) * 100);

  return NextResponse.json({
    stats: {
      competitions: visibleCompetitions.length,
      applications: visibleApplications.length,
      notices: visibleNotices.length,
      users:
        sessionUser.role === "super_admin"
          ? users.length
          : new Set(visibleApplications.map((item) => item.applicantName)).size,
      activeCompetitions: visibleCompetitions.filter((item) =>
        ["registration_open", "upcoming", "in_progress"].includes(item.status),
      ).length,
      pendingReviews: visibleApplications.filter((item) => item.status === "submitted")
        .length,
      thisWeekSubmissions: countRecentSubmissions(
        visibleApplications.map((item) => item.submittedAt),
        7,
      ),
      approvalRate,
    },
    reviewTrend,
    statusDistribution,
  });
}
