# Catapimba — Gestão e Avaliação de Startups

Aplicação Vite + Express em um único projeto Vercel, com Google via Supabase Auth e PostgreSQL. A área real `/conta` oferece gestão de instituições, usuários e acessos, projetos/equipes, critérios, bancas, avaliações, resultados, CSV, pódio e auditoria. Não há dados ou login de demonstração. Os endereços antigos, como `/instituicao`, encaminham para a área real e exigem sessão.

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

A branch padrão do código é `main`. O preview autenticado existente usa `feat/identity-foundation`. O deploy automático da `main` está desativado em `vercel.json` até autorização explícita de publicação. Produção precisa de variáveis e callbacks próprios. Autorização de plataforma é concedida por procedimento controlado, nunca por cadastro público; não use metadados de perfil para conceder privilégios.

## Verificação

```bash
pnpm run build:vercel
pnpm test:routing
pnpm check:deployment https://URL-DO-PREVIEW
```

Os testes SQL com rollback estão em `supabase/tests`. O teste de navegador `python3 scripts/workspace-browser.py` usa fixtures restritas ao processo de teste; exige Vite preview local, Python Playwright e Chromium. Consulte `docs/workspace.md`. Diferencie build, testes com API simulada, testes reais de banco e validação de implantação.

## Credenciais e orçamento

Nunca versionar segredos. `VITE_*` é público: nunca incluir senha de banco, `service_role` ou segredo OAuth. O backend usa JWT do usuário e chave publicável. As funções privilegiadas verificam autorização explicitamente, além de RLS para consultas diretas.

Orçamento: R$ 0 durante desenvolvimento e demonstração. Nenhum plano pago foi contratado. Vercel Hobby tem restrições de uso comercial; Supabase Free tem cotas e pode pausar por inatividade. Monitorar limites antes de expandir uso.

O refinamento visual usa componentes compartilhados, tipografia de sistema e uma paleta única. Solicitação de acesso é feita somente na conta autenticada; recuperação de acesso é tratada pelo Google, sem senha própria ou envio de e-mail simulado.

O [relatório de refinamento](docs/refinement-validation.md) registra o que mudou, testes locais e limites. O código foi consolidado na `main`; a publicação na Vercel continua dependendo de autorização. A mudança de branch padrão não substitui automaticamente a versão já implantada.
