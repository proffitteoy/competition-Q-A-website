import { competitions } from "@/lib/mock-data";

import { CompetitionCard } from "@/components/competitions/competition-card";
import { PortalFaq } from "@/components/marketing/portal-faq";
import { PortalFeatureGrid } from "@/components/marketing/portal-feature-grid";
import { PortalFooter } from "@/components/marketing/portal-footer";
import { PortalHero } from "@/components/marketing/portal-hero";
import { PortalNavbar } from "@/components/marketing/portal-navbar";
import { PortalStats } from "@/components/marketing/portal-stats";
import { Section } from "@/components/marketing/section";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <PortalNavbar />
      <PortalHero featuredCompetitions={competitions} />
      <PortalStats />
      <PortalFeatureGrid />
      <Section className="pt-0">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
              Competition Portal
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              当前门户骨架优先展示能报名、即将开始和正在进行中的比赛
            </h2>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {competitions.slice(0, 3).map((competition) => (
              <CompetitionCard key={competition.id} competition={competition} />
            ))}
          </div>
        </div>
      </Section>
      <PortalFaq />
      <PortalFooter />
    </div>
  );
}
