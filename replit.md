# Plataforma de Gestão e Avaliação de Startups

Consulte o [README](README.md) para execução, estrutura e decisões atuais.

- Frontend: React + Vite; porta padrão 5173 e caminho padrão `/`.
- Sandbox auxiliar: porta padrão 5174.
- API: Express 5, requer `PORT` na execução, por exemplo `PORT=3001`.
- Build do servidor: esbuild, bundle ESM (`dist/index.mjs`).
- Banco: PostgreSQL + Drizzle; esquema vazio. `DATABASE_URL` é necessária para
  usar a conexão ou ferramentas de banco, não para o health check.
- OpenAPI/Orval: gera cliente React Query e schemas Zod; somente health check.
- Decisão aprovada: Vite + Express no mesmo projeto Vercel e Supabase PostgreSQL/Auth.
- Login Google via Supabase Auth é o fluxo inicial recomendado. Papéis e aprovação
  serão verificados no servidor por vínculo institucional.
- Implantação integrada, autenticação e persistência ainda não estão implementadas.

Preservar o protótipo e evoluir em etapas pequenas. Não tratar o seletor da demo
como autenticação, não conceder superadministrador por cadastro público e não
expor credenciais. Não executar alterações do esquema antes da etapa correspondente.
