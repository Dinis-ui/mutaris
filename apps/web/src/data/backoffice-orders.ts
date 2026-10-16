import type { OrderStatus } from "@workspace/types";
import type { ShippingAddress } from "@/lib/shipping-address";

/**
 * Encomendas mockadas para o backoffice.
 *
 * Ainda não existe checkout, pagamentos nem base de dados — estes dados
 * servem só para desenhar a interface de gestão. Clientes e valores são
 * fictícios (`isDemo: true`). Quando houver encomendas reais, só
 * `lib/backoffice.ts` precisa de mudar.
 */
export interface AdminOrderItem {
  id: string;
  name: string;
  quantity: number;
  /** Preço unitário em EUR, no momento da compra. */
  unitPrice: number;
}

export interface AdminOrder {
  id: string;
  number: string;
  customerName: string;
  /** Id do cliente na base de dados (null se a conta foi removida). */
  userId?: string | null;
  status: OrderStatus;
  /** ISO 8601 date. */
  createdAt: string;
  /** Total em EUR. */
  total: number;
  itemCount: number;
  isDemo: boolean;
  /** Só no detalhe (`getOrderDetail`); vazio nas encomendas antigas e de demonstração. */
  items?: AdminOrderItem[];
  /** Só no detalhe, e só para quem tem permissão `manage` (é um dado pessoal). */
  shipping?: ShippingAddress | null;
  /** True quando existe morada mas este perfil não a pode ver. */
  shippingHidden?: boolean;
}

export const adminOrders: AdminOrder[] = [
  {
    id: "order-1",
    number: "DEMO-1001",
    customerName: "Cliente de demonstração 1",
    status: "processing",
    createdAt: "2026-10-07",
    total: 84,
    itemCount: 2,
    isDemo: true,
  },
  {
    id: "order-2",
    number: "DEMO-1000",
    customerName: "Cliente de demonstração 2",
    status: "awaiting-payment",
    createdAt: "2026-10-06",
    total: 89,
    itemCount: 1,
    isDemo: true,
  },
  {
    id: "order-3",
    number: "DEMO-0999",
    customerName: "Cliente de demonstração 1",
    status: "shipped",
    createdAt: "2026-10-02",
    total: 108,
    itemCount: 2,
    isDemo: true,
  },
  {
    id: "order-4",
    number: "DEMO-0998",
    customerName: "Cliente de demonstração 4",
    status: "delivered",
    createdAt: "2026-09-25",
    total: 45,
    itemCount: 1,
    isDemo: true,
  },
  {
    id: "order-5",
    number: "DEMO-0997",
    customerName: "Cliente de demonstração 3",
    status: "cancelled",
    createdAt: "2026-09-22",
    total: 69,
    itemCount: 1,
    isDemo: true,
  },
];
