import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { homepageFaqs } from "@/lib/mock-data";

import { Section } from "./section";

export function PortalFaq() {
  return (
    <Section>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-3 text-center">
          <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
            FAQ
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            平台骨架的当前边界
          </h2>
        </div>
        <Accordion type="single" collapsible className="rounded-xl border border-border/60 bg-card px-6">
          {homepageFaqs.map((item, index) => (
            <AccordionItem key={item.question} value={`item-${index + 1}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-7 text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}
