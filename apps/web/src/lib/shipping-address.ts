/**
 * Morada de entrega (sem dependências de servidor: serve para validar em
 * servidor e, se for preciso, mostrar erros num formulário).
 *
 * Por agora só entregamos em Portugal: o país é sempre "PT" e o código postal
 * tem de ter o formato português (0000-000). Os portes e outros países
 * ainda não estão decididos.
 */
export interface ShippingAddress {
  name: string;
  /** Opcional (para o transportador contactar). */
  phone: string;
  line1: string;
  /** Opcional (andar, porta…). */
  line2: string;
  postalCode: string;
  city: string;
  country: "PT";
}

export type ShippingAddressErrors = Partial<Record<keyof ShippingAddress, string>>;

export const SHIPPING_LIMITS = {
  nameMin: 2,
  nameMax: 80,
  lineMin: 3,
  lineMax: 120,
  cityMin: 2,
  cityMax: 60,
} as const;

const POSTAL_CODE_PATTERN = /^\d{4}-\d{3}$/;
const PHONE_PATTERN = /^[+\d][\d\s-]{5,19}$/;

function text(value: unknown, max: number): string {
  return typeof value === "string" && value.length <= max * 2 ? value.trim() : "";
}

export type ShippingAddressResult =
  | { ok: true; address: ShippingAddress }
  | { ok: false; errors: ShippingAddressErrors };

/** Valida (e limpa espaços) uma morada vinda do cliente: o `input` não é de confiança. */
export function validateShippingAddress(input: unknown): ShippingAddressResult {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const L = SHIPPING_LIMITS;

  const address: ShippingAddress = {
    name: text(raw.name, L.nameMax),
    phone: text(raw.phone, 20),
    line1: text(raw.line1, L.lineMax),
    line2: text(raw.line2, L.lineMax),
    postalCode: text(raw.postalCode, 8),
    city: text(raw.city, L.cityMax),
    country: "PT",
  };

  const errors: ShippingAddressErrors = {};
  if (address.name.length < L.nameMin || address.name.length > L.nameMax) {
    errors.name = `O nome deve ter entre ${L.nameMin} e ${L.nameMax} caracteres.`;
  }
  if (address.line1.length < L.lineMin || address.line1.length > L.lineMax) {
    errors.line1 = "Indica a rua e o número.";
  }
  if (address.line2.length > L.lineMax) errors.line2 = "Texto demasiado longo.";
  if (!POSTAL_CODE_PATTERN.test(address.postalCode)) {
    errors.postalCode = "Indica o código postal no formato 0000-000.";
  }
  if (address.city.length < L.cityMin || address.city.length > L.cityMax) {
    errors.city = "Indica a localidade.";
  }
  if (address.phone && !PHONE_PATTERN.test(address.phone)) {
    errors.phone = "Indica um número de telefone válido.";
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, address };
}

/** Morada numa só string, uma linha por linha de morada (para mostrar com `whitespace-pre-line`). */
export function formatShippingAddress(address: ShippingAddress): string {
  return [
    address.name,
    address.line1,
    address.line2,
    `${address.postalCode} ${address.city}`,
    "Portugal",
  ]
    .filter(Boolean)
    .join("\n");
}
