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
        throw new Error(payload.message ?? "Failed to load competitions.");
      }
      setCompetitions(payload.competitions ?? []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load competitions.";
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
          throw new Error(payload.message ?? "Failed to load competitions.");
        }
        if (!cancelled) {
          setCompetitions(payload.competitions ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to load competitions.";
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
      toast.error("Please fill all required fields.");
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
          statusReason: editingId ? "Updated from admin panel." : undefined,
        }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Failed to save competition.");
      }

      toast.success(editingId ? "Competition updated." : "Competition created.");
      cancelForm();
      await loadCompetitions();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save competition.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item: Competition) {
    if (!window.confirm(`Delete competition "${item.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/competitions/${item.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "Failed to delete competition.");
      }

      toast.success("Competition deleted.");
      await loadCompetitions();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete competition.";
      toast.error(message);
    }
  }

  const columns: ColumnDef<Competition>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.title}</div>
          <div className="text-xs text-muted-foreground">{row.original.category}</div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <CompetitionStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "registrationWindow",
      header: "Registration Window",
    },
    {
      accessorKey: "department",
      header: "Department",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => startEdit(row.original)}>
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row.original)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="px-4 lg:px-6">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Competitions"
          title="Competition Management"
          description="Manage competition records, status, and registration mode with real API data."
          actions={<Button onClick={startCreate}>New Competition</Button>}
        />

        {showForm ? (
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>{editingId ? "Edit Competition" : "Create Competition"}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="competition-title">Title</Label>
                <Input
                  id="competition-title"
                  value={formValues.title}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="competition-category">Category</Label>
                <Input
                  id="competition-category"
                  value={formValues.category}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, category: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="competition-department">Department</Label>
                <Input
                  id="competition-department"
                  value={formValues.department}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, department: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
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
                    <SelectItem value="draft">draft</SelectItem>
                    <SelectItem value="upcoming">upcoming</SelectItem>
                    <SelectItem value="registration_open">registration_open</SelectItem>
                    <SelectItem value="in_progress">in_progress</SelectItem>
                    <SelectItem value="finished">finished</SelectItem>
                    <SelectItem value="archived">archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="competition-summary">Summary</Label>
                <Input
                  id="competition-summary"
                  value={formValues.summary}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, summary: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Registration Mode</Label>
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
                    <SelectItem value="individual">individual</SelectItem>
                    <SelectItem value="team">team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex flex-wrap gap-3">
                <Button onClick={submitForm} disabled={submitting}>
                  {submitting ? "Saving..." : editingId ? "Save Changes" : "Create"}
                </Button>
                <Button variant="outline" onClick={cancelForm} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <AdminDataTable
          data={competitions}
          columns={columns}
          searchPlaceholder="Search by title, category, or department"
          emptyLabel={loading ? "Loading competitions..." : "No competition records"}
        />
      </div>
    </div>
  );
}
