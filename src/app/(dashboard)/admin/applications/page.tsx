"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { ApplicationReviewDialog } from "@/components/admin/application-review-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  applications,
  type ApplicationRecord,
} from "@/lib/mock-data";

const statusText: Record<ApplicationRecord["status"], string> = {
  submitted: "待审核",
  approved: "已通过",
  rejected: "已驳回",
  withdrawn: "已撤回",
};

const columns: ColumnDef<ApplicationRecord>[] = [
  {
    accessorKey: "competitionTitle",
    header: "比赛 / 申请人",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="font-medium">{row.original.competitionTitle}</div>
        <div className="text-xs text-muted-foreground">
          {row.original.applicantName} · {row.original.college}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "审核状态",
    cell: ({ row }) => <Badge variant="outline">{statusText[row.original.status]}</Badge>,
  },
  {
    accessorKey: "submittedAt",
    header: "提交时间",
  },
  {
    accessorKey: "reviewer",
    header: "审核人",
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => <ApplicationReviewDialog application={row.original} />,
  },
];

export default function AdminApplicationsPage() {
  return (
    <div className="px-4 lg:px-6">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Applications"
          title="报名审核"
          description="第一阶段最关键的后台业务页。这里先用统一表格、状态标签和审核弹窗承接筛选、审核和导出逻辑。"
          actions={
            <Button variant="outline">导出当前筛选结果</Button>
          }
        />
        <AdminDataTable
          data={applications}
          columns={columns}
          searchPlaceholder="搜索比赛名称、申请人、学院或审核人"
          emptyLabel="暂无报名申请"
        />
      </div>
    </div>
  );
}
