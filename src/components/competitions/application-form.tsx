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

import { FileUpload } from "../forms/file-upload";

const applicationSchema = z.object({
  applicantName: z.string().min(2, "请填写真实姓名"),
  studentId: z.string().min(6, "请填写学号"),
  college: z.string().min(2, "请填写学院"),
  major: z.string().min(2, "请填写专业"),
  grade: z.string().min(1, "请填写年级"),
  phone: z.string().min(6, "请填写联系电话"),
  email: z.string().email("请输入有效邮箱"),
  teamName: z.string().optional(),
  statement: z.string().min(12, "参赛说明至少 12 个字"),
});

type ApplicationValues = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  competition: Competition;
}

export function ApplicationForm({ competition }: ApplicationFormProps) {
  const [submitting, setSubmitting] = useState(false);
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
    setSubmitting(true);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          competitionId: competition.id,
          competitionTitle: competition.title,
          applicantName: values.applicantName,
          college: values.college,
          major: values.major,
          grade: values.grade,
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
        description: `报名编号：${payload.application?.id ?? "已生成"}`,
      });
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "报名提交失败";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>学生报名表</CardTitle>
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
                        <Input placeholder="例如：张三" {...field} />
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
                        <Input placeholder="信息学院" {...field} />
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
                        <Input placeholder="软件工程" {...field} />
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
                        <Input placeholder="2023 级" {...field} />
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
                        <Input placeholder="例如：创新冲锋队" {...field} />
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
                    <FormLabel>参赛说明</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={6}
                        placeholder="填写参赛动机、项目方向与团队能力。"
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
                  hint="当前 MVP 使用基础上传入口，后续接对象存储。"
                  multiple
                />
                <FileUpload
                  label="补充附件"
                  hint="可选上传项目摘要、证明截图等。"
                  accept="image/*,.pdf"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "提交中..." : "提交报名"}
                </Button>
                <Button type="button" variant="outline" disabled>
                  暂存草稿（待实现）
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>报名提醒</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>同一学生同一比赛不允许重复提交有效报名记录。</p>
            <p>团队报名默认以发起人作为记录主申请人，后续可补成员明细。</p>
            <p>提交后可在“我的报名”查看审核状态与审核意见。</p>
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

