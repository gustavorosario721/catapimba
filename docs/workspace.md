# Área institucional real

A área autenticada está em `/conta` e `/app/*`. O protótipo demonstrativo continua separado nas rotas antigas, com dados fictícios. Nenhuma escolha de perfil na demonstração concede privilégios reais.

## Primeiro uso

1. Entre com Google. O superadministrador existente pode selecionar SENAI CIMATEC no topo e abrir todos os módulos de gestão.
2. As demais pessoas precisam entrar com Google pelo menos uma vez. Podem solicitar acesso em **Meus acessos** escolhendo instituição e papel. Não há concessão pública de administração.
3. Em **Usuários e acessos**, revise solicitações, aprove ou suspenda vínculos e atribua papéis. O superadministrador pode nomear administradores institucionais; estes gerenciam os demais perfis, sem promover a si mesmos ou administrar outros administradores.
4. Cadastre projetos e vincule alunos e orientadores ativos. Cada projeto já representa uma equipe; não há entidade de equipe independente nesta entrega.
5. Cadastre critérios, pesos e cinco descritores. Prepare uma banca, selecione projetos e avaliadores e abra as avaliações.
6. Cada avaliador atribuído envia notas inteiras de 1 a 5. Pode revisar enquanto a banca estiver aberta. O envio repetido atualiza a avaliação existente e não duplica seu peso.
7. Encerre quando todas as combinações projeto × avaliador tiverem avaliação. Depois publique os resultados. Publicar e ocultar são ações distintas do encerramento.
8. Consulte relatórios CSV, classificação, pódio com controles de animação e som, e auditoria.

No celular, deslize horizontalmente a navegação inferior para acessar os demais módulos.

## Permissões

| Perfil | Acesso |
| --- | --- |
| Superadministrador | Instituições, nomeação de administradores e gestão nas instituições ativas |
| Administrador institucional | Usuários, projetos/equipes, critérios, bancas, resultados, relatórios e auditoria da instituição |
| Coordenador | Consulta projetos, organiza bancas, atribui avaliadores, encerra/publica e exporta resultados |
| Orientador | Consulta projetos vinculados, equipes, bancas relacionadas e resultados publicados |
| Avaliador | Consulta projetos e bancas atribuídos, envia/revisa suas avaliações enquanto abertas |
| Aluno | Consulta projetos vinculados e altera somente sua descrição; consulta resultados publicados |

Um vínculo suporta vários papéis. A mesma conta pode participar de várias instituições. Suspensão da instituição ou vínculo bloqueia novas operações. Resultados publicados são visíveis aos membros ativos da instituição inteira, sem conceder acesso aos detalhes dos projetos de outras equipes.

## Cálculo e ciclo das bancas

Cada avaliação usa `soma(nota × peso) / soma(pesos)`. O resultado do projeto é a média entre as avaliações, arredondada a quatro casas para classificação. Empates compartilham a posição (`dense_rank`); a interface mostra duas casas. Não há desempate automático. Antes do encerramento os resultados são parciais e restritos à gestão.

Abrir a banca congela critérios, descritores e pesos. Alterar o cadastro de critérios depois não muda avaliações daquela banca. Projetos e avaliadores só são editados durante a preparação. Cancelamento preserva os registros e não gera premiação. Não é possível reabrir banca encerrada nesta entrega. Se um avaliador abandonar uma banca aberta com pendências, cancele e prepare outra banca com a composição correta.

## Segurança implementada

Express valida a sessão com Supabase Auth e encaminha o JWT do próprio usuário junto com a chave publicável. Não utiliza `service_role`, senha de banco nem papel privilegiado de conexão. As tabelas têm RLS e permitem apenas SELECT autenticado com políticas de escopo. Escritas passam por RPCs autorizadas e auditadas na mesma transação.

As RPCs públicas são SECURITY INVOKER. Elas chamam funções SECURITY DEFINER no schema `private`, com `search_path=''`, privilégios explicitamente restritos e verificações de `auth.uid()`, instituição ativa, vínculo ativo, papéis e associação do recurso. Como essas funções elevadas ultrapassam RLS, sua proteção depende dessas verificações explícitas, que também são testadas. A função interna de classificação não é executável diretamente pelos clientes.

E-mails de terceiros são expostos apenas à gestão de usuários da instituição. O coordenador recebe um diretório de avaliadores ativos sem e-mails. Relatórios não incluem e-mails. CSV neutraliza fórmulas e escapa campos. A auditoria não guarda texto livre das avaliações. O frontend nunca determina os privilégios do servidor.

O aviso de RLS sem política em `private.audit_events` é intencional: acesso direto é negado; leitura e escrita são mediadas pelas funções autorizadas. O aviso de proteção contra senhas vazadas refere-se à configuração Auth: este aplicativo usa Google, sem formulário de senha.

## Testes verificáveis

- `pnpm run build:vercel`: TypeScript, API e frontend de produção.
- `pnpm test:routing`: 17 testes HTTP, com Supabase simulado para validação de transporte, erros, identidade encaminhada, exportação e regressões de roteamento.
- `supabase/tests/workspace.sql`: testes SQL no PostgreSQL real em transação com rollback. Cobrem aprovação, papéis institucionais, isolamento, SELECT direto com RLS, edição restrita de aluno, pesos congelados, notas inválidas, envio duplicado, encerramento, publicação, empates, suspensão e auditoria.
- `supabase/tests/platform-institutions.sql`: administração global sem vínculo e concessão controlada/revogação.
- `scripts/workspace-browser.py`: teste opcional com Python Playwright e Chromium instalado em `/usr/bin/chromium`, executado contra `vite preview` na porta 5173. Simula sessão e API, testa menus dos seis perfis, criação de projeto, envio de nota, páginas e largura mobile. Não substitui teste manual de login Google nem prova integração de todas as telas com o banco.

## Limites para a próxima rodada

Esta entrega é um núcleo funcional para demonstração e homologação. Ainda exige teste manual com contas reais de cada perfil antes de uso institucional. Não inclui anexos, notificações por e-mail, convites por SMTP, relatórios PDF, recuperação de banca encerrada, equipe reutilizável entre projetos ou integração acadêmica externa.

A leitura do contexto institucional retorna os recursos autorizados em um único JSON; antes de grandes volumes, implementar paginação e limites de exportação. Monitorar cotas dos planos gratuitos. Não foi contratado serviço pago. O preview autenticado está na branch `feat/identity-foundation`; produção depende de integração das branches, variáveis e URLs de OAuth correspondentes.

LGPD ainda requer decisões institucionais sobre finalidade, base legal, retenção/exclusão, política de privacidade, responsáveis pelo tratamento e atendimento a titulares. Controle técnico de acesso não equivale a conformidade jurídica completa. Backup, recuperação, limites de requisições e operação em escala precisam de homologação própria.
