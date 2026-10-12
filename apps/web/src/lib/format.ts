const priceFormatter = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const exactPriceFormatter = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
});

/**
 * Preços inteiros sem cêntimos ("89 €"); com cêntimos mostra-os ("12,50 €"),
 * para nunca arredondar o valor real.
 */
export function formatPrice(value: number): string {
  return Number.isInteger(value) ? priceFormatter.format(value) : exactPriceFormatter.format(value);
}

/** Like `formatPrice`, but always keeps the cents (orders, invoices). */
export function formatExactPrice(value: number): string {
  return exactPriceFormatter.format(value);
}

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

/** "Agora mesmo", "Há 5 minutos", "Há 3 horas", "Ontem" ou a data. */
export function formatRelativeTime(value: Date | string, now: Date = new Date()): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000);

  if (minutes < 1) return "Agora mesmo";
  if (minutes < 60) return `Há ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Há ${hours} ${hours === 1 ? "hora" : "horas"}`;
  if (hours < 48) return "Ontem";

  return formatDate(date.toISOString());
}
