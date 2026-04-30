import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { isAdminRole } from "@/lib/auth/authorization";
import { getSessionUser } from "@/lib/auth/session";
import {
  listApplications,
  listRegistrationAuditLogsByApplicationIds,
} from "@/server/repositories/application-repository";

function csvEscape(value: string) {
  const escaped = value.replace(/"/g, "\"\"");
  return `"${escaped}"`;
}

export async function GET(request: Request) {
  const sessionUser = await getSessionUser();
  if (!isAdminRole(sessionUser.role)) {
    return NextResponse.json({ message: "无权访问" }, { status: 403 });
  }

  const url = new URL(request.url);
  const format = (url.searchParams.get("format") ?? "csv").toLowerCase();

  const applications = await listApplications();

  const headers = [
    "报名编号",
    "比赛名称",
    "申请人",
    "学院",
    "专业",
    "年级",
    "报名模式",
    "状态",
    "提交时间",
    "审核人",
    "审核意见",
  ];
  const rows = applications.map((item) => [
    item.id,
    item.competitionTitle,
    item.applicantName,
    item.college,
    item.major,
    item.grade,
    item.mode,
    item.status,
    item.submittedAt,
    item.reviewer,
    item.note,
  ]);

  if (format === "xlsx") {
    const workbook = XLSX.utils.book_new();
    const summaryRows = applications.map((item) => ({
      报名编号: item.id,
      比赛名称: item.competitionTitle,
      申请人: item.applicantName,
      学院: item.college,
      专业: item.major,
      年级: item.grade,
      报名模式: item.mode,
      状态: item.status,
      提交时间: item.submittedAt,
      审核人: item.reviewer,
      审核意见: item.note,
    }));

    const logs = await listRegistrationAuditLogsByApplicationIds(
      applications.map((item) => item.id),
    );
    const logRows = logs.map((item) => ({
      报名编号: item.applicationId,
      原状态: item.fromStatus,
      新状态: item.toStatus,
      动作: item.action,
      操作人: item.operatorName,
      备注: item.comment,
      时间: item.createdAt,
    }));

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(summaryRows),
      "报名汇总",
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(logRows),
      "审核日志",
    );

    const binary = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    return new NextResponse(binary, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=applications.xlsx",
      },
    });
  }

  const csv = [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => row.map((cell) => csvEscape(cell)).join(",")),
  ].join("\n");

  return new NextResponse(`\uFEFF${csv}`, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=applications.csv",
    },
  });
}
