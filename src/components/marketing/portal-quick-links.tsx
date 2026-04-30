import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  FileText,
  FolderOpenDot,
  Sparkles,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { Section } from "./section";

interface PortalQuickLinkItem {
  href: string;
  label: string;
  value: string;
  description: string;
}

interface PortalQuickLinksProps {
  items: PortalQuickLinkItem[];
}

const quickLinkIcons = [Sparkles, BellRing, FolderOpenDot, FileText];

export function PortalQuickLinks({ items }: PortalQuickLinksProps) {
  return (
    <Section className="pt-0">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item, index) => {
          const Icon = quickLinkIcons[index % quickLinkIcons.length];

          return (
            <Link key={item.label} href={item.href} className="group block">
              <Card className="h-full overflow-hidden border-slate-200/70 bg-white/90 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.45)] transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_22px_60px_-24px_rgba(15,23,42,0.5)]">
                <CardContent className="space-y-5 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(15,23,42,0.08),rgba(180,83,9,0.14))] text-slate-800">
                      <Icon className="size-5" />
                    </div>
                    <ArrowRight className="size-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500">{item.label}</p>
                    <p className="font-tabular text-3xl font-semibold tracking-tight text-slate-950">
                      {item.value}
                    </p>
                    <p className="text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}
