import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CompetitionStatus } from "@/lib/mock-data";

const statusMap: Record<
  CompetitionStatus,
  { label: string; className: string }
> = {
  registration_open: {
    label: "报名中",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  upcoming: {
    label: "即将开始",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  in_progress: {
    label: "进行中",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  finished: {
    label: "已结束",
    className: "border-border bg-muted text-muted-foreground",
  },
};

interface CompetitionStatusBadgeProps {
  status: CompetitionStatus;
}

export function CompetitionStatusBadge({
  status,
}: CompetitionStatusBadgeProps) {
  const config = statusMap[status];

  return (
    <Badge variant="outline" className={cn("rounded-full px-2.5 py-1", config.className)}>
      {config.label}
    </Badge>
  );
}
