"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Container } from "@workspace/ui/components/container";
import { Section } from "@workspace/ui/components/section";
import { SectionHeading } from "@workspace/ui/components/section-heading";
import { cn } from "@workspace/ui/lib/cn";
import { iconRegistry } from "@/lib/icons";
import { journeys, macroStages } from "@/data/journeys";

/**
 * "Da necessidade à solução" — the page's signature experience.
 *
 * A short, conceptual funnel (Necessidade → Solução → Equipamento →
 * Instalação → Proteção) sits above three example journeys the visitor can
 * switch between. Each journey shows the same idea applied to a different
 * situation, without claiming any journey is the only path.
 */
export function JourneyExplorer() {
  const [activeId, setActiveId] = React.useState(journeys[0]!.id);

  return (
    <Section tone="raised">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          align="center"
          title="Da necessidade à solução"
          description="Cada compra segue o mesmo caminho, adaptado àquilo que precisas de proteger."
        />

        <div className="flex flex-col items-center gap-3">
          <p className="sr-only">
            Percurso: {macroStages.join(", ")}.
          </p>
          <ol
            aria-hidden="true"
            className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2"
          >
            {macroStages.map((stage, index) => (
              <li key={stage} className="flex items-center gap-2.5">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-sm">
                  {stage}
                </span>
                {index < macroStages.length - 1 ? (
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 text-line-strong" />
                ) : null}
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col items-center gap-10">
          <div
            role="tablist"
            aria-label="Escolhe o que queres proteger"
            className="flex flex-wrap justify-center gap-2"
          >
            <span className="sr-only">Quero proteger…</span>
            {journeys.map((journey) => {
              const Icon = iconRegistry[journey.icon];
              const active = journey.id === activeId;
              return (
                <button
                  key={journey.id}
                  type="button"
                  role="tab"
                  id={`journey-tab-${journey.id}`}
                  aria-selected={active}
                  aria-controls={`journey-panel-${journey.id}`}
                  onClick={() => setActiveId(journey.id)}
                  className={cn(
                    "inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "border-line-strong bg-background text-foreground"
                      : "border-border text-muted-foreground hover:border-line-strong hover:text-foreground",
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className={cn("h-4 w-4", active && "text-primary")}
                  />
                  {journey.label}
                </button>
              );
            })}
          </div>

          {journeys.map((journey) => (
            <div
              key={journey.id}
              id={`journey-panel-${journey.id}`}
              role="tabpanel"
              aria-labelledby={`journey-tab-${journey.id}`}
              hidden={journey.id !== activeId}
              className="flex w-full max-w-xl flex-col items-center gap-3"
            >
              <p className="text-balance text-center text-xl font-medium text-foreground sm:text-2xl">
                “{journey.quote}”
              </p>
              {journey.note ? (
                <p className="text-center text-sm text-muted-foreground">{journey.note}</p>
              ) : null}

              <ol className="mt-6 flex w-full flex-col gap-8 self-start border-l border-line-strong pl-8 text-left">
                {journey.steps.map((step, index) => (
                  <li key={step.title} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[2.35rem] flex h-7 w-7 items-center justify-center rounded-full border border-line-strong bg-background text-xs font-semibold text-foreground"
                    >
                      {index + 1}
                    </span>
                    <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
