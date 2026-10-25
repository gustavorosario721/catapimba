# Plataforma de Gestão e Avaliação de Startups

Aplicação Vite + Express em um único projeto Vercel, com Google via Supabase Auth e PostgreSQL. A área real `/conta` oferece gestão de instituições, usuários e acessos, projetos/equipes, critérios, bancas, avaliações, resultados, CSV, pódio e auditoria. O protótipo visual permanece nas rotas demonstrativas.

Consulte [o roteiro de uso, permissões, testes e limites](docs/workspace.md) e [a configuração Supabase](docs/setup-supabase.md).

## Preparação

Use Node.js 24 e pnpm 11.25.0, declarados em `package.json`. Na raiz:

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run build
```

O lockfile oficial é `pnpm-lock.yaml`; não execute `npm install`.
A instalação não deve apagar arquivos versionados.
A política de idade mínima de dependências permanece habilitada.

## Execução local

Frontend em http://localhost:5173:

```bash
pnpm --filter @workspace/startup-institution-platform run dev
```

API em outro terminal, em http://localhost:3001/api/healthz:

```bash
PORT=3001 pnpm --filter @workspace/api-server run dev
```

O health check confirma apenas o processo, sem consultar banco. Para a área real, configure as variáveis dos arquivos `.env.example` de frontend e API, usando URL e chave publicável Supabase. As migrações oficiais estão em `supabase/migrations`; o pacote legado `lib/db` não é utilizado por essas operações. Não execute comandos Drizzle para recriar o esquema.

O frontend local encaminha `/api` para o Express. Em Vercel, `vercel.json` direciona `/api/*` à função `api/index.mjs` e as rotas da interface à SPA. A raiz do projeto Vercel é a raiz deste monorepo. Não existe servidor separado no Render.

O preview autenticado usa a branch `feat/identity-foundation`. Produção precisa de variáveis e callbacks próprios. Autorização de plataforma é concedida por procedimento controlado, nunca por cadastro público; não use metadados de perfil para conceder privilégios.

## Verificação

```bash
pnpm run build:vercel
pnpm test:routing
pnpm check:deployment https://URL-DO-PREVIEW
```

Os testes SQL com rollback estão em `supabase/tests`. Há teste de navegador opcional descrito em `docs/workspace.md`. Diferencie build, testes com API simulada, testes reais de banco e validação de implantação.

## Credenciais e orçamento

Nunca versionar segredos. `VITE_*` é público: nunca incluir senha de banco, `service_role` ou segredo OAuth. O backend usa JWT do usuário e chave publicável. As funções privilegiadas verificam autorização explicitamente, além de RLS para consultas diretas.

Orçamento: R$ 0 durante desenvolvimento e demonstração. Nenhum plano pago foi contratado. Vercel Hobby tem restrições de uso comercial; Supabase Free tem cotas e pode pausar por inatividade. Monitorar limites antes de expandir uso.
