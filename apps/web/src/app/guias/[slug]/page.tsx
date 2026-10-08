import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Container } from "@workspace/ui/components/container";
import { Section } from "@workspace/ui/components/section";
import { getGuideBySlug, getGuideCategoryBySlug } from "@/lib/guides";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};
  return { title: guide.title, description: guide.description };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const category = getGuideCategoryBySlug(guide.categorySlug);

  return (
    <Section>
      <Container className="flex max-w-2xl flex-col gap-6">
        <Link
          href="/guias"
          className="inline-flex w-fit items-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Voltar aos guias
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {category ? <Badge>{category.name}</Badge> : null}
          {guide.isDemo ? <Badge variant="outline">Exemplo</Badge> : null}
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{guide.title}</h1>
        <p className="text-lg text-muted-foreground">{guide.description}</p>

        <p className="rounded-lg border border-line-strong bg-ink-3 px-5 py-4 text-sm text-muted-foreground">
          Este é um guia de demonstração. O conteúdo completo vai ficar disponível aqui assim que
          os guias reais da MUTARIS estiverem prontos.
        </p>
      </Container>
    </Section>
  );
}
