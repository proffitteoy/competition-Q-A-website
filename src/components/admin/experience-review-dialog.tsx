"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExperienceReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postTitle: string;
  postStatus: string;
  onAction: (
    action: "approve" | "reject" | "offline",
    comment: string,
  ) => Promise<void>;
}

export function ExperienceReviewDialog({
  open,
  onOpenChange,
  postTitle,
  postStatus,
  onAction,
}: ExperienceReviewDialogProps) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAction(action: "approve" | "reject" | "offline") {
    setSubmitting(true);
    try {
      await onAction(action, comment);
      setComment("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>审核文章</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm font-medium">{postTitle}</p>
          <div className="grid gap-2">
            <Label htmlFor="comment">审核意见</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="选填"
            />
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            取消
          </Button>
          {postStatus === "pending_review" && (
            <>
              <Button
                variant="destructive"
                onClick={() => handleAction("reject")}
                disabled={submitting}
              >
                驳回
              </Button>
              <Button
                onClick={() => handleAction("approve")}
                disabled={submitting}
              >
                通过
              </Button>
            </>
          )}
          {postStatus === "published" && (
            <Button
              variant="destructive"
              onClick={() => handleAction("offline")}
              disabled={submitting}
            >
              强制下线
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
