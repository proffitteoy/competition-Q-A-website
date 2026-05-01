"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, X, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UserTitleBadges } from "@/components/profile/user-title-badges";
import type { MeProfileData } from "@/server/repositories/me-profile-repository";
import type { TitleInfo } from "@/server/services/user-title-service";

/* --- PLACEHOLDER_SCHEMA --- */

const profileSchema = z.object({
  name: z.string().min(1, "姓名不能为空").max(100),
  studentNo: z.string().max(64).default(""),
  college: z.string().max(120).default(""),
  major: z.string().max(120).default(""),
  grade: z.string().max(64).default(""),
  phone: z.string().max(64).default(""),
  nickname: z.string().max(100).default(""),
  gender: z.enum(["male", "female", "other", ""]).default(""),
  birthday: z.string().default(""),
  schoolName: z.string().max(200).default(""),
  department: z.string().max(120).default(""),
  enrollmentYear: z.string().default(""),
  educationLevel: z.string().max(64).default(""),
  inSchoolStatus: z.enum(["yes", "no", "graduated", ""]).default(""),
  publicBio: z.string().max(500).default(""),
  publicShowAvatar: z.boolean().default(true),
  publicShowCollegeMajor: z.boolean().default(true),
  publicShowTitles: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

/* --- PLACEHOLDER_HELPERS --- */

const genderLabels: Record<string, string> = {
  male: "男",
  female: "女",
  other: "其他",
};

const inSchoolLabels: Record<string, string> = {
  yes: "在校",
  no: "不在校",
  graduated: "已毕业",
};

function displayValue(value: string | null | undefined, fallback = "未填写") {
  return value?.trim() || fallback;
}

function buildDefaultValues(data: MeProfileData | null): ProfileFormValues {
  return {
    name: data?.user.name ?? "",
    studentNo: data?.user.studentNo ?? "",
    college: data?.user.college ?? "",
    major: data?.user.major ?? "",
    grade: data?.user.grade ?? "",
    phone: data?.user.phone ?? "",
    nickname: data?.profile?.nickname ?? "",
    gender: data?.profile?.gender ?? "",
    birthday: data?.profile?.birthday ?? "",
    schoolName: data?.profile?.schoolName ?? "",
    department: data?.profile?.department ?? "",
    enrollmentYear: data?.profile?.enrollmentYear?.toString() ?? "",
    educationLevel: data?.profile?.educationLevel ?? "",
    inSchoolStatus: data?.profile?.inSchoolStatus ?? "",
    publicBio: data?.profile?.publicBio ?? "",
    publicShowAvatar: data?.profile?.publicShowAvatar ?? true,
    publicShowCollegeMajor: data?.profile?.publicShowCollegeMajor ?? true,
    publicShowTitles: data?.profile?.publicShowTitles ?? true,
  };
}

interface ProfileViewProps {
  initialData: MeProfileData | null;
  titles: TitleInfo[];
}

export function ProfileView({ initialData, titles }: ProfileViewProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(profileSchema) as any,
    defaultValues: buildDefaultValues(initialData),
  });

  async function onSubmit(values: ProfileFormValues) {
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: values.name,
        studentNo: values.studentNo || undefined,
        college: values.college || undefined,
        major: values.major || undefined,
        grade: values.grade || undefined,
        phone: values.phone || undefined,
        nickname: values.nickname || null,
        gender: values.gender || null,
        birthday: values.birthday || null,
        schoolName: values.schoolName || null,
        department: values.department || null,
        enrollmentYear: values.enrollmentYear
          ? Number(values.enrollmentYear)
          : null,
        educationLevel: values.educationLevel || null,
        inSchoolStatus: values.inSchoolStatus || null,
        publicBio: values.publicBio || null,
        publicShowAvatar: values.publicShowAvatar,
        publicShowCollegeMajor: values.publicShowCollegeMajor,
        publicShowTitles: values.publicShowTitles,
      };

      const res = await fetch("/api/me/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "保存失败" }));
        throw new Error(err.message);
      }

      toast.success("个人资料已保存");
      setEditing(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存失败，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    form.reset(buildDefaultValues(initialData));
    setEditing(false);
  }

  const data = initialData;

  if (editing) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-slate-950">编辑个人资料</h1>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={submitting}
              >
                <X className="mr-1 size-4" />
                取消
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                <Save className="mr-1 size-4" />
                {submitting ? "保存中…" : "保存"}
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">基础身份信息</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>姓名</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>昵称</FormLabel>
                    <FormControl>
                      <Input placeholder="选填" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>性别</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">男</SelectItem>
                        <SelectItem value="female">女</SelectItem>
                        <SelectItem value="other">其他</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>出生日期</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">学籍与院系信息</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="studentNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>学号</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="schoolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>学校</FormLabel>
                    <FormControl>
                      <Input placeholder="选填" {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>院系</FormLabel>
                    <FormControl>
                      <Input placeholder="选填" {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enrollmentYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>入学年份</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="如 2023"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="educationLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>最高学历</FormLabel>
                    <FormControl>
                      <Input placeholder="如 本科" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="inSchoolStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>是否在校</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="请选择" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yes">在校</SelectItem>
                        <SelectItem value="no">不在校</SelectItem>
                        <SelectItem value="graduated">已毕业</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">联系方式</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormItem>
                <FormLabel>邮箱</FormLabel>
                <Input
                  value={data?.user.email ?? ""}
                  disabled
                  className="bg-slate-50"
                />
                <p className="text-xs text-slate-400">邮箱不可修改</p>
              </FormItem>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>手机号</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">对外展示信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="publicBio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>个人简介</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="简单介绍自己，最多 500 字"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-medium text-slate-700">公开展示开关</p>
                <FormField
                  control={form.control}
                  name="publicShowAvatar"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel className="text-sm font-normal">
                        公开展示头像
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="publicShowCollegeMajor"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel className="text-sm font-normal">
                        公开展示学院与专业
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="publicShowTitles"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel className="text-sm font-normal">
                        公开展示头衔
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-950">我的信息</h1>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          <Pencil className="mr-1 size-4" />
          编辑
        </Button>
      </div>

      {titles.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">我的头衔</span>
          <UserTitleBadges titles={titles} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">基础身份信息</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-400">姓名</dt>
              <dd className="text-sm text-slate-900">
                {displayValue(data?.user.name)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">昵称</dt>
              <dd className="text-sm text-slate-900">
                {displayValue(data?.profile?.nickname)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">性别</dt>
              <dd className="text-sm text-slate-900">
                {data?.profile?.gender
                  ? genderLabels[data.profile.gender]
                  : "未填写"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">出生日期</dt>
              <dd className="text-sm text-slate-900">
                {displayValue(data?.profile?.birthday)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">学籍与院系信息</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-400">学号</dt>
              <dd className="text-sm text-slate-900">
                {displayValue(data?.user.studentNo)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">学校</dt>
              <dd className="text-sm text-slate-900">
                {displayValue(data?.profile?.schoolName)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">学院</dt>
              <dd className="text-sm text-slate-900">
                {displayValue(data?.user.college)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">院系</dt>
              <dd className="text-sm text-slate-900">
                {displayValue(data?.profile?.department)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">专业</dt>
              <dd className="text-sm text-slate-900">
                {displayValue(data?.user.major)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">年级</dt>
              <dd className="text-sm text-slate-900">
                {displayValue(data?.user.grade)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">入学年份</dt>
              <dd className="text-sm text-slate-900">
                {data?.profile?.enrollmentYear?.toString() ?? "未填写"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">最高学历</dt>
              <dd className="text-sm text-slate-900">
                {displayValue(data?.profile?.educationLevel)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">是否在校</dt>
              <dd className="text-sm text-slate-900">
                {data?.profile?.inSchoolStatus
                  ? inSchoolLabels[data.profile.inSchoolStatus]
                  : "未填写"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">联系方式</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-400">邮箱</dt>
              <dd className="text-sm text-slate-900">
                {displayValue(data?.user.email)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">手机号</dt>
              <dd className="text-sm text-slate-900">
                {displayValue(data?.user.phone)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">对外展示信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <dt className="text-xs text-slate-400">个人简介</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {displayValue(data?.profile?.publicBio)}
            </dd>
          </div>
          <div className="space-y-2 rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-700">公开展示开关</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">公开展示头像</span>
              <span className="text-slate-900">
                {data?.profile?.publicShowAvatar !== false ? "开启" : "关闭"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">公开展示学院与专业</span>
              <span className="text-slate-900">
                {data?.profile?.publicShowCollegeMajor !== false
                  ? "开启"
                  : "关闭"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">公开展示头衔</span>
              <span className="text-slate-900">
                {data?.profile?.publicShowTitles !== false ? "开启" : "关闭"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
