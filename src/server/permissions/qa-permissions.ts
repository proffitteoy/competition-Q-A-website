import type { PermissionActor } from "./competition-permissions";

function hasCompetitionScope(
  actor: PermissionActor,
  competitionId: string,
) {
  if (actor.role === "super_admin") {
    return true;
  }

  if (!actor.scopedCompetitionIds || actor.scopedCompetitionIds.length === 0) {
    return false;
  }

  return actor.scopedCompetitionIds.includes(competitionId);
}

export function assertCanAskQuestion(actor: PermissionActor) {
  if (!actor.role) {
    throw new Error("请先登录后再提问。");
  }
}

export function assertCanAnswer(actor: PermissionActor) {
  if (!actor.role) {
    throw new Error("请先登录后再回答。");
  }
}

export function assertCanComment(actor: PermissionActor) {
  if (!actor.role) {
    throw new Error("请先登录后再评论。");
  }
}

export function assertCanAcceptAnswer(
  actor: PermissionActor & { userId?: string },
  questionAuthorId: string,
) {
  if (actor.role === "super_admin") return;
  if (actor.userId === questionAuthorId) return;
  throw new Error("只有提问者或管理员可以采纳回答。");
}

export function assertCanModerateQA(
  actor: PermissionActor,
  competitionId: string,
) {
  if (actor.role === "super_admin") return;
  if (
    (actor.role === "competition_admin" || actor.role === "content_editor") &&
    hasCompetitionScope(actor, competitionId)
  ) {
    return;
  }
  throw new Error("当前角色无权管理该比赛的问答内容。");
}

export function assertCanDeleteOwnContent(
  actor: PermissionActor & { userId?: string },
  contentAuthorId: string,
  competitionId: string,
) {
  if (actor.role === "super_admin") return;
  if (actor.userId === contentAuthorId) return;
  if (
    (actor.role === "competition_admin" || actor.role === "content_editor") &&
    hasCompetitionScope(actor, competitionId)
  ) {
    return;
  }
  throw new Error("只能删除自己发布的内容，或由管理员操作。");
}
