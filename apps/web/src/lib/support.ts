/**
 * Support request model. There is no ticket system yet: this file only defines
 * the shape of a request and its validation, so the form can be connected to a
 * real backend later without changing the UI.
 */

export const supportCategories = [
  { value: "order", label: "Encomenda ou entrega" },
  { value: "installation", label: "Instalação e configuração" },
  { value: "equipment", label: "Equipamento ou solução" },
  { value: "billing", label: "Faturação" },
  { value: "other", label: "Outro assunto" },
] as const;

export type SupportCategory = (typeof supportCategories)[number]["value"];

export const SUPPORT_SUBJECT_MAX_LENGTH = 120;
export const SUPPORT_MESSAGE_MIN_LENGTH = 10;
export const SUPPORT_MESSAGE_MAX_LENGTH = 2000;

export interface SupportRequestInput {
  category: SupportCategory;
  subject: string;
  message: string;
}

export type SupportRequestErrors = Partial<Record<"subject" | "message", string>>;

export function isSupportCategory(value: string): value is SupportCategory {
  return supportCategories.some((category) => category.value === value);
}

export function validateSupportRequest(input: SupportRequestInput): SupportRequestErrors {
  const errors: SupportRequestErrors = {};
  const subject = input.subject.trim();
  const message = input.message.trim();

  if (!subject) {
    errors.subject = "Indica o assunto do pedido.";
  }

  if (!message) {
    errors.message = "Descreve como te podemos ajudar.";
  } else if (message.length < SUPPORT_MESSAGE_MIN_LENGTH) {
    errors.message = `Escreve pelo menos ${SUPPORT_MESSAGE_MIN_LENGTH} caracteres para percebermos o que se passa.`;
  }

  return errors;
}
