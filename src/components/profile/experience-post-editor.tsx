"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const postSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(300),
  competitionTitle: z.string().max(300).default(""),
  awardLevel: z.string().max(120).default(""),
  content: z.string().default(""),
});

type PostFormValues = z.infer<typeof postSchema>;

interface ExperiencePostEditorProps {
  postId?: string;
  defaultValues?: {
    title: string;
    competitionTitle: string;
    awardLevel: string;
    content: string;
  };
}

export function ExperiencePostEditor({
  postId,
  defaultValues,
}: ExperiencePostEditorProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isNew = !postId;

  const form = useForm<PostFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(postSchema) as any,
    defaultValues: defaultValues ?? {
      title: "",
      competitionTitle: "",
      awardLevel: "",
      content: "",
    },
  });

  async function onSave(values: PostFormValues) {
    setSubmitting(true);
    try {
      const payload = {
        title: values.title,
        competitionTitle: values.competitionTitle || null,
        awardLevel: values.awardLevel || null,
        content: values.content,
      };

      const url = isNew
        ? "/api/me/experience-posts"
        : `/api/me/experience-posts/${postId}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "保存失败" }));
        throw new Error(err.message);
      }

      toast.success(isNew ? "文章已创建" : "文章已保存");
      router.push("/me/achievements");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function onSaveAndSubmit(values: PostFormValues) {
    setSubmitting(true);
    try {
      const payload = {
        title: values.title,
        competitionTitle: values.competitionTitle || null,
        awardLevel: values.awardLevel || null,
        content: values.content,
      };

      let id = postId;

      if (isNew) {
        const createRes = await fetch("/api/me/experience-posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!createRes.ok) {
          const err = await createRes
            .json()
            .catch(() => ({ message: "创建失败" }));
          throw new Error(err.message);
        }
        const { data } = await createRes.json();
        id = data.id;
      } else {
        const updateRes = await fetch(`/api/me/experience-posts/${postId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!updateRes.ok) {
          const err = await updateRes
            .json()
            .catch(() => ({ message: "保存失败" }));
          throw new Error(err.message);
        }
      }

      const submitRes = await fetch(
        `/api/me/experience-posts/${id}/submit`,
        { method: "POST" },
      );
      if (!submitRes.ok) {
        const err = await submitRes
          .json()
          .catch(() => ({ message: "提交审核失败" }));
        throw new Error(err.message);
      }

      toast.success("文章已提交审核");
      router.push("/me/achievements");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "操作失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/me/achievements">
            <ArrowLeft className="mr-1 size-4" />
            返回
          </Link>
        </Button>
        <h1 className="text-xl font-semibold text-slate-950">
          {isNew ? "新建经验文章" : "编辑经验文章"}
        </h1>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">文章信息</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>标题</FormLabel>
                    <FormControl>
                      <Input placeholder="文章标题" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="competitionTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>关联竞赛</FormLabel>
                    <FormControl>
                      <Input placeholder="选填，如「数学建模竞赛」" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="awardLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>获奖等级</FormLabel>
                    <FormControl>
                      <Input placeholder="选填，如「国家级一等奖」" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">文章内容</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="在此撰写经验文章内容，支持 HTML 标签..."
                        rows={16}
                        className="font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={form.handleSubmit(onSave)}
            >
              <Save className="mr-1 size-4" />
              {submitting ? "保存中…" : "保存草稿"}
            </Button>
            <Button
              type="button"
              disabled={submitting}
              onClick={form.handleSubmit(onSaveAndSubmit)}
            >
              <Send className="mr-1 size-4" />
              {submitting ? "提交中…" : "保存并提交审核"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
