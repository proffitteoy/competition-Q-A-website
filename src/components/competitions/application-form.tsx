"use client";

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
  grade: z.string().min(2, "请填写年级"),
  phone: z.string().min(6, "请填写联系电话"),
  email: z.string().email("请输入有效邮箱"),
  teamName: z.string().optional(),
  statement: z.string().min(12, "请至少填写 12 个字的参赛说明"),
});

type ApplicationValues = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  competition: Competition;
}

export function ApplicationForm({ competition }: ApplicationFormProps) {
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

  const onSubmit = (values: ApplicationValues) => {
    toast.success("报名表已提交到 Mock 流程", {
      description: `${values.applicantName} 已提交 ${competition.title} 的报名信息。`,
    });
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
                        <Input placeholder="例如：张雨桐" {...field} />
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
                        <Input placeholder="数学学院" {...field} />
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
                        <Input placeholder="信息与计算科学" {...field} />
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
                        <Input placeholder="yourname@stu.example" {...field} />
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
                        <Input placeholder="例如：数模冲刺队" {...field} />
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
                        placeholder="填写参赛动机、项目方向、基础能力和需要补充说明的情况。"
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
                  hint="第一版骨架先用原生文件输入，后续再切换到 react-dropzone。"
                  multiple
                />
                <FileUpload
                  label="封面或证明材料"
                  hint="如比赛需要，可在此上传项目摘要、证明截图或作品封面。"
                  accept="image/*,.pdf"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit">提交报名</Button>
                <Button type="button" variant="outline">
                  暂存草稿
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
            <p>同一学生同一比赛默认限制重复报名，后续会在真实后端中做唯一校验。</p>
            <p>团队报名需要补充队员名单与分工，当前骨架先保留团队名称和材料上传入口。</p>
            <p>提交后可在“我的报名”中查看审核状态、审核意见和补交提示。</p>
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
