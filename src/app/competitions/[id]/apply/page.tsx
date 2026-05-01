import { notFound } from "next/navigation";

import { ApplicationForm } from "@/components/competitions/application-form";
import { PortalFooter } from "@/components/marketing/portal-footer";
import { PortalNavbar } from "@/components/marketing/portal-navbar";
import { Section } from "@/components/marketing/section";
import { PageHeader } from "@/components/shared/page-header";
import { getCompetitionById } from "@/server/repositories/competition-repository";

export default async function CompetitionApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const competition = await getCompetitionById(id);

  if (!competition) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <PortalNavbar />
      <Section>
        <div className="mx-auto max-w-7xl space-y-8">
          <PageHeader
            eyebrow="比赛报名"
            title={`报名：${competition.title}`}
            description="该页面已接入 MVP 报名提交流程。"
          />
          <ApplicationForm competition={competition} />
        </div>
      </Section>
      <PortalFooter />
    </div>
  );
}
