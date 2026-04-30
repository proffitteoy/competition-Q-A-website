import { applications } from "@/lib/mock-data";

import { ApplicationStatusTimeline } from "@/components/competitions/application-status-timeline";
import { PortalFooter } from "@/components/marketing/portal-footer";
import { PortalNavbar } from "@/components/marketing/portal-navbar";
import { Section } from "@/components/marketing/section";
import { PageHeader } from "@/components/shared/page-header";

export default function MyApplicationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <PortalNavbar />
      <Section>
        <div className="mx-auto max-w-7xl space-y-8">
          <PageHeader
            eyebrow="My Applications"
            title="我的报名"
            description="这里先用时间线卡片承接学生报名历史和审核状态，后续接入真实登录态与补件操作。"
          />
          <div className="space-y-4">
            {applications.map((application) => (
              <ApplicationStatusTimeline
                key={application.id}
                application={application}
              />
            ))}
          </div>
        </div>
      </Section>
      <PortalFooter />
    </div>
  );
}
