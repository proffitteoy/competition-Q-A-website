import { notFound } from "next/navigation";

import { ApplicationForm } from "@/components/competitions/application-form";
import { PortalFooter } from "@/components/marketing/portal-footer";
import { PortalNavbar } from "@/components/marketing/portal-navbar";
import { Section } from "@/components/marketing/section";
import { PageHeader } from "@/components/shared/page-header";
import { getCompetitionById } from "@/lib/mock-data";

export default async function CompetitionApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const competition = getCompetitionById(id);

  if (!competition) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <PortalNavbar />
      <Section>
        <div className="mx-auto max-w-7xl space-y-8">
          <PageHeader
            eyebrow="Apply"
            title={`报名：${competition.title}`}
            description="当前是纯前端 Mock 报名流程，用于固定表单结构、字段分组、上传入口和提交反馈。"
          />
          <ApplicationForm competition={competition} />
        </div>
      </Section>
      <PortalFooter />
    </div>
  );
}
