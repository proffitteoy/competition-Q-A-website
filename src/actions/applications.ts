"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth/session";
import {
  getApplicationById,
  listApplicationsByApplicant,
} from "@/server/repositories/application-repository";
import {
  bulkReviewApplicationsService,
  reviewApplicationService,
  submitApplicationService,
} from "@/server/services/application-service";

const submitSchema = z.object({
  competitionId: z.string().min(1),
  competitionTitle: z.string().min(1),
  applicantName: z.string().min(2),
  college: z.string().min(2),
  major: z.string().min(2),
  grade: z.string().min(1),
  mode: z.enum(["individual", "team"]),
});

const reviewSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["approve", "reject", "withdraw", "cancel"]),
  comment: z.string().min(1),
});

const bulkReviewSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  action: z.enum(["approve", "reject", "withdraw", "cancel"]),
  comment: z.string().min(1),
  competitionId: z.string().optional(),
});

export async function submitApplicationAction(input: unknown) {
  const payload = submitSchema.parse(input);
  const application = await submitApplicationService(payload);
  revalidatePath("/me/applications");
  revalidatePath("/admin/applications");
  return application;
}

export async function listMyApplicationsAction() {
  const sessionUser = await getSessionUser();
  return listApplicationsByApplicant(sessionUser.name);
}

export async function reviewApplicationAction(input: unknown) {
  const payload = reviewSchema.parse(input);
  const sessionUser = await getSessionUser();
  const application = await getApplicationById(payload.id);
  if (!application) {
    throw new Error("报名记录不存在");
  }

  const next = await reviewApplicationService({
    id: payload.id,
    competitionId: application.competitionId,
    action: payload.action,
    operator: {
      userId: sessionUser.id,
      name: sessionUser.name,
      role: sessionUser.role,
      scopedCompetitionIds: sessionUser.scopedCompetitionIds,
    },
    comment: payload.comment,
    currentStatus: application.status,
  });

  revalidatePath("/admin/applications");
  revalidatePath("/me/applications");
  return next;
}

export async function bulkReviewApplicationsAction(input: unknown) {
  const payload = bulkReviewSchema.parse(input);
  const sessionUser = await getSessionUser();
  const result = await bulkReviewApplicationsService({
    ...payload,
    operator: {
      userId: sessionUser.id,
      name: sessionUser.name,
      role: sessionUser.role,
      scopedCompetitionIds: sessionUser.scopedCompetitionIds,
    },
  });

  revalidatePath("/admin/applications");
  revalidatePath("/me/applications");
  return result;
}
