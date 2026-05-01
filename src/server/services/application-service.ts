import type { UserRole } from "@/lib/types";
import {
  bulkReviewApplications,
  type SubmitApplicationInput,
  reviewApplication,
  submitApplication,
} from "@/server/repositories/application-repository";
import {
  assertCanReviewApplications,
  type PermissionActor,
} from "@/server/permissions/competition-permissions";
import {
  assertRegistrationTransition,
  type ReviewAction,
  toNextStatus,
} from "@/server/services/application-status-service";

export async function submitApplicationService(input: SubmitApplicationInput) {
  return submitApplication(input);
}

interface ReviewServiceInput {
  id: string;
  competitionId: string;
  action: ReviewAction;
  operator: {
    userId?: string;
    name: string;
    role: UserRole;
    scopedCompetitionIds?: string[];
  };
  comment: string;
  currentStatus:
    | "draft"
    | "submitted"
    | "approved"
    | "rejected"
    | "withdrawn"
    | "cancelled";
}

export async function reviewApplicationService(input: ReviewServiceInput) {
  const actor: PermissionActor = {
    role: input.operator.role,
    scopedCompetitionIds: input.operator.scopedCompetitionIds,
  };
  assertCanReviewApplications(actor, input.competitionId);
  const nextStatus = toNextStatus(input.currentStatus, input.action);
  assertRegistrationTransition(input.currentStatus, nextStatus);
  return reviewApplication(
    input.id,
    nextStatus,
    {
      userId: input.operator.userId,
      name: input.operator.name,
      role:
        input.operator.role === "super_admin" ? "super_admin" : "competition_admin",
    },
    input.comment,
  );
}

interface BulkReviewServiceInput {
  ids: string[];
  competitionId?: string;
  action: Extract<ReviewAction, "approve" | "reject" | "withdraw" | "cancel">;
  operator: {
    userId?: string;
    name: string;
    role: UserRole;
    scopedCompetitionIds?: string[];
  };
  comment: string;
}

export async function bulkReviewApplicationsService(input: BulkReviewServiceInput) {
  const actor: PermissionActor = {
    role: input.operator.role,
    scopedCompetitionIds: input.operator.scopedCompetitionIds,
  };
  assertCanReviewApplications(actor, input.competitionId);

  const nextStatusMap = {
    approve: "approved",
    reject: "rejected",
    withdraw: "withdrawn",
    cancel: "cancelled",
  } as const;

  const toStatus = nextStatusMap[input.action];
  return bulkReviewApplications({
    ids: input.ids,
    toStatus,
    operator: {
      userId: input.operator.userId,
      name: input.operator.name,
      role:
        input.operator.role === "super_admin" ? "super_admin" : "competition_admin",
    },
    comment: input.comment,
  });
}
