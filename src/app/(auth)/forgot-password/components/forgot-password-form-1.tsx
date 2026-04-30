"use client";

import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm1({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">找回密码</CardTitle>
          <CardDescription>
            输入注册邮箱。后续阶段会接入邮件或统一认证找回流程。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              toast.success("重置密码流程待接入。");
            }}
          >
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@college.edu.cn"
                    required
                  />
                </div>
                <Button type="submit" className="w-full cursor-pointer">
                  发送重置链接
                </Button>
              </div>
              <div className="text-center text-sm">
                想起密码了？{" "}
                <a href="/sign-in" className="underline underline-offset-4">
                  返回登录
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
