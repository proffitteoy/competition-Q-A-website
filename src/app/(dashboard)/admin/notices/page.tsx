"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { notices, type NoticeRecord } from "@/lib/mock-data";

const columns: ColumnDef<NoticeRecord>[] = [
  {
    accessorKey: "title",
    header: "通知标题",
  },
  {
    accessorKey: "competition",
    header: "归属比赛",
  },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
  },
  {
    accessorKey: "updatedAt",
    header: "更新时间",
  },
  {
    id: "actions",
    header: "操作",
    cell: () => <Button variant="outline" size="sm">编辑</Button>,
  },
];

export default function AdminNoticesPage() {
  return (
    <div className="px-4 lg:px-6">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Notices"
          title="通知管理"
          description="富文本编辑器还未接入，这里先固定通知列表、状态管理和比赛归属字段。"
          actions={<Button>发布通知</Button>}
        />
        <AdminDataTable
          data={notices}
          columns={columns}
          searchPlaceholder="搜索通知标题或归属比赛"
          emptyLabel="暂无通知记录"
        />
      </div>
    </div>
  );
}
