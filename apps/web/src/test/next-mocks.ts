/**
 * Simulações do Next.js para testes (cookies, redirect, revalidatePath).
 * Usadas com `vi.mock(..., async () => (await import("@/test/next-mocks")).xxx)`.
 */
export const cookieJar = new Map<string, string>();

export const headersMock = {
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieJar.get(name);
      return value === undefined ? undefined : { name, value };
    },
  }),
};

/** `redirect()` do Next lança um erro; aqui lança um erro fácil de verificar. */
export class RedirectError extends Error {
  constructor(public readonly url: string) {
    super(`REDIRECT:${url}`);
  }
}

export const navigationMock = {
  redirect: (url: string) => {
    throw new RedirectError(url);
  },
};

export const cacheMock = {
  revalidatePath: () => {},
};
