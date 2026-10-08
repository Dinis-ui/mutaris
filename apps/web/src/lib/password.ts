export const PASSWORD_MIN_LENGTH = 12;

export interface PasswordRule {
  id: "length" | "uppercase" | "lowercase" | "number" | "symbol";
  label: string;
  test: (value: string) => boolean;
}

/**
 * Letters are matched with Unicode classes so accented characters (é, ç, Ã…)
 * count as letters — never as symbols.
 */
export const passwordRules: PasswordRule[] = [
  {
    id: "length",
    label: `Pelo menos ${PASSWORD_MIN_LENGTH} caracteres`,
    test: (value) => value.length >= PASSWORD_MIN_LENGTH,
  },
  { id: "uppercase", label: "Uma letra maiúscula", test: (value) => /\p{Lu}/u.test(value) },
  { id: "lowercase", label: "Uma letra minúscula", test: (value) => /\p{Ll}/u.test(value) },
  { id: "number", label: "Um número", test: (value) => /\d/.test(value) },
  {
    id: "symbol",
    label: "Um símbolo (por exemplo: ! ? # @ €)",
    test: (value) => /[^\p{L}\p{N}\s]/u.test(value),
  },
];

export function meetsAllPasswordRules(value: string): boolean {
  return passwordRules.every((rule) => rule.test(value));
}

export interface PasswordStrength {
  /** 0 = empty, 4 = strongest. Drives the number of filled bar segments. */
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
}

export function getPasswordStrength(value: string): PasswordStrength {
  if (!value) return { level: 0, label: "" };

  const met = passwordRules.filter((rule) => rule.test(value)).length;

  if (met === passwordRules.length) {
    return value.length >= 16
      ? { level: 4, label: "Muito forte" }
      : { level: 3, label: "Forte" };
  }
  if (met >= 3) return { level: 2, label: "Razoável" };
  return { level: 1, label: "Fraca" };
}

export interface PasswordChangeInput {
  current: string;
  next: string;
  confirm: string;
}

export type PasswordChangeErrors = Partial<Record<keyof PasswordChangeInput, string>>;

export function validatePasswordChange(input: PasswordChangeInput): PasswordChangeErrors {
  const errors: PasswordChangeErrors = {};

  if (!input.current) {
    errors.current = "Indica a tua palavra-passe atual.";
  }

  if (!meetsAllPasswordRules(input.next)) {
    errors.next = "A nova palavra-passe ainda não cumpre todos os requisitos.";
  } else if (input.next === input.current) {
    errors.next = "A nova palavra-passe deve ser diferente da atual.";
  }

  if (!input.confirm) {
    errors.confirm = "Confirma a nova palavra-passe.";
  } else if (input.confirm !== input.next) {
    errors.confirm = "As palavras-passe não coincidem.";
  }

  return errors;
}
