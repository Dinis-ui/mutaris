import Link from "next/link";
import { ArrowRight, ChevronRight, Package } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { IconBadge } from "@workspace/ui/components/icon-badge";
import { AccountPageHeader } from "@/components/account/page-header";
import { EmptyState } from "@/components/account/empty-state";
import { OrderList } from "@/components/account/order-list";
import {
  customerProfile,
  favoriteProducts,
  orders,
  ownedSolutions,
  supportTickets,
} from "@/data/account";
import { iconRegistry } from "@/lib/icons";
import type { IconName } from "@workspace/types";

const shortcuts: { label: string; description: string; href: string; icon: IconName }[] = [
  {
    label: "Encomendas",
    description: "Acompanha o estado e consulta os detalhes.",
    href: "/conta/pedidos",
    icon: "package",
  },
  {
    label: "As minhas soluções",
    description: "Equipamentos, guias e manuais num só lugar.",
    href: "/conta/solucoes",
    icon: "boxes",
  },
  {
    label: "Favoritos",
    description: "Os produtos que guardaste para mais tarde.",
    href: "/conta/favoritos",
    icon: "heart",
  },
  {
    label: "Suporte",
    description: "Pede ajuda e consulta os teus pedidos.",
    href: "/conta/suporte",
    icon: "life-buoy",
  },
];

export default function AccountPage() {
  const activeSolutions = ownedSolutions.filter((item) => item.status === "active").length;
  const openTickets = supportTickets.filter((ticket) => ticket.status !== "resolved").length;
  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  const summary = [
    { label: "Encomendas", value: orders.length },
    { label: "Soluções ativas", value: activeSolutions },
    { label: "Favoritos", value: favoriteProducts.length },
    { label: "Pedidos de suporte em aberto", value: openTickets },
  ];

  return (
    <>
      <AccountPageHeader
        title={`Olá, ${customerProfile.firstName}`}
        description="Aqui tens tudo o que precisas para acompanhar as tuas encomendas, gerir as tuas soluções e pedir ajuda."
      />

      <section aria-labelledby="resumo-titulo" className="flex flex-col gap-4">
        <h2 id="resumo-titulo" className="text-lg font-semibold text-foreground">
          Resumo da conta
        </h2>
        <Card className="overflow-hidden">
          <dl className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
            {summary.map((item) => (
              <div key={item.label} className="flex flex-col gap-2 bg-card p-5 md:p-6">
                <dt className="text-sm text-muted-foreground">{item.label}</dt>
                <dd className="font-accent text-4xl font-semibold leading-none text-foreground">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      </section>

      <section aria-labelledby="atalhos-titulo" className="flex flex-col gap-4">
        <h2 id="atalhos-titulo" className="text-lg font-semibold text-foreground">
          Atalhos
        </h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {shortcuts.map((shortcut) => {
            const Icon = iconRegistry[shortcut.icon];
            return (
              <li key={shortcut.href}>
                <Link
                  href={shortcut.href}
                  className="group flex h-full items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <IconBadge>
                    <Icon aria-hidden="true" />
                  </IconBadge>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-foreground">{shortcut.label}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{shortcut.description}</p>
                  </div>
                  <ChevronRight
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="recentes-titulo" className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 id="recentes-titulo" className="text-lg font-semibold text-foreground">
            Encomendas recentes
          </h2>
          {recentOrders.length > 0 ? (
            <Link
              href="/conta/pedidos"
              className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Ver todas
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
        {recentOrders.length > 0 ? (
          <OrderList orders={recentOrders} />
        ) : (
          <EmptyState
            icon={Package}
            title="Ainda não tens encomendas"
            description="Quando fizeres a tua primeira encomenda, vais poder acompanhá-la aqui, do pagamento à entrega."
            actions={
              <Button asChild>
                <Link href="/#encontrar-solucao">
                  Encontrar a minha solução
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </Button>
            }
          />
        )}
      </section>
    </>
  );
}
