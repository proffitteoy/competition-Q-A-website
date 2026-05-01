"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  HallOfFameEditDialog,
  type HallOfFameFormData,
} from "@/components/admin/hall-of-fame-edit-dialog";

interface HallOfFameEntry {
  id: string;
  userId: string;
  userName: string;
  college: string | null;
  tag: string;
  bio: string;
  adminBio: string | null;
  status: string;
  displayOrder: number;
}

const statusLabels: Record<string, string> = {
  candidate: "候选",
  active: "展示中",
  hidden: "隐藏",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive"> =
  {
    candidate: "secondary",
    active: "default",
    hidden: "destructive",
  };

export default function AdminHallOfFamePage() {
  const [entries, setEntries] = useState<HallOfFameEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HallOfFameEntry | null>(null);

  async function fetchEntries() {
    try {
      const res = await fetch("/api/admin/hall-of-fame");
      if (!res.ok) throw new Error();
      const { data } = await res.json();
      setEntries(data);
    } catch {
      toast.error("获取名人堂列表失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEntries();
  }, []);

  async function handleSave(data: HallOfFameFormData) {
    try {
      const url = editing
        ? `/api/admin/hall-of-fame/${editing.id}`
        : "/api/admin/hall-of-fame";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "操作失败" }));
        throw new Error(err.message);
      }
      toast.success(editing ? "已更新" : "已创建");
      setDialogOpen(false);
      setEditing(null);
      fetchEntries();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "操作失败");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除此名人堂条目？")) return;
    try {
      const res = await fetch(`/api/admin/hall-of-fame/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("已删除");
      fetchEntries();
    } catch {
      toast.error("删除失败");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader eyebrow="后台管理" title="名人堂管理" />
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-1 size-4" />
          添加成员
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">加载中…</p>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            暂无名人堂成员
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{entry.userName}</span>
                    <Badge variant={statusVariants[entry.status] ?? "secondary"}>
                      {statusLabels[entry.status] ?? entry.status}
                    </Badge>
                    <Badge variant="outline">{entry.tag}</Badge>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {entry.college ?? "未填写学院"} · 排序: {entry.displayOrder}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(entry);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="mr-1 size-3.5" />
                    编辑
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(entry.id)}
                  >
                    <Trash2 className="mr-1 size-3.5" />
                    删除
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <HallOfFameEditDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        defaultValues={
          editing
            ? {
                userId: editing.userId,
                tag: editing.tag,
                bio: editing.bio,
                adminBio: editing.adminBio ?? "",
                status: editing.status as "candidate" | "active" | "hidden",
                displayOrder: editing.displayOrder,
              }
            : undefined
        }
        onSave={handleSave}
        isEdit={!!editing}
      />
    </div>
  );
}
