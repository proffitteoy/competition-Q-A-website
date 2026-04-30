"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { users, type PlatformUser } from "@/lib/mock-data";

const roleText: Record<PlatformUser["role"], string> = {
  super_admin: "全站管理员",
  competition_admin: "比赛管理员",
  content_editor: "内容编辑",
  student_user: "学生用户",
};

const columns: ColumnDef<PlatformUser>[] = [
  {
    accessorKey: "name",
    header: "用户",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="font-medium">{row.original.name}</div>
        <div className="text-xs text-muted-foreground">{row.original.email}</div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "角色",
    cell: ({ row }) => <Badge variant="outline">{roleText[row.original.role]}</Badge>,
  },
  {
    accessorKey: "college",
    header: "学院 / 单位",
  },
  {
    accessorKey: "status",
    header: "账号状态",
  },
];

export default function AdminUsersPage() {
  return (
    <div className="px-4 lg:px-6">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Users"
          title="用户管理"
          description="当前先固定角色、作用域和账号状态的列表骨架，后续再接权限分配与比赛级范围控制。"
        />
        <AdminDataTable
          data={users}
          columns={columns}
          searchPlaceholder="搜索姓名、邮箱、学院或角色"
          emptyLabel="暂无用户记录"
        />
      </div>
    </div>
  );
}
