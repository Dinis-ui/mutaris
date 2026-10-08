import type { AccountNavLink, NavLink } from "@workspace/types";

export const mainNav: NavLink[] = [
  { label: "Soluções", href: "/solucoes" },
  { label: "Loja", href: "/loja" },
  { label: "Como funciona", href: "/como-funciona" },
  { label: "Suporte", href: "/suporte" },
];

export const footerNav: NavLink[] = [
  { label: "Soluções", href: "/solucoes" },
  { label: "Loja", href: "/loja" },
  { label: "Guias", href: "/guias" },
  { label: "Suporte", href: "/suporte" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contactos", href: "/contactos" },
  { label: "Termos", href: "/termos" },
  { label: "Privacidade", href: "/privacidade" },
];

/** Sidebar / tabs inside the customer area. */
export const accountNav: AccountNavLink[] = [
  { label: "Visão geral", href: "/conta", icon: "layout-dashboard" },
  { label: "Encomendas", href: "/conta/pedidos", icon: "package" },
  { label: "As minhas soluções", href: "/conta/solucoes", icon: "boxes" },
  { label: "Favoritos", href: "/conta/favoritos", icon: "heart" },
  { label: "Dados pessoais", href: "/conta/dados", icon: "user" },
  { label: "Segurança", href: "/conta/seguranca", icon: "lock" },
  { label: "Suporte", href: "/conta/suporte", icon: "life-buoy" },
];

/** Dropdown opened from the user icon in the header ("Terminar sessão" is an action, added by the menu). */
export const accountMenuNav: AccountNavLink[] = [
  { label: "Minha conta", href: "/conta", icon: "user" },
  { label: "Encomendas", href: "/conta/pedidos", icon: "package" },
  { label: "As minhas soluções", href: "/conta/solucoes", icon: "boxes" },
  { label: "Favoritos", href: "/conta/favoritos", icon: "heart" },
  { label: "Suporte", href: "/conta/suporte", icon: "life-buoy" },
  { label: "Definições", href: "/conta/dados", icon: "settings" },
];
/** Sidebar do backoffice (administração interna). */
export const backofficeNav: AccountNavLink[] = [
  { label: "Dashboard", href: "/backoffice", icon: "layout-dashboard" },
  { label: "Utilizadores", href: "/backoffice/utilizadores", icon: "user" },
  { label: "Suporte", href: "/backoffice/suporte", icon: "life-buoy" },
  { label: "Loja", href: "/backoffice/loja", icon: "store" },
  { label: "Encomendas", href: "/backoffice/encomendas", icon: "package" },
];