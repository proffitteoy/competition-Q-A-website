"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { CompetitionStatusBadge } from "@/components/competitions/competition-status-badge";
import { PageHeader } from "@/components/shared/page-header";
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
import type { Competition, CompetitionStatus, RegistrationMode } from "@/lib/mock-data";

interface CompetitionFormValues {
  title: string;
  category: string;
  summary: string;
  department: string;
  registrationMode: RegistrationMode;
  status: CompetitionStatus;
}

const defaultFormValues: CompetitionFormValues = {
  title: "",
  category: "",
  summary: "",
  department: "",
  registrationMode: "individual",
  status: "draft",
};

export default function AdminCompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState<CompetitionFormValues>(defaultFormValues);

  async function loadCompetitions() {
    try {
      const response = await fetch("/api/admin/competitions", {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        competitions?: Competition[];
        message?: string;
      };
      if (!response.ok) {
        throw new Error(payload.message ?? "加载比赛数据失败");
      }
      setCompetitions(payload.competitions ?? []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "加载比赛数据失败";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const response = await fetch("/api/admin/competitions", {
          cache: "no-store",
        });
        const payload = (await response.json()) as {
          competitions?: Competition[];
          message?: string;
        };
        if (!response.ok) {
          throw new Error(payload.message ?? "加载比赛数据失败");
        }
        if (!cancelled) {
          setCompetitions(payload.competitions ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "加载比赛数据失败";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  function startCreate() {
    setEditingId(null);
    setFormValues(defaultFormValues);
    setShowForm(true);
  }

  function startEdit(item: Competition) {
    setEditingId(item.id);
    setFormValues({
      title: item.title,
      category: item.category,
      summary: item.summary,
      department: item.department,
      registrationMode: item.registrationMode,
      status: item.status,
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setFormValues(defaultFormValues);
  }

  async function submitForm() {
    if (
      !formValues.title.trim() ||
      !formValues.category.trim() ||
      !formValues.summary.trim() ||
      !formValues.department.trim()
    ) {
      toast.error("请填写所有必填字段");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId
        ? `/api/admin/competitions/${editingId}`
        : "/api/admin/competitions";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formValues.title.trim(),
          category: formValues.category.trim(),
          summary: formValues.summary.trim(),
          department: formValues.department.trim(),
          registrationMode: formValues.registrationMode,
          status: formValues.status,
          statusReason: editingId ? "后台管理台更新" : undefined,
        }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "保存比赛失败");
      }

      toast.success(editingId ? "比赛已更新" : "比赛已创建");
      cancelForm();
      await loadCompetitions();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "保存比赛失败";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item: Competition) {
    if (!window.confirm(`确认删除比赛「${item.title}」吗？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/competitions/${item.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "删除比赛失败");
      }

      toast.success("比赛已删除");
      await loadCompetitions();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "删除比赛失败";
      toast.error(message);
    }
  }

  const columns: ColumnDef<Competition>[] = [
    {
      accessorKey: "title",
      header: "比赛标题",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.title}</div>
          <div className="text-xs text-muted-foreground">{row.original.category}</div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => <CompetitionStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "registrationWindow",
      header: "报名时间",
    },
    {
      accessorKey: "department",
      header: "主办院系",
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => startEdit(row.original)}>
            编辑
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row.original)}
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
          eyebrow="比赛管理"
          title="竞赛管理"
          description="使用真实 API 管理比赛记录、状态与报名模式。"
          actions={<Button onClick={startCreate}>新建比赛</Button>}
        />

        {showForm ? (
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>{editingId ? "编辑比赛" : "新建比赛"}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="competition-title">比赛标题</Label>
                <Input
                  id="competition-title"
                  value={formValues.title}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="competition-category">比赛分类</Label>
                <Input
                  id="competition-category"
                  value={formValues.category}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, category: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="competition-department">主办院系</Label>
                <Input
                  id="competition-department"
                  value={formValues.department}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, department: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>比赛状态</Label>
                <Select
                  value={formValues.status}
                  onValueChange={(value) =>
                    setFormValues((prev) => ({
                      ...prev,
                      status: value as CompetitionStatus,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="upcoming">即将开始</SelectItem>
                    <SelectItem value="registration_open">报名中</SelectItem>
                    <SelectItem value="in_progress">进行中</SelectItem>
                    <SelectItem value="finished">已结束</SelectItem>
                    <SelectItem value="archived">已归档</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="competition-summary">比赛简介</Label>
                <Input
                  id="competition-summary"
                  value={formValues.summary}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, summary: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>报名模式</Label>
                <Select
                  value={formValues.registrationMode}
                  onValueChange={(value) =>
                    setFormValues((prev) => ({
                      ...prev,
                      registrationMode: value as RegistrationMode,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">个人报名</SelectItem>
                    <SelectItem value="team">团队报名</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-3">
                <Button onClick={submitForm} disabled={submitting}>
                  {submitting ? "保存中..." : editingId ? "保存修改" : "创建比赛"}
                </Button>
                <Button variant="outline" onClick={cancelForm} disabled={submitting}>
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <AdminDataTable
          data={competitions}
          columns={columns}
          searchPlaceholder="按比赛标题、分类或院系搜索"
          emptyLabel={loading ? "比赛数据加载中..." : "暂无比赛记录"}
        />
      </div>
    </div>
  );
}
