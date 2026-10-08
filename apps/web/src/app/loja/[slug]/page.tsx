import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { Container } from "@workspace/ui/components/container";
import { Section } from "@workspace/ui/components/section";
import { Badge } from "@workspace/ui/components/badge";
import { SectionHeading } from "@workspace/ui/components/section-heading";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { ProductCard } from "@/components/store/product-card";
import { formatPrice } from "@/lib/format";
import { getProductBySlug, getProductCategoryBySlug, getProducts } from "@/lib/products";
import type { ProductAvailability } from "@workspace/types";

const AVAILABILITY_LABEL: Record<ProductAvailability, string> = {
  disponivel: "Disponível",
  "sob-consulta": "Sob consulta",
  brevemente: "Brevemente",
};

const AVAILABILITY_DOT: Record<ProductAvailability, string> = {
  disponivel: "bg-primary",
  "sob-consulta": "bg-paper-dim",
  brevemente: "bg-paper-faint",
};

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = getProductCategoryBySlug(product.category);
  const relatedProducts = getProducts({ categorySlug: product.category }).filter(
    (item) => item.id !== product.id,
  );

  return (
    <>
      <Section>
        <Container className="flex flex-col gap-8">
          <Link
            href="/loja"
            className="inline-flex w-fit items-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Voltar à loja
          </Link>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* Ainda não há fotografia real de produto. */}
            <div className="flex aspect-square w-full max-w-md shrink-0 items-center justify-center rounded-xl border border-border bg-ink-3">
              <p className="px-6 text-center text-sm text-muted-foreground">
                Sem imagem disponível
              </p>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                {category ? <Badge>{category.name}</Badge> : null}
                {product.isDemo ? <Badge variant="outline">Produto de demonstração</Badge> : null}
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                {product.name}
              </h1>
              <p className="max-w-xl text-muted-foreground">{product.description}</p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <p className="text-2xl font-semibold text-foreground">
                  {formatPrice(product.price)}
                  {product.isDemo ? (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      (preço de demonstração)
                    </span>
                  ) : null}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${AVAILABILITY_DOT[product.availability]}`}
                  />
                  {AVAILABILITY_LABEL[product.availability]}
                </div>
              </div>

              {product.features.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="pt-2">
                <AddToCartButton product={product} />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="raised">
        <Container className="flex flex-col gap-6">
          <SectionHeading title="Informação do produto" />
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <PendingInfo term="Compatibilidade" />
            <PendingInfo term="O que está incluído" />
            <PendingInfo term="Instalação" />
            <PendingInfo term="Garantia" />
            <PendingInfo term="Documentação" />
          </dl>
        </Container>
      </Section>

      <Section>
        <Container className="flex flex-col gap-8">
          <SectionHeading title="Produtos relacionados" />
          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sem produtos relacionados de momento.</p>
          )}
        </Container>
      </Section>
    </>
  );
}

function PendingInfo({ term }: { term: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-sm font-semibold text-foreground">{term}</dt>
      <dd className="text-sm text-muted-foreground">
        Informação a confirmar quando o catálogo real estiver disponível.
      </dd>
    </div>
  );
}
