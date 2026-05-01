"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface HallOfFameFormData {
  userId: string;
  tag: string;
  bio: string;
  adminBio?: string | null;
  status: "candidate" | "active" | "hidden";
  displayOrder: number;
}

interface HallOfFameEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: HallOfFameFormData;
  onSave: (data: HallOfFameFormData) => Promise<void>;
  isEdit: boolean;
}

export function HallOfFameEditDialog({
  open,
  onOpenChange,
  defaultValues,
  onSave,
  isEdit,
}: HallOfFameEditDialogProps) {
  const [userId, setUserId] = useState(defaultValues?.userId ?? "");
  const [tag, setTag] = useState(defaultValues?.tag ?? "");
  const [bio, setBio] = useState(defaultValues?.bio ?? "");
  const [adminBio, setAdminBio] = useState(defaultValues?.adminBio ?? "");
  const [status, setStatus] = useState<"candidate" | "active" | "hidden">(
    defaultValues?.status ?? "candidate",
  );
  const [displayOrder, setDisplayOrder] = useState(
    defaultValues?.displayOrder ?? 0,
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setUserId(defaultValues?.userId ?? "");
      setTag(defaultValues?.tag ?? "");
      setBio(defaultValues?.bio ?? "");
      setAdminBio(defaultValues?.adminBio ?? "");
      setStatus(defaultValues?.status ?? "candidate");
      setDisplayOrder(defaultValues?.displayOrder ?? 0);
    }
  }, [open, defaultValues]);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await onSave({
        userId,
        tag,
        bio,
        adminBio: adminBio || null,
        status,
        displayOrder,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑名人堂成员" : "添加名人堂成员"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!isEdit && (
            <div className="grid gap-2">
              <Label htmlFor="userId">用户 ID</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="UUID 格式"
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="tag">标签</Label>
            <Input
              id="tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="如「国赛一等奖」"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">简介</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="adminBio">管理员备注</Label>
            <Textarea
              id="adminBio"
              value={adminBio}
              onChange={(e) => setAdminBio(e.target.value)}
              rows={2}
              placeholder="选填，可覆盖学生自填简介"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>状态</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="candidate">候选</SelectItem>
                  <SelectItem value="active">展示中</SelectItem>
                  <SelectItem value="hidden">隐藏</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="displayOrder">排序</Label>
              <Input
                id="displayOrder"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "保存中…" : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
