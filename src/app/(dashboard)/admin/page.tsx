"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ClipboardCheck, Megaphone, Trophy, Users } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/shared/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { applications, competitions, notices, users } from "@/lib/mock-data";

const reviewTrend = [
  { week: "第1周", total: 9 },
  { week: "第2周", total: 16 },
  { week: "第3周", total: 24 },
  { week: "第4周", total: 32 },
];

export default function AdminHomePage() {
  return (
    <div className="px-4 lg:px-6">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Admin Dashboard"
          title="竞赛管理工作台"
          description="用同一套后台骨架承接比赛管理、报名审核、通知维护和用户权限，而不是继续保留模板自带的泛化演示语义。"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            label="比赛总数"
            value={String(competitions.length)}
            description="当前 Mock 数据中已接入的平台比赛数量。"
            icon={<Trophy className="size-5 text-primary" />}
          />
          <StatsCard
            label="报名记录"
            value={String(applications.length)}
            description="报名记录将成为审核、导出和统计的第一核心数据源。"
            icon={<ClipboardCheck className="size-5 text-primary" />}
          />
          <StatsCard
            label="站内通知"
            value={String(notices.length)}
            description="公告、FAQ 与附件都应按比赛维度聚合管理。"
            icon={<Megaphone className="size-5 text-primary" />}
          />
          <StatsCard
            label="用户数"
            value={String(users.length)}
            description="角色作用域将区分全站管理员、比赛管理员与学生用户。"
            icon={<Users className="size-5 text-primary" />}
          />
        </div>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>近四周报名趋势</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reviewTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="var(--color-chart-1)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
