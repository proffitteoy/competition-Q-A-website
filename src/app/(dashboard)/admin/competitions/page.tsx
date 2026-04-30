"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { CompetitionStatusBadge } from "@/components/competitions/competition-status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { competitions, type Competition } from "@/lib/mock-data";

const columns: ColumnDef<Competition>[] = [
  {
    accessorKey: "title",
    header: "比赛名称",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="font-medium">{row.original.title}</div>
        <div className="text-xs text-muted-foreground">{row.original.category}</div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => <CompetitionStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "registrationWindow",
    header: "报名时间",
  },
  {
    accessorKey: "department",
    header: "归属单位",
  },
  {
    id: "actions",
    header: "操作",
    cell: () => <Button variant="outline" size="sm">编辑</Button>,
  },
];

export default function AdminCompetitionsPage() {
  return (
    <div className="px-4 lg:px-6">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Competitions"
          title="比赛管理"
          description="这里是比赛创建、状态切换、时间配置和报名字段接入前的骨架页，当前先固定列表结构和操作入口。"
          actions={<Button>新建比赛</Button>}
        />
        <AdminDataTable
          data={competitions}
          columns={columns}
          searchPlaceholder="搜索比赛名称、分类或归属单位"
          emptyLabel="暂无比赛记录"
        />
      </div>
    </div>
  );
}
