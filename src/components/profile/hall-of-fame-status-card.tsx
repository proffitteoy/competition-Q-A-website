import Link from "next/link";
import { Award, Eye, EyeOff, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { HallOfFameEntry } from "@/lib/mock-data";

interface DisplaySettings {
  publicShowAvatar: boolean;
  publicShowCollegeMajor: boolean;
  publicShowTitles: boolean;
}

interface HallOfFameStatusCardProps {
  entry: HallOfFameEntry | null;
  userId: string;
  userName: string;
  displaySettings: DisplaySettings;
}

export function HallOfFameStatusCard({
  entry,
  userId,
  userName,
  displaySettings,
}: HallOfFameStatusCardProps) {
  if (!entry) {
    return (
      <Card className="border-slate-200/70 bg-white/92">
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-slate-100">
            <Award className="size-7 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700">
            暂未入选名人堂
          </h3>
          <p className="max-w-md text-sm text-slate-500">
            名人堂成员由管理员根据竞赛成绩和贡献评选产生。继续参加竞赛、分享经验，有机会获得提名。
          </p>
        </CardContent>
      </Card>
    );
  }

  const settingItems = [
    { label: "公开头像", value: displaySettings.publicShowAvatar },
    { label: "公开学院与专业", value: displaySettings.publicShowCollegeMajor },
    { label: "公开头衔", value: displaySettings.publicShowTitles },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-white">
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200">
            <Award className="size-8 text-amber-700" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900">
                {userName}
              </h3>
              <Badge className="rounded-full bg-amber-100 text-amber-800 hover:bg-amber-100">
                {entry.tag}
              </Badge>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              {entry.bio}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <Link href={`/profile/${userId}`}>
              <ExternalLink className="mr-1 size-4" />
              查看公开页
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 bg-white/92">
        <CardContent className="p-6">
          <h4 className="mb-3 text-sm font-medium text-slate-700">
            公开展示设置摘要
          </h4>
          <p className="mb-4 text-xs text-slate-400">
            以下开关可在「我的信息」页面修改
          </p>
          <div className="space-y-2">
            {settingItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-600">{item.label}</span>
                <span className="flex items-center gap-1">
                  {item.value ? (
                    <>
                      <Eye className="size-3.5 text-green-600" />
                      <span className="text-green-700">开启</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="size-3.5 text-slate-400" />
                      <span className="text-slate-500">关闭</span>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
