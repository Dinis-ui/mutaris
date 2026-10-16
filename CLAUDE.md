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
- `db/schema.ts`: `admins`, `admin_sessions`, `login_failures`, `audit_log`, `users`, `user_sessions`, `products`, `support_tickets`, `orders`, `order_items`.
- `app/` páginas públicas (loja, soluções, guias, suporte, sobre, termos, privacidade, carrinho…), `conta/` (área de cliente), `backoffice/` (administração), `api/` (login/logout/sessão de admins e clientes, upload de imagens).
- `lib/` lógica de servidor e partilhada; `components/`; `config/` (site, navegação); `data/` (conteúdo estático/demo).

### Autenticação (admins e clientes, mesmo padrão)
- Token aleatório de 256 bits em cookie `httpOnly`/`Secure`; na BD só o **hash SHA-256** do token (`admin_sessions`, `user_sessions`).
  Admin: cookie `mutaris_backoffice_session`, 8 h. Cliente: `mutaris_session`, 7 dias.
- Passwords com scrypt, formato `scrypt:<salt hex>:<hash hex>` (`lib/password-hash.ts`). Requisitos: 12+ caracteres, maiúscula, minúscula, número, símbolo (`lib/password.ts`).
- **A validação real fica junto dos dados:** `requireAdmin()` em todas as funções/ações do backoffice e `requireUser()` em todas as páginas `/conta`. O `proxy.ts` só verifica a *presença* do cookie.
- Limite de tentativas de login na BD (`lib/backoffice-rate-limit.ts`, tabela `login_failures`): janela 15 min, 5 por IP+identificador e 20 por IP; chaves com âmbito (`admin`, `customer`, `register`, `password`). IP vem de `x-forwarded-for` (de confiança na Vercel).
- Suspender um cliente bloqueia o acesso de imediato.
- **Base de dados desatualizada** (código à frente das migrações): `requireAdmin()` distingue "sem sessão" (→ login) de "erro da BD" (→ `/backoffice/indisponivel`, que usa `lib/migration-status.ts` para dizer se há migrações por aplicar); o login do backoffice lê `admins.role` para falhar logo com mensagem clara (503). O erro vai para o log do servidor. **Ordem de deploy:** correr `db:migrate` contra a Neon de produção ANTES de fazer merge de uma PR com migração nova.
- **Encomendas** (`orders` + `order_items`, `lib/orders.ts`): `createOrder(userId, {items, shipping})` cria tudo numa transação; o cliente só diz `productId` e quantidade, **preço e nome vêm sempre da BD** (copiados para `order_items`, por isso mudar/apagar o produto não altera encomendas feitas). Só produtos `disponivel`; nasce `awaiting-payment`; total = soma dos artigos (sem portes/IVA, por decidir). Morada copiada para `orders.shipping_*` (`lib/shipping-address.ts`: só Portugal, código postal `0000-000`). A morada é dado pessoal: no backoffice só a vê quem tem a permissão `manage`. Encomendas antigas/demo não têm artigos nem morada e a interface diz isso. **Ainda não há UI de checkout a chamar `createOrder`.**
- **Eliminar conta** (`/conta/seguranca`, `deleteAccount` em `lib/customer-account.ts`): pede a palavra-passe (mesmo limite de tentativas que mudar palavra-passe); apaga cliente, sessões e pedidos de suporte; as encomendas ficam com `user_id` nulo, **mantendo artigos e morada de entrega** (conservação legal); recusa se houver encomendas em curso. Tudo numa transação.
- **Perfis de administrador** (`admins.role`, `lib/admin-permissions.ts`): `read` (Leitura: só vê), `support` (Suporte: + pedidos de suporte), `full` (Total: tudo, incl. loja, encomendas, clientes e administradores). Permissões: `view`, `support`, `manage`, `admins`. `requireAdmin("permissão")` redireciona para `/backoffice/sem-permissao`; Server Actions devolvem erro (`FORBIDDEN_MESSAGE`). O perfil é lido a cada pedido (efeito imediato). Contas antigas ficaram `full`; tem de haver sempre um `full` ativo. Ao criar uma função/ação de escrita nova, escolher a permissão certa.

### Padrão de Server Action
`"use server"` → `requireAdmin()`/`requireUser()` → **validar de novo os argumentos** (vêm do cliente) → `try/catch` → `recordActivity(...)` (registo de auditoria, não falha a ação) → `revalidatePath`. Componentes de cliente usam `useTransition`; formulários com `onSubmit` + `startTransition` para evitar o reset de formulário do React 19.

### Outros
- Páginas públicas usam ISR/estáticas; o estado de sessão no cabeçalho vem de `fetch('/api/conta-sessao')` no cliente.
- Imagens de produtos: validar tipo pelo conteúdo (`lib/product-image.ts`), só URLs do nosso Blob (`isBlobImageUrl`), máx. 4 MB cada e `MAX_PRODUCT_IMAGES` (6) por produto. `products.images` (lista; a primeira é a capa) é a fonte de verdade; `products.image` é uma **coluna em transição** que espelha `images[0]` para o código antigo funcionar entre a migração e o deploy — sai numa migração futura (apagar a coluna e o espelho em `backoffice-products.ts`/`products-server.ts`). Ao guardar/apagar um produto, as imagens removidas são apagadas do Blob.
- **Imagens não usadas** (`/backoffice/loja/imagens`, `lib/unused-images.ts`, permissão `manage`): procura em dois passos (ver, depois confirmar). Só mexe em `produtos/`, só apaga ficheiros com mais de 24 h e que nenhum produto usa (`images` ou `image`); a lista é recalculada no servidor e só apaga se o número bater com o que o administrador viu. Fica no histórico de atividade.
- SEO: `app/robots.ts`, `app/sitemap.ts`, JSON-LD em produtos e organização; produtos demo não são indexados.
- Auditoria: `lib/audit.ts` (`recordActivity`) e `lib/audit-actions.ts` (lista de ações e títulos); histórico em `/backoffice/atividade`.

## Estado atual
**Feito:** site público; contas de cliente (registo, login, sessões, perfil, palavra-passe, eliminar conta, pedidos, pedidos de suporte); backoffice (utilizadores, suporte, loja com imagens, encomendas, administradores com perfis de permissões, a minha conta, histórico de atividade); deploy na Vercel com Neon de produção; testes Vitest; SEO base; textos legais reescritos (com marcadores).

**Por fazer / decisões do dono em aberto:**
1. Dar uma conta a um agente de IA: criar um administrador com perfil **Leitura** em `/backoffice/administradores` (ações que mexem em dinheiro/clientes só com aprovação humana).
2. Checkout: carrinho → formulário de morada → `createOrder` → pagamento. Bloqueado por: fornecedor de pagamentos, portes, IVA (os itens e a morada das encomendas já existem).
3. Email (verificação, recuperação de palavra-passe, notificações) — precisa de domínio.
4. Preencher os marcadores dos textos legais; Livro de Reclamações/RAL.
5. Imagem de partilha (Open Graph) quando houver marca. Apagar a coluna antiga `products.image` (ver Imagens de produtos) depois de a migração 0008 estar em produção e estável.
6. Mais testes com base de dados (encomendas e restantes ações do backoffice). Já cobertos: perfis de permissões, login/logout de admins e clientes, registo, sessões, limite de tentativas, eliminar conta, migrações e esquema alinhado com `schema.ts`.

## Limitações conhecidas
- Registo revela se um email já existe ("Já existe uma conta…"); sem verificação de email nem recuperação de palavra-passe.
- Encomendas antigas e de demonstração sem itens nem morada; só se entrega em Portugal; imagens carregadas e não guardadas ficam no Blob até alguém usar a limpeza em Loja → Imagens não usadas.
- Ficheiros de utilizador carregados nunca se editam no sítio: trabalhar sobre cópias.
