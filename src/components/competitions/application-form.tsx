"use client";

import { useEffect, useState } from "react";
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
  applicantName: z.string().min(2, "请输入姓名"),
  studentId: z.string().min(6, "请输入有效学号"),
  college: z.string().min(2, "请输入学院"),
  major: z.string().min(2, "请输入专业"),
  grade: z.string().min(1, "请输入年级"),
  phone: z.string().min(6, "请输入有效手机号"),
  email: z.string().email("请输入有效邮箱地址"),
  teamName: z.string().optional(),
  statement: z.string().min(12, "请至少填写 12 个字符"),
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
    throw new Error(payload.message ?? "上传附件失败");
  }

  return payload.files ?? [];
}

export function ApplicationForm({ competition }: ApplicationFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [materialFiles, setMaterialFiles] = useState<File[]>([]);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const draftStorageKey = `application-draft:${competition.id}`;

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

  useEffect(() => {
    const raw = window.localStorage.getItem(draftStorageKey);
    if (!raw) {
      return;
    }

    try {
      const draft = JSON.parse(raw) as Partial<ApplicationValues> & {
        savedAt?: number;
      };
      form.reset({
        applicantName: draft.applicantName ?? "",
        studentId: draft.studentId ?? "",
        college: draft.college ?? "",
        major: draft.major ?? "",
        grade: draft.grade ?? "",
        phone: draft.phone ?? "",
        email: draft.email ?? "",
        teamName: draft.teamName ?? "",
        statement: draft.statement ?? "",
      });
      toast.success("已恢复本地草稿", {
        description: "附件不会自动恢复，请重新上传。",
      });
    } catch {
      window.localStorage.removeItem(draftStorageKey);
    }
  }, [draftStorageKey, form]);

  const saveDraft = () => {
    const draft = form.getValues();
    window.localStorage.setItem(
      draftStorageKey,
      JSON.stringify({
        ...draft,
        savedAt: Date.now(),
      }),
    );
    toast.success("草稿已暂存", {
      description: "当前只保存表单文本字段，附件需重新上传。",
    });
  };

  const clearDraft = () => {
    window.localStorage.removeItem(draftStorageKey);
    toast.success("本地草稿已清除");
  };

  const onSubmit = async (values: ApplicationValues) => {
    if (competition.registrationMode === "team" && !values.teamName?.trim()) {
      form.setError("teamName", {
        message: "团队报名必须填写团队名称",
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
        throw new Error(payload.message ?? "报名提交失败");
      }

      toast.success("报名提交成功", {
        description: `报名编号：${payload.application?.id ?? "已创建"}`,
      });
      window.localStorage.removeItem(draftStorageKey);
      form.reset();
      setMaterialFiles([]);
      setExtraFiles([]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "报名提交失败";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>报名表单</CardTitle>
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
                      <FormLabel>姓名</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入学生姓名" {...field} />
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
                      <FormLabel>学号</FormLabel>
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
                      <FormLabel>学院</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入学院名称" {...field} />
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
                      <FormLabel>专业</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入专业名称" {...field} />
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
                      <FormLabel>年级</FormLabel>
                      <FormControl>
                        <Input placeholder="如：2023 级" {...field} />
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
                      <FormLabel>手机号</FormLabel>
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
                      <FormLabel>邮箱</FormLabel>
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
                      <FormLabel>团队名称</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入团队名称" {...field} />
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
                    <FormLabel>报名说明</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder="请说明参赛动机、基础能力与项目方向。"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4">
                <FileUpload
                  label="报名材料"
                  hint="请上传报名必需材料。"
                  multiple
                  onFilesChange={setMaterialFiles}
                />
                <FileUpload
                  label="补充材料"
                  hint="可选上传截图、补充说明 PDF 等附件。"
                  accept="image/*,.pdf"
                  onFilesChange={setExtraFiles}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "提交中..." : "提交报名"}
                </Button>
                <Button type="button" variant="outline" onClick={saveDraft} disabled={submitting}>
                  暂存草稿
                </Button>
                <Button type="button" variant="outline" onClick={clearDraft} disabled={submitting}>
                  清除草稿
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>报名说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>同一名学生在同一场比赛中仅可保留一条活跃报名记录。</p>
            <p>团队报名模式下，提交人会作为初始队长记录。</p>
            <p>
              提交后可在“我的报名”中查看状态流转和审核意见。
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>报名模式</CardTitle>
          </CardHeader>
          <CardContent>
            <Select defaultValue={competition.registrationMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">个人报名</SelectItem>
                <SelectItem value="team">团队报名</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
