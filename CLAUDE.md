# MUTARIS — contexto do projeto

Loja online e área de cliente de segurança (casas e pequenos negócios, Portugal). Projeto de uma pessoa só (Dinis), que está a aprender; explica as decisões em linguagem simples.

## Regras de trabalho
- **Idioma:** conversa e todo o texto do site em **português de Portugal (PT-PT)**. Código e nomes de ficheiros em inglês, comentários em português como já existe.
- **Honestidade no site:** nada de dados inventados. Conteúdo de demonstração é marcado como "Demo"; o que não existe diz "não disponível". Não quebrar páginas públicas.
- **Segredos:** nunca pedir, mostrar nem fazer commit de connection strings, tokens ou passwords. `.env.local` está no `.gitignore`. Não imprimir passwords reais.
- **Antes de dar uma tarefa por feita:** correr `npm run typecheck`, `npm run lint` e `npm test` (ver abaixo). Passos pequenos; um commit por funcionalidade. Ficheiros em `.github/` podem ser protegidos nalguns ambientes.
- **Textos legais** (`/termos`, `/privacidade`): têm marcadores `[...]` que só o dono preenche (NIF, morada, prazos…). Não inventar valores; não os remover sem os dados reais.

## Stack
- Monorepo npm workspaces: `apps/web` (Next.js), `packages/ui`, `packages/types`, `packages/config`.
- Next.js 16 (App Router, Turbopack), React 19, TypeScript ~6, Tailwind v4. **`src/proxy.ts` substitui o `middleware.ts`**.
- Base de dados: PostgreSQL (Neon) com Drizzle ORM + driver `postgres`. Migrações com drizzle-kit.
- Alojamento: Vercel (`mutaris-3cda.vercel.app`, GitHub `Dinis-ui/mutaris`, root directory `apps/web`). Imagens de produtos no Vercel Blob (`@vercel/blob`).
- Testes: Vitest (`apps/web/src/**/*.test.ts`, alias `@` → `src`). Testes com base de dados (`*.db.test.ts`, apoio em `src/test/`) só correm se `TEST_DATABASE_URL` estiver definido; a base é **apagada e recriada** com as migrações reais, por isso o nome tem de conter `test` (senão recusa). Nunca apontar para a Neon de produção. O CI usa um PostgreSQL 16 de serviço.
- Ainda **sem domínio** e **sem email transacional**.

## Comandos (a partir da raiz, `C:\mutaris\mutaris`, PowerShell)
```
npm run dev -w @workspace/web
npm run typecheck -w @workspace/web     # next typegen && tsc --noEmit
npm run lint -w @workspace/web
npm test                                # vitest run (testes com BD só correm com TEST_DATABASE_URL)
npm run db:generate -w @workspace/web   # gerar migração após alterar schema.ts
npm run db:migrate -w @workspace/web
npm run db:seed -w @workspace/web
npm run admin:setup -w @workspace/web   # cria/atualiza um administrador
```
Windows: se o PowerShell bloquear `npm.ps1`, usar `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` ou `npm.cmd`. Para correr migrações contra produção definir `$env:DATABASE_URL` (sintaxe PowerShell) **só na sessão** e confirmar o destino antes. O `drizzle.config.ts` usa `loadEnvConfig` (variáveis do shell têm prioridade sobre `.env.local`).
O `build` precisa de uma base de dados real (as páginas públicas leem produtos), por isso o CI não o corre; a Vercel valida-o.

## Variáveis de ambiente
`DATABASE_URL` (Neon), `BLOB_READ_WRITE_TOKEN` (Vercel Blob), opcional `NEXT_PUBLIC_SITE_URL` (domínio público; senão usa `VERCEL_PROJECT_PRODUCTION_URL`). Ver `apps/web/.env.example`.

## Arquitetura (apps/web/src)
- `db/schema.ts`: `admins`, `admin_sessions`, `login_failures`, `audit_log`, `users`, `user_sessions`, `products`, `support_tickets`, `orders`.
- `app/` páginas públicas (loja, soluções, guias, suporte, sobre, termos, privacidade, carrinho…), `conta/` (área de cliente), `backoffice/` (administração), `api/` (login/logout/sessão de admins e clientes, upload de imagens).
- `lib/` lógica de servidor e partilhada; `components/`; `config/` (site, navegação); `data/` (conteúdo estático/demo).

### Autenticação (admins e clientes, mesmo padrão)
- Token aleatório de 256 bits em cookie `httpOnly`/`Secure`; na BD só o **hash SHA-256** do token (`admin_sessions`, `user_sessions`).
  Admin: cookie `mutaris_backoffice_session`, 8 h. Cliente: `mutaris_session`, 7 dias.
- Passwords com scrypt, formato `scrypt:<salt hex>:<hash hex>` (`lib/password-hash.ts`). Requisitos: 12+ caracteres, maiúscula, minúscula, número, símbolo (`lib/password.ts`).
- **A validação real fica junto dos dados:** `requireAdmin()` em todas as funções/ações do backoffice e `requireUser()` em todas as páginas `/conta`. O `proxy.ts` só verifica a *presença* do cookie.
- Limite de tentativas de login na BD (`lib/backoffice-rate-limit.ts`, tabela `login_failures`): janela 15 min, 5 por IP+identificador e 20 por IP; chaves com âmbito (`admin`, `customer`, `register`, `password`). IP vem de `x-forwarded-for` (de confiança na Vercel).
- Suspender um cliente bloqueia o acesso de imediato.
- **Perfis de administrador** (`admins.role`, `lib/admin-permissions.ts`): `read` (Leitura: só vê), `support` (Suporte: + pedidos de suporte), `full` (Total: tudo, incl. loja, encomendas, clientes e administradores). Permissões: `view`, `support`, `manage`, `admins`. `requireAdmin("permissão")` redireciona para `/backoffice/sem-permissao`; Server Actions devolvem erro (`FORBIDDEN_MESSAGE`). O perfil é lido a cada pedido (efeito imediato). Contas antigas ficaram `full`; tem de haver sempre um `full` ativo. Ao criar uma função/ação de escrita nova, escolher a permissão certa.

### Padrão de Server Action
`"use server"` → `requireAdmin()`/`requireUser()` → **validar de novo os argumentos** (vêm do cliente) → `try/catch` → `recordActivity(...)` (registo de auditoria, não falha a ação) → `revalidatePath`. Componentes de cliente usam `useTransition`; formulários com `onSubmit` + `startTransition` para evitar o reset de formulário do React 19.

### Outros
- Páginas públicas usam ISR/estáticas; o estado de sessão no cabeçalho vem de `fetch('/api/conta-sessao')` no cliente.
- Imagens de produtos: validar tipo pelo conteúdo (`lib/product-image.ts`), só URLs do nosso Blob (`isBlobImageUrl`), máx. 4 MB.
- SEO: `app/robots.ts`, `app/sitemap.ts`, JSON-LD em produtos e organização; produtos demo não são indexados.
- Auditoria: `lib/audit.ts` (`recordActivity`) e `lib/audit-actions.ts` (lista de ações e títulos); histórico em `/backoffice/atividade`.

## Estado atual
**Feito:** site público; contas de cliente (registo, login, sessões, perfil, palavra-passe, pedidos, pedidos de suporte); backoffice (utilizadores, suporte, loja com imagens, encomendas, administradores com perfis de permissões, a minha conta, histórico de atividade); deploy na Vercel com Neon de produção; testes Vitest; SEO base; textos legais reescritos (com marcadores).

**Por fazer / decisões do dono em aberto:**
1. Dar uma conta a um agente de IA: criar um administrador com perfil **Leitura** em `/backoffice/administradores` (ações que mexem em dinheiro/clientes só com aprovação humana).
2. Encomendas completas: itens, morada de envio, carrinho/checkout. Bloqueado por: fornecedor de pagamentos, portes, IVA.
3. Email (verificação, recuperação de palavra-passe, notificações) — precisa de domínio.
4. Preencher os marcadores dos textos legais; Livro de Reclamações/RAL.
5. "Eliminar conta" na área de cliente; imagem de partilha (Open Graph) quando houver marca.
6. Mais testes com base de dados (login de administradores/clientes, registo, encomendas). Já cobertos: perfis de permissões, sessões de admin, limite de tentativas.

## Limitações conhecidas
- Registo revela se um email já existe ("Já existe uma conta…"); sem verificação de email nem recuperação de palavra-passe.
- Encomendas sem itens nem morada; um só imagem por produto; imagens carregadas e não guardadas podem ficar no Blob.
- Ficheiros de utilizador carregados nunca se editam no sítio: trabalhar sobre cópias.
