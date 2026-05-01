import type { UserRole } from "@/lib/types";

export interface PermissionActor {
  role: UserRole;
  scopedCompetitionIds?: string[];
}

function hasCompetitionScope(
  actor: PermissionActor,
  competitionId: string | undefined,
) {
  if (actor.role === "super_admin") {
    return true;
  }

  if (!competitionId) {
    return false;
  }

  if (!actor.scopedCompetitionIds || actor.scopedCompetitionIds.length === 0) {
    return false;
  }

  return actor.scopedCompetitionIds.includes(competitionId);
}

export function assertCanReviewApplications(
  actor: PermissionActor,
  competitionId?: string,
) {
  if (actor.role !== "super_admin" && actor.role !== "competition_admin") {
    throw new Error("当前角色无权执行报名审核");
  }
  if (!hasCompetitionScope(actor, competitionId)) {
    throw new Error("当前角色不在该比赛作用域内，无法审核该报名");
  }
}

export function assertCanManageCompetitions(
  actor: PermissionActor,
  competitionId?: string,
) {
  if (actor.role !== "super_admin" && actor.role !== "competition_admin") {
    throw new Error("当前角色无权管理比赛");
  }
  if (!hasCompetitionScope(actor, competitionId)) {
    throw new Error("当前角色不在该比赛作用域内，无法管理该比赛");
  }
}

export function assertCanEditCompetitionContent(
  actor: PermissionActor,
  competitionId: string,
) {
  if (
    actor.role !== "super_admin" &&
    actor.role !== "competition_admin" &&
    actor.role !== "content_editor"
  ) {
    throw new Error("当前角色无权编辑比赛内容");
  }

  if (!hasCompetitionScope(actor, competitionId)) {
    throw new Error("当前角色不在该比赛作用域内，无法编辑该比赛内容");
  }
}
