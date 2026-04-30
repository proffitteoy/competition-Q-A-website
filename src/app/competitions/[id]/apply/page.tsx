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
            eyebrow="Apply"
            title={`Apply: ${competition.title}`}
            description="This page is connected to the MVP application submission flow."
          />
          <ApplicationForm competition={competition} />
        </div>
      </Section>
      <PortalFooter />
    </div>
  );
}
