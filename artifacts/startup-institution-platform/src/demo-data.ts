export type Role = 'Superadministrador' | 'Administrador institucional' | 'Coordenador' | 'Orientador' | 'Avaliador' | 'Aluno';
export type Project = { id: number; name: string; summary: string; category: string; team: string; memberIds: number[]; stage: string; score: number; mentor: string; progress: number; institution: string; year: string; semester: string };
export type DemoUser = { id: number; name: string; email: string };
export type DemoMembership = { id: number; userId: number; institution: string; role: Role; status: 'Ativo' | 'Pendente' | 'Suspenso' };
export type DemoInstitution = { id: number; name: string; location: string; status: 'Ativa' | 'Suspensa' };
export type DemoAssessment = { id: number; projectId: number; evaluatorId: number; scores: number[]; average: number; notes: string; receipt: string };
export const roles: Role[] = ['Superadministrador','Administrador institucional','Coordenador','Orientador','Avaliador','Aluno'];
export const institutions = ['Instituto Horizonte','Universidade do Vale','Incubadora Farol'];
export const initialInstitutions: DemoInstitution[] = institutions.map((name,id)=>({id:id+1,name,location:['São Paulo, SP','Campinas, SP','Recife, PE'][id],status:'Ativa'}));
export const projects: Project[] = [
  {id:1,name:'Raiz Circular',summary:'Transforma resíduos orgânicos de pequenos mercados em insumos para hortas urbanas, aproximando comércio local e produtores de bairro.',category:'Economia circular',team:'Lia Martins, Caio Nunes',memberIds:[3],stage:'Validação',score:4.7,mentor:'Marina Costa',progress:82,institution:institutions[0],year:'2025',semester:'2025.2'},
  {id:2,name:'Nexo Saúde',summary:'Conecta clínicas comunitárias a uma rede de cuidado preventivo com acompanhamento simples e acessível.',category:'Healthtech',team:'João Prado, Elisa Mota',memberIds:[],stage:'Protótipo',score:4.5,mentor:'Rafael Lima',progress:67,institution:institutions[0],year:'2025',semester:'2025.2'},
  {id:3,name:'Plantae Dados',summary:'Organiza dados de campo para ajudar pequenos produtores a decidir o melhor momento de plantio.',category:'Agtech',team:'Nina Rocha, Bruno Alves',memberIds:[],stage:'Descoberta',score:4.2,mentor:'Marina Costa',progress:48,institution:institutions[1],year:'2025',semester:'2025.1'},
  {id:4,name:'Lume Energia',summary:'Uma solução de gestão para ampliar o acesso a energia distribuída em comunidades e pequenos negócios.',category:'Clean energy',team:'Pedro Sá, Iara Luz',memberIds:[],stage:'Validação',score:4.8,mentor:'Davi Moura',progress:91,institution:institutions[1],year:'2025',semester:'2025.2'},
  {id:5,name:'Mosaico Acessível',summary:'Ferramentas de aprendizagem que adaptam o conteúdo a diferentes ritmos e necessidades de cada turma.',category:'Edtech',team:'Bia Freire, Lucas Reis',memberIds:[],stage:'Protótipo',score:4.1,mentor:'Marina Costa',progress:59,institution:institutions[2],year:'2024',semester:'2024.2'},
];
export const initialUsers: DemoUser[] = [
  {id:1,name:'Marina Costa',email:'marina.costa@horizonte.edu.br'},
  {id:2,name:'Rafael Lima',email:'rafael.lima@horizonte.edu.br'},
  {id:3,name:'Lia Martins',email:'lia.martins@horizonte.edu.br'},
  {id:4,name:'Davi Moura',email:'davi.moura@vale.edu.br'},
  {id:5,name:'Ana Beatriz',email:'ana@incubadorafarol.org'},
  {id:6,name:'Alex Nascimento',email:'alex@elo.demo'},
  {id:7,name:'Camila Sousa',email:'camila.sousa@vale.edu.br'},
  {id:8,name:'Igor Melo',email:'igor.melo@horizonte.edu.br'},
  {id:9,name:'Luiza Paiva',email:'luiza.paiva@vale.edu.br'},
];
export const initialMemberships: DemoMembership[] = [
  {id:1,userId:1,institution:institutions[0],role:'Administrador institucional',status:'Ativo'},
  {id:2,userId:1,institution:institutions[1],role:'Orientador',status:'Ativo'},
  {id:3,userId:6,institution:'Plataforma Elo',role:'Superadministrador',status:'Ativo'},
  {id:4,userId:4,institution:institutions[1],role:'Coordenador',status:'Ativo'},
  {id:5,userId:2,institution:institutions[0],role:'Avaliador',status:'Ativo'},
  {id:6,userId:3,institution:institutions[0],role:'Aluno',status:'Ativo'},
  {id:7,userId:5,institution:institutions[2],role:'Administrador institucional',status:'Pendente'},
  {id:8,userId:7,institution:institutions[1],role:'Avaliador',status:'Ativo'},
  {id:9,userId:8,institution:institutions[0],role:'Avaliador',status:'Pendente'},
  {id:10,userId:9,institution:institutions[1],role:'Avaliador',status:'Ativo'},
];
export const criteria = ['Problema e oportunidade','Proposta de valor','Modelo de negócio','Viabilidade e execução','Impacto e inovação'];
export const events = [
  {id:1,name:'Banca de validação · ciclo 2025.2',date:'18 nov, 14:00',place:'Instituto Horizonte',projectIds:[1,2],evaluatorIds:[2],status:'Inscrições abertas'},
  {id:2,name:'Demo Day Vale',date:'21 nov, 09:30',place:'Universidade do Vale',projectIds:[3,4],evaluatorIds:[7],status:'Em preparação'},
  {id:3,name:'Pitch final Farol',date:'27 nov, 16:00',place:'Incubadora Farol',projectIds:[5],evaluatorIds:[4],status:'Concluída'},
];
export const roleLanding: Record<Role,string> = {
  Superadministrador:'/superadmin','Administrador institucional':'/instituicao',Coordenador:'/bancas',Orientador:'/orientacao',Avaliador:'/avaliacoes',Aluno:'/projetos'
};
export const navItems = [
  {label:'Visão geral',href:'/instituicao',icon:'LayoutDashboard',group:'Espaço'},
  {label:'Superadmin',href:'/superadmin',icon:'Building2',group:'Plataforma'},
  {label:'Usuários',href:'/usuarios',icon:'UsersRound',group:'Espaço'},
  {label:'Equipes',href:'/equipes',icon:'Users',group:'Espaço'},
  {label:'Projetos',href:'/projetos',icon:'Lightbulb',group:'Espaço'},
  {label:'Bancas',href:'/bancas',icon:'PanelsTopLeft',group:'Avaliação'},
  {label:'Critérios',href:'/criterios',icon:'ListChecks',group:'Avaliação'},
  {label:'Orientação',href:'/orientacao',icon:'GraduationCap',group:'Minha área'},
  {label:'Avaliações',href:'/avaliacoes',icon:'ClipboardCheck',group:'Minha área'},
  {label:'Resultados',href:'/resultados',icon:'ChartNoAxesCombined',group:'Análise'},
  {label:'Relatórios',href:'/relatorios',icon:'FileBarChart',group:'Análise'},
  {label:'Pódio',href:'/podio',icon:'Trophy',group:'Análise'},
];
