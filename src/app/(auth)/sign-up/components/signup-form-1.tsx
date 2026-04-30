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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const signupFormSchema = z.object({
  name: z.string().min(2, "请输入姓名"),
  studentId: z.string().min(6, "请输入有效学号"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少需要 6 位"),
  confirmPassword: z.string().min(6, "请再次输入密码"),
  terms: z.boolean().refine((value) => value === true, "请先勾选说明"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

export function SignupForm1({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: "",
      studentId: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  function onSubmit(data: SignupFormValues) {
    console.log("Signup attempt:", data);
    toast.success("注册请求已提交，账号创建逻辑将在后续阶段接入。");
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">创建学生账号</CardTitle>
          <CardDescription>
            注册后可提交报名、查看审核进度并沉淀常见问题
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>姓名</FormLabel>
                          <FormControl>
                            <Input placeholder="张三" {...field} />
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
                  </div>
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
                        <FormLabel>密码</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>确认密码</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex items-start space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-0.5"
                          />
                        </FormControl>
                        <FormLabel className="text-sm">
                          我确认提交的信息真实有效，并同意平台使用说明
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full cursor-pointer">
                    创建账号
                  </Button>

                  <Button variant="outline" className="w-full" type="button" disabled>
                    学校统一认证（预留）
                  </Button>
                </div>
                <div className="text-center text-sm">
                  已有账号？{" "}
                  <a href="/sign-in" className="underline underline-offset-4">
                    去登录
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
