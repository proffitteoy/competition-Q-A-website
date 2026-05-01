import type { PermissionActor } from "@/server/permissions/competition-permissions";
import {
  assertCanAcceptAnswer,
  assertCanAnswer,
  assertCanAskQuestion,
  assertCanComment,
  assertCanDeleteOwnContent,
  assertCanModerateQA,
} from "@/server/permissions/qa-permissions";
import {
  createQuestion,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  type UpdateQuestionInput,
} from "@/server/repositories/question-repository";
import {
  createAnswer,
  acceptAnswer,
  deleteAnswer,
} from "@/server/repositories/answer-repository";
import {
  createComment,
  deleteComment,
} from "@/server/repositories/question-comment-repository";

interface ActorWithId extends PermissionActor {
  userId: string;
}

export async function askQuestionService(input: {
  competitionId: string;
  title: string;
  body: string;
  actor: ActorWithId;
}) {
  assertCanAskQuestion(input.actor);
  return createQuestion({
    competitionId: input.competitionId,
    authorId: input.actor.userId,
    title: input.title,
    body: input.body,
  });
}

export async function answerQuestionService(input: {
  questionId: string;
  body: string;
  actor: ActorWithId;
}) {
  assertCanAnswer(input.actor);

  const question = await getQuestionById(input.questionId);
  if (!question) throw new Error("问题不存在。");
  if (question.status !== "open") throw new Error("该问题已关闭，无法回答。");

  return createAnswer({
    questionId: input.questionId,
    authorId: input.actor.userId,
    body: input.body,
  });
}

export async function addCommentService(input: {
  questionId: string;
  answerId?: string | null;
  parentId?: string | null;
  body: string;
  actor: ActorWithId;
}) {
  assertCanComment(input.actor);

  const question = await getQuestionById(input.questionId);
  if (!question) throw new Error("问题不存在。");

  return createComment({
    questionId: input.questionId,
    answerId: input.answerId,
    parentId: input.parentId,
    authorId: input.actor.userId,
    body: input.body,
  });
}

export async function acceptAnswerService(input: {
  answerId: string;
  questionId: string;
  actor: ActorWithId;
}) {
  const question = await getQuestionById(input.questionId);
  if (!question) throw new Error("问题不存在。");

  assertCanAcceptAnswer(input.actor, question.authorId);
  return acceptAnswer(input.answerId, input.questionId);
}

type ModerateAction = "close" | "reopen" | "hide" | "pin" | "unpin";

export async function moderateQuestionService(input: {
  questionId: string;
  competitionId: string;
  action: ModerateAction;
  actor: ActorWithId;
}) {
  assertCanModerateQA(input.actor, input.competitionId);

  const updates: UpdateQuestionInput = {};
  switch (input.action) {
    case "close":
      updates.status = "closed";
      break;
    case "reopen":
      updates.status = "open";
      break;
    case "hide":
      updates.status = "hidden";
      break;
    case "pin":
      updates.isPinned = true;
      break;
    case "unpin":
      updates.isPinned = false;
      break;
  }

  return updateQuestion(input.questionId, updates);
}

export async function deleteQuestionService(input: {
  questionId: string;
  competitionId: string;
  actor: ActorWithId;
}) {
  const question = await getQuestionById(input.questionId);
  if (!question) throw new Error("问题不存在。");

  assertCanDeleteOwnContent(input.actor, question.authorId, input.competitionId);
  return deleteQuestion(input.questionId);
}

export async function deleteAnswerService(input: {
  answerId: string;
  questionId: string;
  competitionId: string;
  answerAuthorId: string;
  actor: ActorWithId;
}) {
  assertCanDeleteOwnContent(input.actor, input.answerAuthorId, input.competitionId);
  return deleteAnswer(input.answerId, input.questionId);
}

export async function deleteCommentService(input: {
  commentId: string;
  competitionId: string;
  commentAuthorId: string;
  actor: ActorWithId;
}) {
  assertCanDeleteOwnContent(input.actor, input.commentAuthorId, input.competitionId);
  return deleteComment(input.commentId);
}
