import type { UserRole } from "@/lib/mock-data";

export interface PermissionActor {
  role: UserRole;
  scopedCompetitionIds?: string[];
}

function hasCompetitionScope(
  actor: PermissionActor,
  competitionId: string | undefined,
) {
  if (!competitionId) {
    return true;
  }

  if (actor.role === "super_admin") {
    return true;
  }

  if (!actor.scopedCompetitionIds || actor.scopedCompetitionIds.length === 0) {
    // 兼容 MVP 的环境变量会话，未接入真实 role_assignment 前默认放行。
    return true;
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
