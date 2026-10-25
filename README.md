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

Preservar Vite + Express e implantar ambos em um único projeto Vercel. A configuração está em `vercel.json` e a entrada da função está em `api/index.mjs`.
O preview remoto ainda precisa ser publicado e verificado. Não há deploy validado.

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
Os testes de roteamento da API estão em `scripts/src/api-routing.test.mjs` (`pnpm test:routing`).
Ainda não existem testes de negócio ou navegador. Build e typecheck não comprovam
segurança, conexão de banco ou deploy.

## Vercel: frontend e API no mesmo projeto

Importe este repositório com **Root Directory na raiz**, nunca na pasta do frontend.
Use Node.js 24 e o preset Vite. `vercel.json` define instalação com lockfile,
`pnpm run build:vercel` e o diretório de saída. Esse build verifica bibliotecas,
API e frontend principal; não compila o sandbox auxiliar.

`api/index.mjs` exporta o Express sem iniciar listener. O esbuild gera `dist/app.mjs` antes de a Vercel empacotar a função. `/api/*` vai para a função; os demais caminhos da
interface recebem `index.html`, preservando arquivos estáticos. `/assets/*` não
recebe o fallback da SPA, para que assets inexistentes retornem 404.

Não configure `DATABASE_URL` ou credenciais Supabase para esta primeira validação.
O health check não acessa o banco. Não existe outro servidor de aplicação no Render.

Após publicar um preview, execute:

```bash
pnpm check:deployment https://URL-DO-PREVIEW
```

Esse comando verifica health check, query string, API inexistente (404 JSON),
método incorreto, URLs diretas da interface, bundle JavaScript e asset inexistente.
O preview precisa estar acessível ao executor; uma tela de proteção de deploy não
é resultado válido da aplicação. Não desabilite proteções de produção para o teste.

O build local e os testes Express não validam o roteamento da infraestrutura Vercel.
Somente registre a implantação como concluída após executar as verificações contra
a URL remota. Em seguida, implementar identidade e isolamento institucional.
