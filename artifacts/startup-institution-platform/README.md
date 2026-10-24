# Plataforma de Gestão e Avaliação

Protótipo navegável em português para instituições de ensino, incubadoras e
programas de inovação acompanharem projetos, bancas, avaliações e resultados.

## Executar

O aplicativo é um frontend React + Vite neste workspace:

```bash
pnpm --filter @workspace/startup-institution-platform run dev
```

Para verificar os tipos:

```bash
pnpm --filter @workspace/startup-institution-platform run typecheck
```

## O que é demonstrativo

- Os usuários, instituições, projetos, equipes, bancas e notas são fictícios.
- O seletor de perfil e instituição é apenas para demonstração; não autentica
  usuários nem protege dados.
- Formulários e alterações de status atualizam somente o estado do protótipo.
  Não há banco de dados nem sincronização entre sessões.
- A exportação de relatórios gera um CSV de demonstração no navegador.
- O som do pódio é gerado localmente e não depende de serviços externos.

## Próximos passos para produção

Substituir os dados locais por consultas a uma API e PostgreSQL, integrar
Supabase Auth e definir autorização por vínculo entre usuário, instituição e
papel. A autenticação demonstrativa não deve ser reaproveitada como mecanismo
de segurança. O scaffold atual deste protótipo usa React + Vite; a solicitação
original cita Next.js com App Router, portanto uma versão de produção que exija
esse stack ainda precisará ser portada.
