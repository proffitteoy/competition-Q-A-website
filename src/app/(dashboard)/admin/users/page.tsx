"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRole } from "@/lib/types";

type UserStatus = "active" | "pending_verification" | "disabled";

interface CompetitionOption {
  id: string;
  title: string;
}

interface AdminRoleAssignmentRecord {
  id: string;
  role: UserRole;
  scopeType: "global" | "competition";
  competitionId: string | null;
  competitionTitle: string | null;
}

interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  college: string;
  status: UserStatus;
  primaryRole: UserRole;
  roleAssignments: AdminRoleAssignmentRecord[];
}

interface EditFormState {
  status: UserStatus;
  role: UserRole;
  competitionId: string;
}

const roleLabel: Record<UserRole, string> = {
  super_admin: "超级管理员",
  competition_admin: "比赛管理员",
  content_editor: "内容编辑",
  student_user: "学生用户",
};

const statusLabel: Record<UserStatus, string> = {
  active: "正常",
  pending_verification: "待验证",
  disabled: "已禁用",
};

const defaultEditFormState: EditFormState = {
  status: "active",
  role: "student_user",
  competitionId: "",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [competitions, setCompetitions] = useState<CompetitionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formState, setFormState] = useState<EditFormState>(defaultEditFormState);

  async function loadUsers() {
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const payload = (await response.json()) as {
        users?: AdminUserRecord[];
        competitions?: CompetitionOption[];
        message?: string;
      };
      if (!response.ok) {
        throw new Error(payload.message ?? "加载用户数据失败");
      }

      setUsers(payload.users ?? []);
      setCompetitions(payload.competitions ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "加载用户数据失败";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const response = await fetch("/api/admin/users", { cache: "no-store" });
        const payload = (await response.json()) as {
          users?: AdminUserRecord[];
          competitions?: CompetitionOption[];
          message?: string;
        };
        if (!response.ok) {
          throw new Error(payload.message ?? "加载用户数据失败");
        }

        if (!cancelled) {
          setUsers(payload.users ?? []);
          setCompetitions(payload.competitions ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "加载用户数据失败";
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

  function startEdit(user: AdminUserRecord) {
    const scopedAssignment = user.roleAssignments.find(
      (item) => item.scopeType === "competition",
    );

    setEditingUserId(user.id);
    setFormState({
      status: user.status,
      role: user.primaryRole,
      competitionId: scopedAssignment?.competitionId ?? "",
    });
  }

  function cancelEdit() {
    setEditingUserId(null);
    setFormState(defaultEditFormState);
  }

  async function submitEdit() {
    if (!editingUserId) {
      return;
    }

    if (
      (formState.role === "competition_admin" || formState.role === "content_editor") &&
      !formState.competitionId
    ) {
      toast.error("当前角色必须选择比赛作用域");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/users/${editingUserId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: formState.status,
          role: formState.role,
          competitionId:
            formState.role === "competition_admin" || formState.role === "content_editor"
              ? formState.competitionId
              : null,
        }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "更新用户失败");
      }

      toast.success("用户信息已更新");
      cancelEdit();
      await loadUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : "更新用户失败";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  const columns: ColumnDef<AdminUserRecord>[] = [
    {
      accessorKey: "name",
      header: "用户",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "primaryRole",
      header: "角色",
      cell: ({ row }) => <Badge variant="outline">{roleLabel[row.original.primaryRole]}</Badge>,
    },
    {
      accessorKey: "college",
      header: "院系",
    },
    {
      accessorKey: "status",
      header: "账号状态",
      cell: ({ row }) => <Badge variant="outline">{statusLabel[row.original.status]}</Badge>,
    },
    {
      id: "scope",
      header: "比赛作用域",
      cell: ({ row }) => {
        const scoped = row.original.roleAssignments
          .filter((item) => item.scopeType === "competition")
          .map((item) => item.competitionTitle ?? item.competitionId ?? "-");
        return scoped.length > 0 ? scoped.join("，") : "全局";
      },
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => startEdit(row.original)}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div className="px-4 lg:px-6">
      <div className="space-y-8">
        <PageHeader
          eyebrow="用户管理"
          title="用户与角色管理"
          description="通过真实 API 管理用户状态、角色与比赛作用域。"
        />

        {editingUserId ? (
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>编辑用户</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>账号状态</Label>
                <Select
                  value={formState.status}
                  onValueChange={(value) =>
                    setFormState((prev) => ({ ...prev, status: value as UserStatus }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">正常</SelectItem>
                    <SelectItem value="pending_verification">待验证</SelectItem>
                    <SelectItem value="disabled">已禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>角色</Label>
                <Select
                  value={formState.role}
                  onValueChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      role: value as UserRole,
                      competitionId:
                        value === "competition_admin" || value === "content_editor"
                          ? prev.competitionId
                          : "",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">超级管理员</SelectItem>
                    <SelectItem value="competition_admin">比赛管理员</SelectItem>
                    <SelectItem value="content_editor">内容编辑</SelectItem>
                    <SelectItem value="student_user">学生用户</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>比赛作用域</Label>
                <Select
                  value={formState.competitionId || "__none__"}
                  onValueChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      competitionId: value === "__none__" ? "" : value,
                    }))
                  }
                  disabled={
                    formState.role !== "competition_admin" &&
                    formState.role !== "content_editor"
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">无作用域</SelectItem>
                    {competitions.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-3 flex flex-wrap gap-3">
                <Button onClick={submitEdit} disabled={submitting}>
                  {submitting ? "保存中..." : "保存"}
                </Button>
                <Button variant="outline" onClick={cancelEdit} disabled={submitting}>
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <AdminDataTable
          data={users}
          columns={columns}
          searchPlaceholder="按姓名、邮箱、角色、院系或状态搜索"
          emptyLabel={loading ? "用户数据加载中..." : "暂无用户记录"}
        />
      </div>
    </div>
  );
}
