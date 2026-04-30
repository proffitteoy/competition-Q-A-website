"use client";

import { AuthStatusPanel } from "@/components/shared/auth-status-panel";

export function ForbiddenError() {
  return (
    <AuthStatusPanel
      code="403"
      title="无权访问"
      description="你当前没有访问该页面或资源的权限。后续接入正式权限系统后，这里会根据角色和比赛作用域做更精细的控制。"
      primaryHref="/"
      primaryLabel="返回首页"
      secondaryHref="/sign-in"
      secondaryLabel="前往登录"
    />
  );
}
