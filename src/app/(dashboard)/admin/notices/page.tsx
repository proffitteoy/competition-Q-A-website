"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { RichTextEditor } from "@/components/forms/rich-text-editor";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type NoticeStatus = "draft" | "published" | "withdrawn";

interface NoticeRecord {
  id: string;
  competitionId: string;
  title: string;
  competition: string;
  status: NoticeStatus;
  updatedAt: string;
  content?: string;
}

interface CompetitionOption {
  id: string;
  title: string;
}

interface NoticeFormValues {
  competitionId: string;
  title: string;
  content: string;
  status: NoticeStatus;
}

const statusLabelMap: Record<NoticeStatus, string> = {
  draft: "草稿",
  published: "已发布",
  withdrawn: "已下线",
};

const defaultFormValues: NoticeFormValues = {
  competitionId: "",
  title: "",
  content: "",
  status: "draft",
};

function stripHtmlTags(value: string) {
  return value
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildExcerpt(content: string | undefined) {
  const plain = stripHtmlTags(content ?? "");
  if (!plain) return "暂无内容";
  return plain.length > 48 ? `${plain.slice(0, 48)}...` : plain;
}

function getDraftStorageKey(editingId: string | null) {
  return `admin-notice-draft:${editingId ?? "new"}`;
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [competitions, setCompetitions] = useState<CompetitionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<NoticeFormValues>(defaultFormValues);

  async function loadData() {
    try {
      const response = await fetch("/api/admin/notices", { cache: "no-store" });
      const payload = (await response.json()) as {
        notices?: NoticeRecord[];
        competitions?: CompetitionOption[];
        message?: string;
      };
      if (!response.ok) {
        throw new Error(payload.message ?? "加载通知失败");
      }
      setNotices(payload.notices ?? []);
      setCompetitions(payload.competitions ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "加载通知失败";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const response = await fetch("/api/admin/notices", { cache: "no-store" });
        const payload = (await response.json()) as {
          notices?: NoticeRecord[];
          competitions?: CompetitionOption[];
          message?: string;
        };
        if (!response.ok) {
          throw new Error(payload.message ?? "加载通知失败");
        }
        if (!cancelled) {
          setNotices(payload.notices ?? []);
          setCompetitions(payload.competitions ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "加载通知失败";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  function openCreateForm() {
    const competitionId = competitions[0]?.id ?? "";
    setEditingId(null);
    setFormValues({
      ...defaultFormValues,
      competitionId,
    });
    setShowForm(true);
  }

  function openEditForm(notice: NoticeRecord) {
    setEditingId(notice.id);
    setFormValues({
      competitionId: notice.competitionId,
      title: notice.title,
      content: notice.content ?? "",
      status: notice.status,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormValues(defaultFormValues);
  }

  function saveDraftToLocal() {
    const draftKey = getDraftStorageKey(editingId);
    window.localStorage.setItem(
      draftKey,
      JSON.stringify({
        ...formValues,
        savedAt: Date.now(),
      }),
    );
    toast.success("草稿已暂存到本地浏览器");
  }

  function restoreDraftFromLocal() {
    const draftKey = getDraftStorageKey(editingId);
    const raw = window.localStorage.getItem(draftKey);
    if (!raw) {
      toast.error("没有可恢复的草稿");
      return;
    }

    try {
      const draft = JSON.parse(raw) as Partial<NoticeFormValues>;
      setFormValues((prev) => ({
        ...prev,
        competitionId: draft.competitionId ?? prev.competitionId,
        title: draft.title ?? prev.title,
        content: draft.content ?? prev.content,
        status: draft.status ?? prev.status,
      }));
      toast.success("草稿已恢复");
    } catch {
      toast.error("草稿内容损坏，恢复失败");
    }
  }

  async function submitForm() {
    if (!formValues.competitionId) {
      toast.error("请选择归属比赛");
      return;
    }

    if (formValues.title.trim().length < 2) {
      toast.error("通知标题至少 2 个字符");
      return;
    }

    if (stripHtmlTags(formValues.content).length < 2) {
      toast.error("通知内容至少 2 个字符");
      return;
    }

    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/notices/${editingId}`
        : "/api/admin/notices";
      const method = editingId ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitionId: formValues.competitionId,
          title: formValues.title.trim(),
          content: formValues.content,
          status: formValues.status,
        }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "保存通知失败");
      }

      window.localStorage.removeItem(getDraftStorageKey(editingId));
      toast.success(editingId ? "通知已更新" : "通知已创建");
      closeForm();
      setLoading(true);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "保存通知失败";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function removeNotice(notice: NoticeRecord) {
    if (!window.confirm(`确认删除通知「${notice.title}」吗？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/notices/${notice.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "删除通知失败");
      }
      toast.success("通知已删除");
      setLoading(true);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "删除通知失败";
      toast.error(message);
    }
  }

  const columns: ColumnDef<NoticeRecord>[] = [
    {
      accessorKey: "title",
      header: "通知标题",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.title}</div>
          <div className="text-xs text-muted-foreground">
            {buildExcerpt(row.original.content)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "competition",
      header: "归属比赛",
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => (
        <Badge variant="outline">{statusLabelMap[row.original.status]}</Badge>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "更新时间",
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditForm(row.original)}
          >
            编辑
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void removeNotice(row.original)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="px-4 lg:px-6">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Notices"
          title="通知管理"
          description="支持比赛归属、富文本内容编辑、发布状态控制与草稿暂存。"
          actions={
            <Button onClick={openCreateForm} disabled={competitions.length === 0}>
              发布通知
            </Button>
          }
        />

        {showForm ? (
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>{editingId ? "编辑通知" : "新建通知"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>归属比赛</Label>
                  <Select
                    value={formValues.competitionId}
                    onValueChange={(value) =>
                      setFormValues((prev) => ({
                        ...prev,
                        competitionId: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择比赛" />
                    </SelectTrigger>
                    <SelectContent>
                      {competitions.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>发布状态</Label>
                  <Select
                    value={formValues.status}
                    onValueChange={(value) =>
                      setFormValues((prev) => ({
                        ...prev,
                        status: value as NoticeStatus,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">草稿</SelectItem>
                      <SelectItem value="published">发布</SelectItem>
                      <SelectItem value="withdrawn">下线</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notice-title">通知标题</Label>
                <Input
                  id="notice-title"
                  value={formValues.title}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>通知内容（富文本）</Label>
                <RichTextEditor
                  value={formValues.content}
                  onChange={(value) =>
                    setFormValues((prev) => ({
                      ...prev,
                      content: value,
                    }))
                  }
                  placeholder="支持加粗、斜体、列表和链接"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => void submitForm()} disabled={saving}>
                  {saving ? "保存中..." : editingId ? "保存修改" : "创建通知"}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={saveDraftToLocal}
                  disabled={saving}
                >
                  暂存草稿
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={restoreDraftFromLocal}
                  disabled={saving}
                >
                  恢复草稿
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <AdminDataTable
          data={notices}
          columns={columns}
          searchPlaceholder="搜索通知标题或归属比赛"
          emptyLabel={loading ? "加载通知中..." : "暂无通知记录"}
        />
      </div>
    </div>
  );
}
