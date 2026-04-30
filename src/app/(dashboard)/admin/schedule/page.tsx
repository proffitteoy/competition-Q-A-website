import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { competitions } from "@/lib/mock-data";

export default function AdminSchedulePage() {
  return (
    <div className="px-4 lg:px-6">
      <div className="space-y-8">
        <PageHeader
          eyebrow="Schedule"
          title="赛程安排"
          description="第一阶段先用时间线占位，后续若引入 FullCalendar，再扩展到完整日历视图。"
        />
        <div className="grid gap-4">
          {competitions.map((competition) => (
            <Card key={competition.id} className="border-border/70">
              <CardHeader>
                <CardTitle>{competition.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {competition.timeline.map((item) => (
                  <div
                    key={`${competition.id}-${item.label}`}
                    className="rounded-2xl border border-dashed border-border/70 p-4"
                  >
                    <p className="font-medium">{item.label}</p>
                    <p className="text-muted-foreground">{item.date} · {item.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
