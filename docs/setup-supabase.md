# Configuração da primeira entrega de identidade

## Estado verificado

Projeto de desenvolvimento: `catapimba`, referência `sahxhhbpagnygnpjtfxz`, região
São Paulo (`sa-east-1`), organização `gustavorosario721` no plano Free.

A migration `20261025130235_identity_foundation.sql` foi aplicada pela conexão
Supabase e está registrada no histórico remoto. O arquivo foi criado inicialmente
pela CLI; seu prefixo foi alinhado à versão efetivamente registrada pelo servidor.
Não reaplicar manualmente a migration em um banco que já a possui.

As tabelas contêm apenas a fundação de identidade, sem projetos ou dados demo.
`supabase/tests/identity-rls.sql` executa fixtures temporárias com rollback e verifica
RLS sob os papéis PostgreSQL `authenticated` e `anon`. Isso testa as políticas no
banco real; não equivale a concluir uma autenticação Google ponta a ponta.

O advisor de segurança retornou somente um aviso informativo de RLS sem políticas
em `private.audit_events`. Isso é intencional: a tabela de auditoria é privada,
sem grants aos clientes e sem leitura/escrita pública.
[Descrição do aviso](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

## Rotas desta entrega

- `/login`: entrada Google, sem seletor de identidade fictícia.
- `/auth/callback`: conclusão PKCE e tratamento de acesso cancelado/incompleto.
- `/conta`: consulta dos próprios vínculos e saída da sessão local.
- `/api/auth/me`: valida o bearer token com Supabase Auth e consulta vínculos pela
  Data API com o mesmo JWT. Sem token/malformado: 401. Configuração ou serviço
  indisponível: 503. Respostas usam `Cache-Control: no-store`.

O protótipo continua acessível separadamente em `/instituicao`, identificado como
Demonstração. Seus registros são fictícios. Ter sessão real não converte seus dados
em persistência nem transforma esse seletor em autenticação.

## Ativação Google — ação no painel

A última consulta a `/auth/v1/settings` confirmou `external.google = false`.
A conexão Supabase disponível não inclui alteração das credenciais do provedor.
Não considerar o login concluído até testar uma entrada real após essa configuração.

1. Abra o [projeto Supabase](https://supabase.com/dashboard/project/sahxhhbpagnygnpjtfxz).
2. Em Authentication, abra os provedores de login e selecione Google.
3. Crie/configure um cliente OAuth do tipo aplicação web no Google Cloud, com a tela
   de consentimento. Se o aplicativo Google estiver em modo de teste, inclua as
   contas que participarão do teste, conforme os requisitos exibidos pelo Google.
4. Cadastre no cliente Google o callback Supabase:
   `https://sahxhhbpagnygnpjtfxz.supabase.co/auth/v1/callback`.
5. Cole Client ID e Client Secret diretamente no painel Supabase e habilite Google.
   Não versionar, imprimir em logs nem enviar essas credenciais no chat.
6. Em URL Configuration do Supabase, configure Site URL e a allowlist de retorno
   usando a URL estável do preview desta branch (confirmar no deploy) e o caminho
   `/auth/callback`. Para desenvolvimento, permitir também
   `http://localhost:5173/auth/callback`. Evite um wildcard geral `*.vercel.app`.
7. Abra `/login`, entre com Google, confirme `/conta`, saia e verifique que a conta
   deixa de ser exibida. Teste também cancelamento e uma sessão inválida na API.

Não conceder privilégio administrativo a quem completar esse fluxo. A conta sem
vínculos verá a orientação de aguardar o administrador. Solicitação, aprovação e
CRUD administrativo serão implementados na próxima entrega.

## Variáveis e execução local

A branch `feat/identity-foundation` tem quatro variáveis configuradas apenas para
seus previews na Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
`SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`. A chave é publicável, não administrativa.

Os exemplos ficam nas pastas das aplicações. O Vite carrega o `.env.local` do
frontend. Para a API, use Node 24 com `--env-file=.env.local` na pasta api-server,
mais `PORT=3001`, após compilar. Nenhuma conexão privilegiada Postgres é necessária
para executar `/api/auth/me`.

Não usar `DATABASE_URL` ou a service-role para simular acesso de um usuário.
Não executar `drizzle-kit push` em paralelo com as migrations SQL desta fundação.

## Bootstrap restrito

Após a primeira entrada real, identificar o UUID correto em Authentication/Users.
O arquivo `supabase/bootstrap-superadmin.sql` é um procedimento de operador via
psql com conexão privilegiada, nunca um endpoint público. Exige UUID explícito,
não reativa concessões revogadas e registra uma nova concessão na auditoria.
Ainda não foi executado: nenhuma pessoa recebeu privilégio de plataforma.
