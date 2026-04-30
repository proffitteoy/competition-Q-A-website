import { and, eq, inArray } from "drizzle-orm";

import type { CompetitionStatus, UserRole } from "@/lib/mock-data";
import { getDb } from "@/lib/db/client";
import {
  competitionStatusLogs,
  competitions,
  registrations,
  registrationAuditLogs,
} from "@/lib/db/schema";
import { assertCanManageCompetitions } from "@/server/permissions/competition-permissions";

const ACTIVE_REGISTRATION_STATUSES = [
  "draft",
  "submitted",
  "approved",
  "rejected",
  "withdrawn",
] as const;

const competitionTransitions: Record<CompetitionStatus, CompetitionStatus[]> = {
  draft: ["upcoming", "archived"],
  upcoming: ["draft", "registration_open", "archived"],
  registration_open: ["in_progress", "finished", "archived"],
  in_progress: ["finished"],
  finished: ["archived"],
  archived: [],
};

export function assertCompetitionTransition(
  from: CompetitionStatus,
  to: CompetitionStatus,
) {
  if (!competitionTransitions[from].includes(to)) {
    throw new Error(`非法比赛状态流转: ${from} -> ${to}`);
  }
}

interface ChangeCompetitionStatusInput {
  competitionId: string;
  toStatus: CompetitionStatus;
  reason: string;
  operator: {
    userId?: string;
    role: UserRole;
    scopedCompetitionIds?: string[];
  };
}

export async function changeCompetitionStatusService(
  input: ChangeCompetitionStatusInput,
) {
  const db = getDb();

  assertCanManageCompetitions(
    {
      role: input.operator.role,
      scopedCompetitionIds: input.operator.scopedCompetitionIds,
    },
    input.competitionId,
  );

  const current = await db.query.competitions.findFirst({
    where: eq(competitions.id, input.competitionId),
  });
  if (!current) {
    throw new Error("比赛不存在");
  }

  assertCompetitionTransition(current.status, input.toStatus);

  if (
    current.status === "registration_open" &&
    input.toStatus === "archived" &&
    input.operator.role !== "super_admin"
  ) {
    throw new Error("仅 super_admin 可执行比赛异常终止");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(competitions)
      .set({
        status: input.toStatus,
        updatedAt: new Date(),
      })
      .where(eq(competitions.id, input.competitionId));

    await tx.insert(competitionStatusLogs).values({
      competitionId: input.competitionId,
      fromStatus: current.status,
      toStatus: input.toStatus,
      operatorUserId: input.operator.userId ?? null,
      operatorRole:
        input.operator.role === "student_user"
          ? "competition_admin"
          : input.operator.role,
      reason: input.reason,
    });

    if (current.status === "registration_open" && input.toStatus === "archived") {
      const activeRegistrations = await tx
        .select({
          id: registrations.id,
          status: registrations.status,
        })
        .from(registrations)
        .where(
          and(
            eq(registrations.competitionId, input.competitionId),
            inArray(registrations.status, [...ACTIVE_REGISTRATION_STATUSES]),
          ),
        );

      if (activeRegistrations.length > 0) {
        await tx
          .update(registrations)
          .set({
            status: "cancelled",
            latestReviewComment: input.reason,
            lastReviewedAt: new Date(),
            lastReviewedBy: input.operator.userId ?? null,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(registrations.competitionId, input.competitionId),
              inArray(registrations.status, [...ACTIVE_REGISTRATION_STATUSES]),
            ),
          );

        await tx.insert(registrationAuditLogs).values(
          activeRegistrations.map((item) => ({
            registrationId: item.id,
            fromStatus: item.status,
            toStatus: "cancelled" as const,
            action: "system_cancel" as const,
            operatorUserId: input.operator.userId ?? null,
            operatorRole:
              input.operator.role === "student_user"
                ? "competition_admin"
                : input.operator.role,
            comment: input.reason,
          })),
        );
      }
    }
  });

  return {
    competitionId: input.competitionId,
    fromStatus: current.status,
    toStatus: input.toStatus,
  };
}
