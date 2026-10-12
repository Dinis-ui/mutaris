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
