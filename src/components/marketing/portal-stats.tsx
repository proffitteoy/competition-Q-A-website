import { platformStats } from "@/lib/mock-data";

import { StatsCard } from "@/components/shared/stats-card";

import { Section } from "./section";

export function PortalStats() {
  return (
    <Section className="pt-0">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-4">
        {platformStats.map((stat) => (
          <StatsCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            description={stat.description}
          />
        ))}
      </div>
    </Section>
  );
}
