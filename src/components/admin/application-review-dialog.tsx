"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { ApplicationRecord } from "@/lib/mock-data";

interface ApplicationReviewDialogProps {
  application: ApplicationRecord;
  onUpdated?: () => void;
}

export function ApplicationReviewDialog({
  application,
  onUpdated,
}: ApplicationReviewDialogProps) {
  const [note, setNote] = useState(application.note || "");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const submitReview = async (
    action: "approve" | "reject" | "withdraw" | "cancel",
    fallbackNote: string,
  ) => {
    setLoadingAction(action);
    try {
      const response = await fetch(`/api/admin/applications/${application.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          comment: note.trim() || fallbackNote,
        }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "审核操作失败");
      }

      const actionLabel =
        action === "approve"
          ? "审核通过"
          : action === "reject"
            ? "驳回补充"
            : action === "withdraw"
              ? "撤回审核"
              : "取消报名";
      toast.success(`${actionLabel}已提交`);
      onUpdated?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "审核操作失败";
      toast.error(message);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          审核
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>审核报名记录</DialogTitle>
          <DialogDescription>
            {application.competitionTitle} · {application.applicantName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 text-sm">
          <div className="grid gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/40 p-4 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground">学院 / 专业</p>
              <p className="font-medium">
                {application.college} · {application.major}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">提交时间</p>
              <p className="font-medium">{application.submittedAt}</p>
            </div>
          </div>

          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={5}
            placeholder="填写审核意见或补充说明"
          />
        </div>

        <DialogFooter className="flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={loadingAction !== null}
            onClick={() => submitReview("reject", "请按要求补充报名材料")}
          >
            驳回补充
          </Button>
          <Button
            variant="secondary"
            disabled={loadingAction !== null}
            onClick={() => submitReview("withdraw", "该记录已撤回到学生侧")}
          >
            撤回审核
          </Button>
          <Button
            variant="outline"
            disabled={loadingAction !== null}
            onClick={() => submitReview("cancel", "该记录已由管理员取消")}
          >
            取消报名
          </Button>
          <Button
            disabled={loadingAction !== null}
            onClick={() => submitReview("approve", "审核通过")}
          >
            {loadingAction === "approve" ? "提交中..." : "审核通过"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
