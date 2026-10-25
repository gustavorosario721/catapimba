# Base de identidade e isolamento institucional

Estado: fundação de banco e código implementada; provedor Google ainda pendente
de configuração e teste real. Consulte [setup-supabase.md](setup-supabase.md) para
as evidências e os limites desta entrega. O protótipo continua demonstrativo.

## Escopo da primeira entrega

Entrar e sair com Google via Supabase Auth; validar a identidade na API; consultar
os vínculos da própria pessoa e tratar ausência de vínculo, aprovação pendente e
suspensão. Um login bem-sucedido não concede acesso a instituições.

Não implementar nesta entrega CRUD de projetos, bancas, critérios, notas ou
resultados. O seletor de pessoas fictícias nunca será usado no ambiente autenticado.
A demonstração poderá continuar separada e identificada, sem acesso a dados reais.

## Pré-requisitos que devem ser verificados

1. Acessar a conta Supabase e identificar projetos e plano existentes, inclusive
   eventual banco originado no Bolt. Não presumir que esse banco esteja vazio.
2. Confirmar o projeto de desenvolvimento e sua região. Não criar recursos pagos,
   plano Pro ou branches de banco pagas para executar os testes.
3. Inspecionar tabelas, políticas, usuários e configuração de Auth antes de propor
   uma migration. Usar migrations versionadas; não usar `drizzle-kit push --force`.
4. Configurar Google OAuth. As credenciais Google ficam no painel Supabase; não
   pedir que o usuário cole Client Secret ou chaves administrativas na conversa.
5. Configurar o callback do projeto Supabase no Google e as URLs de retorno exatas
   da aplicação no Supabase, incluindo um endereço de preview estável autorizado.
6. Verificar os nomes das variáveis de ambiente na Vercel antes de executar o fluxo
   real. A instalação do plugin não comprova conexão de banco nem provedor OAuth.

## Identidade e sessão

Usar o identificador de `auth.users` como identidade global. Nome e e-mail não são
identificadores de instituição, orientador, projeto ou papel administrativo.

O fluxo inicial proposto para a SPA é Authorization Code com PKCE pelo SDK oficial
Supabase. Não implementar armazenamento próprio de senhas. Não solicitar tokens
Google de acesso a Drive, Gmail ou outros serviços que o produto não utiliza.

O cliente envia o access token Supabase em `Authorization: Bearer` à API Express.
O servidor verifica a identidade com Supabase Auth, sem confiar apenas no conteúdo
decodificado do JWT. Token ausente, inválido ou expirado resulta em 401, sem dados.
Não registrar access token, refresh token, código de callback ou cookies em logs.
Usar respostas de identidade sem cache compartilhado (`Cache-Control: no-store`).

## Modelo mínimo proposto

| Entidade | Responsabilidade e restrições |
| --- | --- |
| Identidade Supabase | Uma pessoa global, sem papel institucional no cadastro público |
| Instituição | ID imutável, nome e status ativa/suspensa |
| Vínculo | Usuário, instituição, status pendente/ativo/suspenso e unicidade por par |
| Papéis do vínculo | Papéis institucionais associados ao vínculo, sem duplicidade |
| Administradores da plataforma | Concessão separada dos vínculos institucionais |
| Auditoria | Ator, instituição quando aplicável, operação, recurso e horário |

As tabelas efetivas e suas migrations serão definidas depois da inspeção do projeto.
O desenho permite diferentes papéis por instituição e mais de um papel no mesmo
vínculo. Aprovação concede apenas os papéis explicitamente autorizados pelo gestor.
Um papel solicitado pelo usuário não é uma concessão automática.

## Política inicial de acesso

- Sem sessão: nenhum recurso institucional, lista de vínculos ou dados de pessoas.
- Autenticado sem vínculo: tela de acesso pendente/solicitação, sem dados internos.
- Vínculo pendente ou suspenso: pode consultar o próprio estado, sem conteúdo
  institucional ou poderes de gestão.
- Instituição suspensa: bloquear acesso ao conteúdo institucional, mesmo com
  vínculo anteriormente ativo. A própria situação pode continuar visível ao usuário.
- Vínculo ativo em instituição ativa: acesso sujeito ao papel e à relação com o
  recurso; conhecer um ID não concede acesso.
- Gestor de A não aprova, promove ou altera vínculos de B.
- Coordenador, orientador, avaliador e aluno não gerenciam papéis ou aprovações.
- Somente a administração da plataforma concede administração institucional e
  cria/ativa/suspende instituições, conforme os endpoints da etapa administrativa.
- Ninguém concede a si mesmo privilégios por metadados OAuth, payload ou URL.

A interface não terá matriz editável de permissões. As capacidades ficam explícitas
no servidor e no banco, com testes. Os fluxos administrativos serão implementados
na entrega seguinte; as restrições precisam existir desde a base.

## RLS com identidade preservada

Para operações do usuário, Express cria um cliente por requisição com a chave
publicável e o JWT do próprio usuário e acessa a Data API Supabase. Assim o PostgREST
estabelece a identidade da requisição e as políticas usam `auth.uid()`.
Nunca reutilizar globalmente um cliente com token de outra pessoa.

RLS e grants devem impedir acesso direto indevido pela Data API, inclusive quando
alguém ignora a interface e faz requisições ao Supabase. Não basta proteger Express.
Restringir colunas e operações sensíveis além do escopo de linhas: status, usuário,
instituição e papéis não podem ser livremente alterados pelo titular do vínculo.
Verificar políticas de leitura e de escrita e evitar recursão nas políticas sobre
a própria tabela de vínculos. Funções privilegiadas, se necessárias, terão escopo
mínimo, `search_path` fixo e permissão de execução explícita.

O `pg.Pool` atual não transporta essa identidade. Não usar o pool privilegiado para
operações de usuário e afirmar que RLS as protege. Drizzle pode apoiar o esquema e
as ferramentas controladas sem se tornar o caminho de autorização em runtime.

Chaves secretas/service-role contornam RLS e não entram no frontend. Nenhum endpoint
comum de usuário deve precisar delas. Não usar a chave administrativa para tornar
um teste de autorização aparentemente bem-sucedido.

## Primeiro superadministrador e auditoria

Após criar a identidade real, um procedimento restrito concede o privilégio pelo
UUID exato, registra a concessão e evita duplicação em reexecuções. Não promover a
primeira pessoa que entrar, não usar domínio de e-mail como privilégio e não criar
endpoint público de bootstrap. O procedimento não atribui poderes a usuários demo.

Registrar aprovações, mudanças de papéis e suspensões no mesmo contexto transacional
das alterações. Usuários comuns não podem inserir registros de auditoria em nome
de outra pessoa, alterar ou excluir o histórico. Não incluir senhas ou tokens.

## Critérios de conclusão e testes

| Cenário | Resultado esperado |
| --- | --- |
| Google: entrar, retornar e sair | Sessão real; erro/cancelamento com mensagem recuperável |
| Chamada API sem token, token forjado ou expirado | 401 sem dados de usuário ou instituição |
| Pessoa sem vínculo | Nenhum acesso institucional e orientação para solicitar acesso |
| Usuário de A troca IDs para B | Nenhum dado de B, inclusive via Data API direta |
| Usuário tenta promover a si mesmo | Negado em Express e no banco |
| Vínculo pendente/suspenso | Consulta do próprio estado, conteúdo institucional negado |
| Instituição suspensa | Acesso interno negado apesar de vínculo ativo |
| Pessoa ativa em A e B com papéis diferentes | Capacidades corretas em cada contexto |
| Suspensão após login | Operação seguinte negada sem depender de novo login |
| Duas requisições concorrentes de pessoas diferentes | Sem vazamento de identidade entre clientes |
| Acesso anônimo ao banco | Sem leitura ou escrita de tabelas privadas |
| Bootstrap controlado | Sem promoção pública; concessão exata, auditável e idempotente |

Executar testes negativos com duas instituições e identidades reais de teste. Não
usar mocks como única evidência de RLS. Verificar os mesmos acessos pela API Express
e pela Data API com os tokens dos usuários. Não usar dados pessoais reais nas seeds.

## Referências e orçamento

- [Google no Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [URLs de retorno](https://supabase.com/docs/guides/auth/redirect-urls)
- [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Chaves e seus privilégios](https://supabase.com/docs/guides/getting-started/api-keys)
- [Planos e limites](https://supabase.com/pricing)

O orçamento continua R$ 0 para desenvolvimento. Confirmar as cotas do plano ativo,
pausa por inatividade e procedimentos de backup antes de tratar o ambiente como
serviço estável. Minimizar dados pessoais e definir retenção, exclusão e acesso
aos registros como parte dos requisitos de LGPD, sem prometer conformidade apenas
pela escolha do provedor.
