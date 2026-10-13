import { meetsAllPasswordRules } from "@/lib/password";

/** Cookie de sessão dos clientes (seguro para importar em cliente e servidor). */
export const CUSTOMER_SESSION_COOKIE = "mutaris_session";
/** 7 dias, em segundos. */
export const CUSTOMER_SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 80;
export const EMAIL_MAX_LENGTH = 254;
/** Limite máximo para uma password não servir de ataque ao servidor (scrypt é pesado). */
export const PASSWORD_MAX_LENGTH = 200;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return value.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(value);
}

export interface RegistrationInput {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

export type RegistrationErrors = Partial<Record<keyof RegistrationInput, string>>;

/** Valida o registo (usado no cliente para feedback e no servidor como regra final). */
export function validateRegistration(input: RegistrationInput): RegistrationErrors {
  const errors: RegistrationErrors = {};
  const name = input.name.trim();

  if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) {
    errors.name = `O nome deve ter entre ${NAME_MIN_LENGTH} e ${NAME_MAX_LENGTH} caracteres.`;
  }
  if (!isValidEmail(normalizeEmail(input.email))) {
    errors.email = "Indica um email válido.";
  }
  if (!meetsAllPasswordRules(input.password)) {
    errors.password = "A palavra-passe ainda não cumpre todos os requisitos.";
  } else if (input.password.length > PASSWORD_MAX_LENGTH) {
    errors.password = `A palavra-passe pode ter no máximo ${PASSWORD_MAX_LENGTH} caracteres.`;
  }
  if (!input.acceptTerms) {
    errors.acceptTerms = "Tens de aceitar os Termos e a Política de Privacidade.";
  }
  return errors;
}
