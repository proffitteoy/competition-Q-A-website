import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { HomepageFaqRecord } from "@/server/repositories/homepage-repository";

import { Section } from "./section";

interface PortalFaqProps {
  faqs: HomepageFaqRecord[];
}

export function PortalFaq({ faqs }: PortalFaqProps) {
  return (
    <Section className="pt-0">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-3 text-center">
          <p className="text-xs font-semibold tracking-[0.28em] text-slate-500 uppercase">
            常见问题
          </p>
          <h2
            className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl"
            style={{
              fontFamily:
                '"Noto Serif SC","Source Han Serif SC","Songti SC","STSong",serif',
            }}
          >
            把学生最常问的问题，直接放到首页就能看见
          </h2>
        </div>
        {faqs.length > 0 ? (
          <Accordion
            type="single"
            collapsible
            className="rounded-[2rem] border border-slate-200/70 bg-white/92 px-6 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.35)]"
          >
            {faqs.map((item, index) => (
              <AccordionItem key={item.id} value={`item-${index + 1}`}>
                <AccordionTrigger className="text-left text-base font-medium text-slate-950">
                  <div className="space-y-1">
                    <span>{item.question}</span>
                    <p className="text-xs font-normal tracking-[0.18em] text-slate-500 uppercase">
                      {item.competitionTitle}
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-7 text-slate-600">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/86 px-6 py-10 text-center">
            <p className="text-lg font-semibold text-slate-900">当前暂无首页 FAQ</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              比赛常见问题补充后，会自动出现在首页与比赛详情页。
            </p>
          </div>
        )}
      </div>
    </Section>
  );
}
