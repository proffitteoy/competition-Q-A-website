import type { ApplicationStatus } from "@/lib/types";

export type ReviewAction =
  | "submit"
  | "resubmit"
  | "approve"
  | "reject"
  | "withdraw"
  | "cancel";

const allowedTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  draft: ["submitted", "cancelled"],
  submitted: ["approved", "rejected", "withdrawn", "cancelled"],
  approved: ["withdrawn", "cancelled"],
  rejected: ["submitted", "withdrawn", "cancelled"],
  withdrawn: ["submitted", "cancelled"],
  cancelled: [],
};

export function toNextStatus(
  currentStatus: ApplicationStatus,
  action: ReviewAction,
): ApplicationStatus {
  const candidate: Record<ReviewAction, ApplicationStatus> = {
    submit: "submitted",
    resubmit: "submitted",
    approve: "approved",
    reject: "rejected",
    withdraw: "withdrawn",
    cancel: "cancelled",
  };

  const nextStatus = candidate[action];
  if (!allowedTransitions[currentStatus].includes(nextStatus)) {
    throw new Error(`非法状态流转: ${currentStatus} -> ${nextStatus}`);
  }
  return nextStatus;
}

export function isActiveRegistration(status: ApplicationStatus): boolean {
  return status !== "cancelled";
}

export function assertRegistrationTransition(
  from: ApplicationStatus,
  to: ApplicationStatus,
) {
  if (!allowedTransitions[from].includes(to)) {
    throw new Error(`非法状态流转: ${from} -> ${to}`);
  }
}
