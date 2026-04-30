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
import type { UserRole } from "@/lib/mock-data";

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
  super_admin: "super_admin",
  competition_admin: "competition_admin",
  content_editor: "content_editor",
  student_user: "student_user",
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
        throw new Error(payload.message ?? "Failed to load users.");
      }

      setUsers(payload.users ?? []);
      setCompetitions(payload.competitions ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load users.";
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
          throw new Error(payload.message ?? "Failed to load users.");
        }

        if (!cancelled) {
          setUsers(payload.users ?? []);
          setCompetitions(payload.competitions ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load users.";
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
      toast.error("Please select a competition scope for this role.");
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
        throw new Error(payload.message ?? "Failed to update user.");
      }

      toast.success("User updated.");
      cancelEdit();
      await loadUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update user.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  const columns: ColumnDef<AdminUserRecord>[] = [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "primaryRole",
      header: "Role",
      cell: ({ row }) => <Badge variant="outline">{roleLabel[row.original.primaryRole]}</Badge>,
    },
    {
      accessorKey: "college",
      header: "College",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      id: "scope",
      header: "Scope",
      cell: ({ row }) => {
        const scoped = row.original.roleAssignments
          .filter((item) => item.scopeType === "competition")
          .map((item) => item.competitionTitle ?? item.competitionId ?? "-");
        return scoped.length > 0 ? scoped.join(", ") : "global";
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => startEdit(row.original)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="px-4 lg:px-6">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Users"
          title="User and Role Management"
          description="Manage user status and role scope through real API data."
        />

        {editingUserId ? (
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Edit User</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Status</Label>
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
                    <SelectItem value="active">active</SelectItem>
                    <SelectItem value="pending_verification">pending_verification</SelectItem>
                    <SelectItem value="disabled">disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
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
                    <SelectItem value="super_admin">super_admin</SelectItem>
                    <SelectItem value="competition_admin">competition_admin</SelectItem>
                    <SelectItem value="content_editor">content_editor</SelectItem>
                    <SelectItem value="student_user">student_user</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Competition Scope</Label>
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
                    <SelectItem value="__none__">No scope</SelectItem>
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
                  {submitting ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" onClick={cancelEdit} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <AdminDataTable
          data={users}
          columns={columns}
          searchPlaceholder="Search by name, email, role, college, or status"
          emptyLabel={loading ? "Loading users..." : "No user records"}
        />
      </div>
    </div>
  );
}
