/**
 * Shared domain types for the MUTARIS catalog.
 * Kept intentionally small for v1 — extend as later phases add the
 * store, solution detail pages and configurator.
 */

/** Keys used to resolve a lucide-react icon at the app layer. */
export type IconName =
  | "house"
  | "store"
  | "droplets"
  | "flame"
  | "video"
  | "shield-check"
  | "search"
  | "sliders"
  | "layout-dashboard"
  | "package"
  | "boxes"
  | "heart"
  | "life-buoy"
  | "user"
  | "settings"
  | "lock"
  | "log-out"
  | "key-round";

export interface ProblemCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: IconName;
}

export interface FeaturedSolution {
  id: string;
  slug: string;
  /** e.g. "HOME" in "MUTARIS HOME" — the brand name is prefixed at render time. */
  name: string;
  categorySlug: string;
  tagline: string;
  highlights: string[];
  priceFrom: number;
  currency: "EUR";
}

export interface HowItWorksStep {
  id: string;
  number: string;
  title: string;
  description: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface AccountNavLink extends NavLink {
  icon: IconName;
}

/* ------------------------------------------------------------------ */
/* Customer account                                                    */
/* ------------------------------------------------------------------ */

export type OrderStatus =
  | "awaiting-payment"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  /** Unit price in EUR. */
  unitPrice: number;
}

export interface Order {
  id: string;
  /** Human-facing order number, e.g. shown as "Encomenda #<number>". */
  number: string;
  status: OrderStatus;
  /** ISO 8601 date. */
  createdAt: string;
  /** Order total in EUR. */
  total: number;
  currency: "EUR";
  items: OrderItem[];
  shippingAddress?: string;
}

export type OwnedSolutionStatus = "active" | "setup-pending" | "needs-attention";

export interface OwnedSolution {
  id: string;
  /** Same convention as FeaturedSolution.name — brand is prefixed at render time. */
  name: string;
  status: OwnedSolutionStatus;
  equipment: { id: string; name: string; quantity: number }[];
  guides: { id: string; title: string; href: string }[];
}

export interface FavoriteProduct {
  id: string;
  slug: string;
  name: string;
  categoryName?: string;
  price: number;
  currency: "EUR";
}

export type SupportTicketStatus = "open" | "awaiting-reply" | "resolved";

export interface SupportTicket {
  id: string;
  reference: string;
  subject: string;
  status: SupportTicketStatus;
  /** ISO 8601 date. */
  createdAt: string;
}

export interface CustomerAddress {
  id: string;
  label: string;
  street: string;
  postalCode: string;
  city: string;
}

export interface CustomerProfile {
  firstName: string;
  fullName: string;
  email: string;
  phone: string;
  addresses: CustomerAddress[];
  billing: {
    name: string;
    taxId: string;
    street: string;
    postalCode: string;
    city: string;
  };
}

export interface SessionDevice {
  id: string;
  label: string;
  current: boolean;
}

/* ------------------------------------------------------------------ */
/* Loja (store) — catálogo é mock/demo até existir o real              */
/* ------------------------------------------------------------------ */

/** Categoria de filtro mostrada na loja. Propositadamente editável —
 *  nada na app assume que esta lista é definitiva. */
export interface ProductCategory {
  id: string;
  slug: string;
  name: string;
  icon: IconName;
}

export type ProductAvailability = "disponivel" | "sob-consulta" | "brevemente";

export type ProductSortOption = "relevancia" | "preco-asc" | "preco-desc";

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** Corresponde a um ProductCategory.slug. Fica como string simples,
   *  não union, para nunca obrigar a alterar o tipo ao criar categorias. */
  category: string;
  description: string;
  price: number;
  currency: "EUR";
  /** Por agora fica por definir — ainda não há fotografia real. */
  image?: string;
  availability: ProductAvailability;
  features: string[];
  /** Ids de FeaturedSolution a que este produto pertence, se aplicável. */
  solutionIds: string[];
  /** True para entradas de catálogo temporárias, antes do catálogo real. */
  isDemo: boolean;
}

/* ------------------------------------------------------------------ */
/* Carrinho — só estrutura de frontend, sem checkout/pagamentos ainda  */
/* ------------------------------------------------------------------ */

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  currency: "EUR";
  quantity: number;
}
