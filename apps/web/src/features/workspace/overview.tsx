import { ArrowRight, ClipboardCheck, Lightbulb, PanelsTopLeft, Trophy, UsersRound } from "lucide-react";
import { Link } from "wouter";
import type { WorkspaceData } from "./types";
import "./overview.css";

export function WorkspaceOverview({ data, roleLabel }: { data: WorkspaceData; roleLabel: string }) {
  const activeProjects = data.projects.filter((project) => !project.archived);
  const open = data.events.filter((event) => event.status === "open").length;
  const drafts = data.events.filter((event) => event.status === "draft").length;
  const closed = data.events.filter((event) => event.status === "closed").length;
  const published = data.results.filter((result) => result.published).length;
  const pending = data.memberships.filter((member) => member.status === "pending").length;
  const metrics = [
    { label: "Projetos ativos", value: activeProjects.length, icon: Lightbulb, href: "/app/projects" },
    { label: "Bancas abertas", value: open, icon: PanelsTopLeft, href: "/app/events" },
    { label: "Avaliações registradas", value: data.evaluations.length, icon: ClipboardCheck, href: data.capabilities.evaluate ? "/app/evaluations" : "/app/events" },
    data.capabilities.manageMembers
      ? { label: "Acessos pendentes", value: pending, icon: UsersRound, href: "/app/members" }
      : { label: "Resultados publicados", value: published, icon: Trophy, href: "/app/results" },
  ];
  const stages = [
    { label: "Projetos", value: activeProjects.length, detail: `${data.projects.length - activeProjects.length} arquivados` },
    { label: "Bancas", value: drafts, detail: "em preparação" },
    { label: "Avaliações", value: data.evaluations.length, detail: "registros visíveis" },
    { label: "Encerradas", value: closed, detail: "bancas encerradas" },
    { label: "Resultados", value: published, detail: "publicados" },
  ];
  const projects = activeProjects.slice().sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 4);
  const actions = [
    ...(data.capabilities.manageMembers ? [{ title: "Revisar solicitações de acesso", description: `${pending} solicitações aguardando decisão.`, label: "Revisar acessos", href: "/app/members" }] : []),
    ...(data.capabilities.manageEvents ? [{ title: "Preparar bancas", description: `${drafts} bancas em preparação.`, label: "Organizar bancas", href: "/app/events" }] : []),
    ...(data.capabilities.evaluate ? [{ title: "Acompanhar minhas avaliações", description: "Consulte as bancas e os projetos atribuídos a você.", label: "Ver avaliações", href: "/app/evaluations" }] : []),
    { title: "Consultar resultados publicados", description: `${published} resultados disponíveis no seu contexto.`, label: "Ver resultados", href: "/app/results" },
  ];

  return (
    <div className="overview-layout">
      <section className="card overview-panorama" aria-labelledby="overview-panorama-title">
        <div className="overview-intro">
          <p className="eyebrow">Centro de operações · {data.institution.name}</p>
          <h2 id="overview-panorama-title">Panorama do ciclo avaliativo</h2>
          <p>{activeProjects.length} projetos ativos, {drafts + open} bancas em preparação ou abertas e {published} resultados publicados.</p>
          <p className="overview-role">{roleLabel}</p>
        </div>
        <div className="overview-metrics" aria-label="Indicadores do seu contexto">
          {metrics.map(({ label, value, icon: Icon, href }) => (
            <Link className="overview-metric" href={href} key={label}>
              <Icon size={23} aria-hidden="true" />
              <span className="overview-metric-body"><strong>{value}</strong><span>{label}</span></span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="overview-cycle" aria-labelledby="overview-cycle-title">
        <div className="overview-cycle-head">
          <div><p className="eyebrow">Leitura do ciclo</p><h2 id="overview-cycle-title">Da iniciativa ao resultado</h2></div>
          <p>Contagens dos registros acessíveis neste contexto. Etapas sem dados permanecem em zero.</p>
        </div>
        <ol className="overview-stages">
          {stages.map((stage, index) => (
            <li key={stage.label}>
              <span className="overview-stage-number" aria-hidden="true">0{index + 1}</span>
              <h3>{stage.label}</h3>
              <strong>{stage.value}</strong>
              <span>{stage.detail}</span>
            </li>
          ))}
        </ol>
        <p className="overview-cycle-note">As etapas mostram registros atuais, não uma taxa de conclusão. As contagens respeitam as permissões do seu perfil e não representam necessariamente o total da instituição.</p>
      </section>

      <div className="overview-columns">
        <section className="card overview-detail" aria-labelledby="overview-actions-title">
          <p className="eyebrow">Próximos passos</p>
          <h2 id="overview-actions-title">O que pede atenção</h2>
          <ul className="overview-list">
            {actions.map((action) => (
              <li key={action.href}>
                <div><h3>{action.title}</h3><p>{action.description}</p></div>
                <Link href={action.href} className="overview-link">{action.label}<ArrowRight size={16} aria-hidden="true" /></Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="card overview-detail" aria-labelledby="overview-projects-title">
          <p className="eyebrow">Acompanhamento</p>
          <h2 id="overview-projects-title">Projetos em foco</h2>
          {projects.length ? (
            <ul className="overview-list overview-projects">
              {projects.map((project) => (
                <li key={project.id}>
                  <div><h3>{project.name}</h3><p>{[project.category, `${project.year}.${project.semester}`].filter(Boolean).join(" · ")}</p></div>
                  <span className="status">{project.stage || "Etapa não informada"}</span>
                </li>
              ))}
            </ul>
          ) : <div className="overview-empty"><Lightbulb size={25} aria-hidden="true" /><h3>Nenhum projeto ativo disponível</h3><p>Os projetos acessíveis ao seu perfil aparecerão aqui quando estiverem cadastrados.</p></div>}
          <Link href="/app/projects" className="overview-link overview-footer-link">Abrir projetos<ArrowRight size={16} aria-hidden="true" /></Link>
        </section>
      </div>
    </div>
  );
}
