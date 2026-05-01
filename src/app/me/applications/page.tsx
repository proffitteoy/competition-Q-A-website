import { ApplicationStatusTimeline } from "@/components/competitions/application-status-timeline";
import { PortalFooter } from "@/components/marketing/portal-footer";
import { PortalNavbar } from "@/components/marketing/portal-navbar";
import { Section } from "@/components/marketing/section";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { getSessionUser } from "@/lib/auth/session";
import { listApplicationsByApplicantUserId } from "@/server/repositories/application-repository";

const roleLabelMap = {
  super_admin: "超级管理员",
  competition_admin: "比赛管理员",
  content_editor: "内容编辑",
  student_user: "学生用户",
} as const;

export default async function MyApplicationsPage() {
  const sessionUser = await getSessionUser();
  const applications = sessionUser.id
    ? await listApplicationsByApplicantUserId(sessionUser.id)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <PortalNavbar />
      <Section>
        <div className="mx-auto max-w-7xl space-y-8">
          <PageHeader
            eyebrow="我的报名"
            title="我的报名"
            description={`当前查看用户：${sessionUser.name}（${roleLabelMap[sessionUser.role]}）`}
          />
          {applications.length ? (
            <div className="space-y-4">
              {applications.map((application) => (
                <ApplicationStatusTimeline
                  key={application.id}
                  application={application}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="还没有报名记录"
              description="先去比赛详情页提交报名，提交后会在这里展示审核状态。"
            />
          )}
        </div>
      </Section>
      <PortalFooter />
    </div>
  );
}
