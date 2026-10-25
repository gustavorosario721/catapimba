# Plataforma de Gestão e Avaliação de Startups

Protótipo em português. Dados e operações de negócio ainda são demonstrativos,
sem persistência. Não utilizar dados pessoais reais nesta fase.

## Preparação

Use Node.js 24 e pnpm 11.25.0, declarados em `package.json`. Na raiz:

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run build
```

O lockfile oficial é `pnpm-lock.yaml`. O `package-lock.json` herdado não é usado;
não execute `npm install`. A instalação não deve apagar arquivos versionados.
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

O health check retorna `{"status":"ok"}` e não verifica o banco. O frontend ainda
não consome operações de negócio da API. Não são necessárias credenciais para
esses dois processos. `DATABASE_URL` será necessária para utilizar o pacote de
banco ou suas ferramentas; não execute comandos de alteração do esquema agora.

Sandbox auxiliar em http://localhost:5174:

```bash
pnpm --filter @workspace/mockup-sandbox run dev
```

`PORT` e `BASE_PATH` substituem os padrões Vite; o caminho padrão é `/`.
O build frontend fica em `artifacts/startup-institution-platform/dist/public`.
O build da API gera `artifacts/api-server/dist/index.mjs` (ESM).

## Estrutura

| Diretório | Responsabilidade |
| --- | --- |
| `artifacts/startup-institution-platform` | React, Vite, wouter e Tailwind; aplicação principal |
| `artifacts/api-server` | Express; somente health check implementado |
| `artifacts/mockup-sandbox` | Pré-visualização auxiliar de componentes |
| `lib/db` | Drizzle e PostgreSQL; esquema vazio |
| `lib/api-spec` | OpenAPI e geração Orval |
| `lib/api-client-react` | Cliente e hooks gerados |
| `lib/api-zod` | Schemas e tipos gerados |

## Arquitetura aprovada

Preservar Vite + Express e implantar ambos em um único projeto Vercel. A integração
e o preview ainda precisam ser implementados e verificados. Não há deploy validado.

Usar Supabase PostgreSQL e Auth. O fluxo inicial recomendado é Google OAuth para
evitar depender de SMTP para confirmação e recuperação de senha. Será necessário
configurar o provedor Google e URLs de callback no Supabase. Nenhuma integração de
autenticação, tabela, RLS ou conexão Supabase foi implementada ainda.

Autenticação identifica a pessoa; o servidor deverá verificar vínculo aprovado,
instituição ativa e permissão sobre cada recurso. O primeiro superadministrador
será concedido por procedimento controlado, nunca por cadastro público.

RLS não protege automaticamente consultas privilegiadas do servidor. A identidade
das conexões e os papéis do banco deverão ser explícitos e testados. Não presumir
que exista Bolt Database conectado ao projeto.

## Credenciais e orçamento

Nunca versionar segredos. Variáveis `VITE_*` são públicas: não colocar nelas
`DATABASE_URL`, segredos OAuth ou chaves administrativas do Supabase.

Orçamento de desenvolvimento: R$ 0. Os planos gratuitos têm cotas e condições.
Vercel Hobby é para uso pessoal não comercial; Supabase Free pode pausar por
inatividade. Verificar condições atuais antes de habilitar recursos pagos.

## Verificação e próxima etapa

`pnpm run build` verifica tipos e compila as aplicações, inclusive o sandbox.
Ainda não existe suíte automatizada de testes de negócio ou navegador. Build e
typecheck não comprovam segurança, conexão de banco ou deploy.

Próxima etapa: adaptar a entrada Express e configurar o roteamento SPA/API na
Vercel, selecionando os pacotes necessários ao build. Verificar em preview URLs
diretas, assets, health check e respostas para endpoints inexistentes. Depois,
implementar identidade e isolamento com testes negativos entre duas instituições.
