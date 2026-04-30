"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Competition } from "@/lib/mock-data";
import type { UploadedFileMeta } from "@/lib/storage/types";

import { FileUpload } from "../forms/file-upload";

const applicationSchema = z.object({
  applicantName: z.string().min(2, "Please enter your name."),
  studentId: z.string().min(6, "Please enter a valid student ID."),
  college: z.string().min(2, "Please enter your college."),
  major: z.string().min(2, "Please enter your major."),
  grade: z.string().min(1, "Please enter your grade."),
  phone: z.string().min(6, "Please enter your phone number."),
  email: z.string().email("Please enter a valid email address."),
  teamName: z.string().optional(),
  statement: z.string().min(12, "Please provide at least 12 characters."),
});

type ApplicationValues = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  competition: Competition;
}

async function uploadAttachments(input: {
  files: File[];
  competitionId: string;
}): Promise<UploadedFileMeta[]> {
  if (input.files.length === 0) {
    return [];
  }

  const formData = new FormData();
  formData.set("scope", "registration");
  formData.set("competitionId", input.competitionId);
  for (const file of input.files) {
    formData.append("files", file);
  }

  const response = await fetch("/api/uploads", {
    method: "POST",
    body: formData,
  });
  const payload = (await response.json()) as {
    files?: UploadedFileMeta[];
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload.message ?? "Failed to upload attachments.");
  }

  return payload.files ?? [];
}

export function ApplicationForm({ competition }: ApplicationFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [materialFiles, setMaterialFiles] = useState<File[]>([]);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);

  const form = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      applicantName: "",
      studentId: "",
      college: "",
      major: "",
      grade: "",
      phone: "",
      email: "",
      teamName: "",
      statement: "",
    },
  });

  const onSubmit = async (values: ApplicationValues) => {
    if (competition.registrationMode === "team" && !values.teamName?.trim()) {
      form.setError("teamName", {
        message: "Team mode requires a team name.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const attachments = await uploadAttachments({
        files: [...materialFiles, ...extraFiles],
        competitionId: competition.id,
      });

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          competitionId: competition.id,
          competitionTitle: competition.title,
          applicantName: values.applicantName,
          studentId: values.studentId,
          college: values.college,
          major: values.major,
          grade: values.grade,
          phone: values.phone,
          email: values.email,
          statement: values.statement,
          teamName:
            competition.registrationMode === "team"
              ? values.teamName?.trim() ?? ""
              : undefined,
          attachments,
          mode: competition.registrationMode,
        }),
      });
      const payload = (await response.json()) as {
        message?: string;
        application?: { id: string };
      };
      if (!response.ok) {
        throw new Error(payload.message ?? "Application submission failed.");
      }

      toast.success("Application submitted.", {
        description: `Application ID: ${payload.application?.id ?? "Created"}`,
      });
      form.reset();
      setMaterialFiles([]);
      setExtraFiles([]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Application submission failed.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>Application Form</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="applicantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Student name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student ID</FormLabel>
                      <FormControl>
                        <Input placeholder="2023123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="college"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College</FormLabel>
                      <FormControl>
                        <Input placeholder="School / College" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="major"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Major</FormLabel>
                      <FormControl>
                        <Input placeholder="Major" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>
                      <FormControl>
                        <Input placeholder="2023" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="13800000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="name@stu.example.edu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {competition.registrationMode === "team" ? (
                <FormField
                  control={form.control}
                  name="teamName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Team name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              <FormField
                control={form.control}
                name="statement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statement</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder="Describe your motivation and project direction."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4">
                <FileUpload
                  label="Application Files"
                  hint="Upload required registration files."
                  multiple
                  onFilesChange={setMaterialFiles}
                />
                <FileUpload
                  label="Additional Files"
                  hint="Optional uploads such as screenshots or supplementary PDFs."
                  accept="image/*,.pdf"
                  onFilesChange={setExtraFiles}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Application"}
                </Button>
                <Button type="button" variant="outline" disabled>
                  Save Draft (TODO)
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>One student can only keep one active application per competition.</p>
            <p>Team mode uses the submitter as the initial team leader record.</p>
            <p>
              After submission, you can track status and review comments in My
              Applications.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Registration Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <Select defaultValue={competition.registrationMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="team">Team</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
