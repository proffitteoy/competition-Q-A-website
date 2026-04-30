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
}

export function ApplicationReviewDialog({
  application,
}: ApplicationReviewDialogProps) {
  const [note, setNote] = useState(application.note);

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
            placeholder="填写审核意见或需要补充的材料说明。"
          />
        </div>
        <DialogFooter className="flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              toast.info("已记录为待补充", {
                description: `${application.applicantName} 需要根据意见补充材料。`,
              })
            }
          >
            驳回并补充
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.warning("记录已撤回到人工复核队列", {
                description: `${application.competitionTitle} 的该条申请已转入复核。`,
              })
            }
          >
            撤回审核
          </Button>
          <Button
            onClick={() =>
              toast.success("Mock 审核通过", {
                description: `${application.applicantName} 的报名记录已标记为通过。`,
              })
            }
          >
            审核通过
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
