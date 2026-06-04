import { AnimatedSection } from "@/components/shared/animated-section";
import { SectionHeader } from "@/components/shared/section-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqItems } from "@/config/platform";

export function FaqSection() {
  return (
    <AnimatedSection id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="FAQ"
          title="Frequently Asked Questions"
          description="What to expect for boosting, Predator plans, badges, unban, and marketplace listings."
          align="center"
          className="mx-auto"
        />

        <Accordion className="mt-12 rounded-xl border border-white/5 bg-card/30 px-2">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`item-${index}`}
              className="border-white/5 px-2"
            >
              <AccordionTrigger className="text-left text-base font-medium hover:no-underline hover:text-foreground">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </AnimatedSection>
  );
}
