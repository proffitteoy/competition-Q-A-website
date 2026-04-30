"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Input,
} from "@/components/ui/input";
import { cn } from "@/lib/utils";

const loginFormSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少需要 6 位"),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm1({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: LoginFormValues) {
    console.log("Login attempt:", data);
    toast.success("登录请求已提交，认证逻辑将在后续阶段接入。");
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">欢迎登录</CardTitle>
          <CardDescription>
            使用校园邮箱登录，查看比赛、报名记录与审核进度
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邮箱</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="name@college.edu.cn"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel>密码</FormLabel>
                          <a
                            href="/forgot-password"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                          >
                            忘记密码？
                          </a>
                        </div>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full cursor-pointer">
                    登录
                  </Button>

                  <Button variant="outline" className="w-full" type="button" disabled>
                    学校统一认证（预留）
                  </Button>
                </div>
                <div className="text-center text-sm">
                  还没有账号？{" "}
                  <a href="/sign-up" className="underline underline-offset-4">
                    创建学生账号
                  </a>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        当前为纯前端 Mock 骨架，后续将接入 <a href="#">统一认证</a>、<a href="#">微信绑定</a> 与账号状态校验。
      </div>
    </div>
  );
}
