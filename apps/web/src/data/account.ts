import type {
  CustomerProfile,
  FavoriteProduct,
  Order,
  OwnedSolution,
  SessionDevice,
  SupportTicket,
} from "@workspace/types";

/**
 * Frontend-only account data. There is no backend or authentication yet.
 *
 * - `customerProfile` is placeholder data that only exists so the forms have
 *   something to show. Every value is deliberately generic.
 * - The collections below are intentionally empty: no invented orders,
 *   products or prices. The UI is built to render them as soon as real data
 *   is plugged in (see `@/lib/account`), and shows proper empty states until then.
 */

export const customerProfile: CustomerProfile = {
  firstName: "Ana",
  fullName: "Ana Exemplo",
  email: "ana.exemplo@exemplo.pt",
  phone: "+351 900 000 000",
  addresses: [
    {
      id: "casa",
      label: "Casa",
      street: "Rua Exemplo, n.º 1",
      postalCode: "0000-000",
      city: "Localidade",
    },
    {
      id: "escritorio",
      label: "Escritório",
      street: "Avenida Exemplo, n.º 2",
      postalCode: "0000-000",
      city: "Localidade",
    },
  ],
  billing: {
    name: "Ana Exemplo",
    taxId: "000000000",
    street: "Rua Exemplo, n.º 1",
    postalCode: "0000-000",
    city: "Localidade",
  },
};

export const orders: Order[] = [];

export const ownedSolutions: OwnedSolution[] = [];

export const favoriteProducts: FavoriteProduct[] = [];

export const supportTickets: SupportTicket[] = [];

export const sessionDevices: SessionDevice[] = [
  { id: "current", label: "Este dispositivo", current: true },
];
