"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Award } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HallOfFameEntry } from "@/lib/mock-data";

import { Section } from "./section";

interface PortalHallOfFameProps {
  entries: HallOfFameEntry[];
}

function AvatarPlaceholder({ name }: { name: string }) {
  const initial = name.charAt(0);
  return (
    <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 text-2xl font-bold text-indigo-700">
      {initial}
    </div>
  );
}

function PersonCard({ entry }: { entry: HallOfFameEntry }) {
  return (
    <Link href={`/profile/${entry.userId}`} className="block">
      <Card className="h-full min-w-[220px] border-slate-200/70 bg-white/92 shadow-[0_16px_45px_-30px_rgba(15,23,42,0.32)] transition-shadow hover:shadow-[0_20px_50px_-25px_rgba(15,23,42,0.4)]">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
          <AvatarPlaceholder name={entry.userName} />
          <div className="space-y-1.5">
            <h3 className="text-base font-semibold text-slate-950">
              {entry.userName}
            </h3>
            <Badge
              variant="secondary"
              className="rounded-full bg-amber-50 text-amber-800 hover:bg-amber-50"
            >
              {entry.tag}
            </Badge>
          </div>
          <p className="text-sm leading-6 text-slate-600">{entry.bio}</p>
          <p className="text-xs text-slate-400">{entry.college}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function PortalHallOfFame({ entries }: PortalHallOfFameProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = 260;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <Section id="hall-of-fame" className="pt-0">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <Card className="overflow-hidden border-slate-200/70 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(30,41,59,0.96))] text-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.7)]">
          <CardHeader className="space-y-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-amber-200">
              <Award className="size-5" />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-[0.28em] text-slate-300 uppercase">
                名人堂
              </p>
              <CardTitle
                className="text-3xl leading-10"
                style={{
                  fontFamily:
                    '"Noto Serif SC","Source Han Serif SC","Songti SC","STSong",serif',
                }}
              >
                竞赛达人风采，获奖经验分享
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm leading-7 text-slate-200">
              展示在各类竞赛中表现突出的同学，分享备赛经验与获奖心得，为更多参赛者提供参考。
            </p>
            <Button
              asChild
              variant="secondary"
              className="bg-white text-slate-950 hover:bg-slate-100"
            >
              <Link href="/hall-of-fame">
                更多名人
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {entries.length > 0 ? (
          <div className="relative">
            <div
              ref={scrollRef}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="w-[220px] flex-shrink-0 snap-start"
                >
                  <PersonCard entry={entry} />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="size-9 rounded-full border-slate-300 bg-white/85 hover:bg-slate-50"
                onClick={() => scroll("left")}
                aria-label="向左滚动"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-9 rounded-full border-slate-300 bg-white/85 hover:bg-slate-50"
                onClick={() => scroll("right")}
                aria-label="向右滚动"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Card className="border-dashed border-slate-300 bg-white/86">
            <CardContent className="space-y-3 p-8 text-center">
              <p className="text-lg font-semibold text-slate-900">
                暂无名人堂成员
              </p>
              <p className="text-sm leading-6 text-slate-600">
                名人堂成员由管理员维护，敬请期待。
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Section>
  );
}
