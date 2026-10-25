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

## Arquitetura aprovada

Preservar React + Vite e Express, com implantação futura em um único projeto
Vercel. Usar Supabase para PostgreSQL e autenticação. O fluxo inicial recomendado
é Google OAuth via Supabase Auth; estar autenticado não concede acesso a uma
instituição sem vínculo aprovado. Essas integrações ainda não estão implementadas.

Consulte o [README da raiz](../../README.md) para instalação e verificação.
