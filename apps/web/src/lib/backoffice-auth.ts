/**
 * Constantes da sessão do backoffice. Ficheiro sem dependências de
 * servidor, para poder ser importado também pelo middleware.
 *
 * A sessão em si (token aleatório + linha em `admin_sessions`) vive em
 * `lib/backoffice-session-server.ts`.
 */

export const BACKOFFICE_SESSION_COOKIE = "mutaris_backoffice_session";
export const BACKOFFICE_SESSION_MAX_AGE = 60 * 60 * 8; // 8 horas
