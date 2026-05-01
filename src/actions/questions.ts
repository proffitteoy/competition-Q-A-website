"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth/session";
import {
  askQuestionService,
  answerQuestionService,
  addCommentService,
  acceptAnswerService,
  moderateQuestionService,
  deleteQuestionService,
  deleteAnswerService,
  deleteCommentService,
} from "@/server/services/question-service";

const askQuestionSchema = z.object({
  competitionId: z.string().min(1),
  title: z.string().min(4, "标题至少 4 个字符").max(255),
  body: z.string().min(10, "正文至少 10 个字符"),
});

const answerQuestionSchema = z.object({
  questionId: z.string().min(1),
  competitionId: z.string().min(1),
  body: z.string().min(10, "回答至少 10 个字符"),
});

const addCommentSchema = z.object({
  questionId: z.string().min(1),
  competitionId: z.string().min(1),
  answerId: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  body: z.string().min(1, "评论不能为空"),
});

const acceptAnswerSchema = z.object({
  answerId: z.string().min(1),
  questionId: z.string().min(1),
  competitionId: z.string().min(1),
});

const moderateSchema = z.object({
  questionId: z.string().min(1),
  competitionId: z.string().min(1),
  action: z.enum(["close", "reopen", "hide", "pin", "unpin"]),
});

const deleteQuestionSchema = z.object({
  questionId: z.string().min(1),
  competitionId: z.string().min(1),
});

const deleteAnswerSchema = z.object({
  answerId: z.string().min(1),
  questionId: z.string().min(1),
  competitionId: z.string().min(1),
  answerAuthorId: z.string().min(1),
});

const deleteCommentSchema = z.object({
  commentId: z.string().min(1),
  competitionId: z.string().min(1),
  commentAuthorId: z.string().min(1),
});

async function getActor() {
  const session = await getSessionUser();
  if (!session.id) throw new Error("请先登录。");
  return {
    userId: session.id,
    role: session.role,
    scopedCompetitionIds: session.scopedCompetitionIds,
  };
}

export async function askQuestionAction(input: unknown) {
  const payload = askQuestionSchema.parse(input);
  const actor = await getActor();
  const question = await askQuestionService({
    ...payload,
    actor,
  });
  revalidatePath(`/competitions/${payload.competitionId}/questions`);
  revalidatePath(`/competitions/${payload.competitionId}`);
  return question;
}

export async function answerQuestionAction(input: unknown) {
  const payload = answerQuestionSchema.parse(input);
  const actor = await getActor();
  const answer = await answerQuestionService({
    questionId: payload.questionId,
    body: payload.body,
    actor,
  });
  revalidatePath(
    `/competitions/${payload.competitionId}/questions/${payload.questionId}`,
  );
  return answer;
}

export async function addCommentAction(input: unknown) {
  const payload = addCommentSchema.parse(input);
  const actor = await getActor();
  const comment = await addCommentService({
    questionId: payload.questionId,
    answerId: payload.answerId,
    parentId: payload.parentId,
    body: payload.body,
    actor,
  });
  revalidatePath(
    `/competitions/${payload.competitionId}/questions/${payload.questionId}`,
  );
  return comment;
}

export async function acceptAnswerAction(input: unknown) {
  const payload = acceptAnswerSchema.parse(input);
  const actor = await getActor();
  const answer = await acceptAnswerService({
    answerId: payload.answerId,
    questionId: payload.questionId,
    actor,
  });
  revalidatePath(
    `/competitions/${payload.competitionId}/questions/${payload.questionId}`,
  );
  return answer;
}

export async function moderateQuestionAction(input: unknown) {
  const payload = moderateSchema.parse(input);
  const actor = await getActor();
  const question = await moderateQuestionService({
    questionId: payload.questionId,
    competitionId: payload.competitionId,
    action: payload.action,
    actor,
  });
  revalidatePath(`/competitions/${payload.competitionId}/questions`);
  revalidatePath(
    `/competitions/${payload.competitionId}/questions/${payload.questionId}`,
  );
  return question;
}

export async function deleteQuestionAction(input: unknown) {
  const payload = deleteQuestionSchema.parse(input);
  const actor = await getActor();
  await deleteQuestionService({
    questionId: payload.questionId,
    competitionId: payload.competitionId,
    actor,
  });
  revalidatePath(`/competitions/${payload.competitionId}/questions`);
  revalidatePath(`/competitions/${payload.competitionId}`);
}

export async function deleteAnswerAction(input: unknown) {
  const payload = deleteAnswerSchema.parse(input);
  const actor = await getActor();
  await deleteAnswerService({
    answerId: payload.answerId,
    questionId: payload.questionId,
    competitionId: payload.competitionId,
    answerAuthorId: payload.answerAuthorId,
    actor,
  });
  revalidatePath(
    `/competitions/${payload.competitionId}/questions/${payload.questionId}`,
  );
}

export async function deleteCommentAction(input: unknown) {
  const payload = deleteCommentSchema.parse(input);
  const actor = await getActor();
  await deleteCommentService({
    commentId: payload.commentId,
    competitionId: payload.competitionId,
    commentAuthorId: payload.commentAuthorId,
    actor,
  });
  revalidatePath(`/competitions/${payload.competitionId}/questions`);
}
