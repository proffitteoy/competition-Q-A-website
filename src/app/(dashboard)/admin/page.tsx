"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ClipboardCheck,
  ListChecks,
  Megaphone,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/shared/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardPayload {
  stats: {
    competitions: number;
    applications: number;
    notices: number;
    users: number;
    activeCompetitions: number;
    pendingReviews: number;
    thisWeekSubmissions: number;
    approvalRate: number;
  };
  reviewTrend: Array<{ week: string; total: number }>;
  statusDistribution: Array<{
    status: "draft" | "submitted" | "approved" | "rejected" | "withdrawn" | "cancelled";
    total: number;
  }>;
}

const defaultPayload: DashboardPayload = {
  stats: {
    competitions: 0,
    applications: 0,
    notices: 0,
    users: 0,
    activeCompetitions: 0,
    pendingReviews: 0,
    thisWeekSubmissions: 0,
    approvalRate: 0,
  },
  reviewTrend: [],
  statusDistribution: [],
};

const statusLabelMap: Record<
  DashboardPayload["statusDistribution"][number]["status"],
  string
> = {
  draft: "草稿",
  submitted: "待审核",
  approved: "已通过",
  rejected: "已驳回",
  withdrawn: "已撤回",
  cancelled: "已取消",
};

const statusColorMap: Record<
  DashboardPayload["statusDistribution"][number]["status"],
  string
> = {
  draft: "var(--color-chart-4)",
  submitted: "var(--color-chart-1)",
  approved: "var(--color-chart-2)",
  rejected: "var(--color-chart-5)",
  withdrawn: "var(--color-chart-3)",
  cancelled: "var(--color-chart-4)",
};

export default function AdminHomePage() {
  const [payload, setPayload] = useState<DashboardPayload>(defaultPayload);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
        const data = (await response.json()) as DashboardPayload & { message?: string };
        if (!response.ok) {
          throw new Error(data.message ?? "加载管理看板失败");
        }

        if (!cancelled) {
          setPayload(data);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "加载管理看板失败";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="px-4 lg:px-6">
      <div className="space-y-8">
        <PageHeader
          eyebrow="后台总览"
          title="竞赛运营看板"
          description="实时汇总比赛、报名、通知与用户工作负载。"
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            label="比赛总数"
            value={loading ? "--" : String(payload.stats.competitions)}
            description="当前纳管的比赛记录总数"
            icon={<Trophy className="size-5 text-primary" />}
          />
          <StatsCard
            label="报名总数"
            value={loading ? "--" : String(payload.stats.applications)}
            description="累计报名申请记录"
            icon={<ClipboardCheck className="size-5 text-primary" />}
          />
          <StatsCard
            label="通知总数"
            value={loading ? "--" : String(payload.stats.notices)}
            description="已发布与草稿通知总计"
            icon={<Megaphone className="size-5 text-primary" />}
          />
          <StatsCard
            label="用户总数"
            value={loading ? "--" : String(payload.stats.users)}
            description="含角色授权的用户账号"
            icon={<Users className="size-5 text-primary" />}
          />
          <StatsCard
            label="活跃比赛"
            value={loading ? "--" : String(payload.stats.activeCompetitions)}
            description="即将开始或报名中的比赛"
            icon={<Activity className="size-5 text-primary" />}
          />
          <StatsCard
            label="待审核报名"
            value={loading ? "--" : String(payload.stats.pendingReviews)}
            description="尚未完成审核的报名记录"
            icon={<ListChecks className="size-5 text-primary" />}
          />
          <StatsCard
            label="本周新增"
            value={loading ? "--" : String(payload.stats.thisWeekSubmissions)}
            description="近 7 天新增报名数"
            icon={<ClipboardCheck className="size-5 text-primary" />}
          />
          <StatsCard
            label="通过率"
            value={loading ? "--" : `${payload.stats.approvalRate}%`}
            description="已通过 /（已通过 + 已驳回）"
            icon={<ShieldCheck className="size-5 text-primary" />}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>报名趋势（近 4 周）</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  看板加载中...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={payload.reviewTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="week" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="total" fill="var(--color-chart-1)" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>报名状态分布</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  看板加载中...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={payload.statusDistribution}
                      dataKey="total"
                      nameKey="status"
                      innerRadius={56}
                      outerRadius={96}
                      paddingAngle={2}
                    >
                      {payload.statusDistribution.map((item) => (
                        <Cell key={item.status} fill={statusColorMap[item.status]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        `${value}`,
                        statusLabelMap[name as keyof typeof statusLabelMap],
                      ]}
                    />
                    <Legend
                      formatter={(value) =>
                        statusLabelMap[value as keyof typeof statusLabelMap]
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
