"use client";

import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Container } from "@workspace/ui/components/container";
import { IconBadge } from "@workspace/ui/components/icon-badge";
import { Section } from "@workspace/ui/components/section";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, removeItem, clear } = useCart();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Section>
      <Container className="flex flex-col gap-10">
        <header className="flex flex-col gap-3">
          <h1 className="text-balance text-3xl font-semibold uppercase leading-[1.1] tracking-tight text-foreground md:text-4xl">
            Carrinho
          </h1>
          <p className="text-balance text-base text-muted-foreground">
            Os produtos que adicionaste ficam aqui guardados enquanto navegas no site.
          </p>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-5 rounded-xl border border-dashed border-line-strong bg-card px-6 py-12 text-center md:py-16">
            <IconBadge size="lg">
              <ShoppingBag aria-hidden="true" />
            </IconBadge>
            <div className="flex max-w-md flex-col gap-2">
              <h2 className="text-lg font-semibold text-foreground">O teu carrinho está vazio</h2>
              <p className="text-sm text-muted-foreground">
                Ainda não adicionaste nenhum produto. Explora a loja para encontrar o que
                precisas.
              </p>
            </div>
            <Button asChild>
              <Link href="/loja">Ver a loja</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.productId}>
                  <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="text-base font-semibold text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.price)} · Quantidade: {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-6 sm:justify-end">
                      <span className="text-base font-semibold text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                        Remover
                      </Button>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>

            <Card className="flex flex-col gap-5 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-xl font-semibold text-foreground">
                  {formatPrice(total)}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Button type="button" size="lg" disabled className="w-full uppercase">
                  Finalizar compra
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  O checkout ainda não está disponível.
                </p>
              </div>

              <button
                type="button"
                onClick={clear}
                className="text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Esvaziar carrinho
              </button>
            </Card>
          </div>
        )}
      </Container>
    </Section>
  );
}