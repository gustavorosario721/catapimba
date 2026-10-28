import { useState } from "react";
import { ArrowRight, ClipboardCheck, Lightbulb, PanelsTopLeft, Trophy, UsersRound } from "lucide-react";
import { Link } from "wouter";
import type { WorkspaceData } from "./types";
import "./overview.css";

export function WorkspaceOverview({ data, roleLabel }: { data: WorkspaceData; roleLabel: string }) {
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const availableYears = Array.from(new Set([
    ...data.projects.map((project) => project.year),
    ...data.events.map((event) => new Date(event.scheduled_at).getFullYear()).filter(Number.isFinite),
  ])).sort((a, b) => b - a);
  const inSelectedPeriod = (date: string) => {
    const value = new Date(date);
    if (!Number.isFinite(value.getTime())) return !year && !semester;
    return (!year || value.getFullYear() === Number(year)) &&
      (!semester || (value.getMonth() < 6 ? 1 : 2) === Number(semester));
  };
  const projects = data.projects.filter((project) =>
    (!year || project.year === Number(year)) &&
    (!semester || project.semester === Number(semester)));
  const activeProjects = projects.filter((project) => !project.archived);
  const events = data.events.filter((event) => inSelectedPeriod(event.scheduled_at));
  const eventIds = new Set(events.map((event) => event.id));
  const evaluations = data.evaluations.filter((evaluation) => eventIds.has(evaluation.event_id));
  const eventProjects = data.eventProjects.filter((item) => eventIds.has(item.event_id));
  const eventEvaluators = data.eventEvaluators.filter((item) => eventIds.has(item.event_id));
  const expectedEvaluations = events.reduce((sum, event) =>
    sum + new Set(eventProjects.filter((item) => item.event_id === event.id).map((item) => item.project_id)).size *
      new Set(eventEvaluators.filter((item) => item.event_id === event.id).map((item) => item.user_id)).size, 0);
  const open = events.filter((event) => event.status === "open").length;
  const drafts = events.filter((event) => event.status === "draft").length;
  const closed = events.filter((event) => event.status === "closed").length;
  const published = data.results.filter((result) => eventIds.has(result.event_id) && result.published).length;
  const pending = data.memberships.filter((member) => member.status === "pending").length;
  const metrics = [
    { label: "Projetos ativos", value: activeProjects.length, icon: Lightbulb, href: "/app/projects" },
    { label: "Bancas abertas", value: open, icon: PanelsTopLeft, href: "/app/events" },
    { label: "Avaliações registradas", value: evaluations.length, icon: ClipboardCheck, href: data.capabilities.evaluate ? "/app/evaluations" : "/app/events" },
    data.capabilities.manageMembers
      ? { label: "Acessos pendentes", value: pending, icon: UsersRound, href: "/app/members" }
      : { label: "Resultados publicados", value: published, icon: Trophy, href: "/app/results" },
  ];
  const stages = [
    { label: "Projetos", value: activeProjects.length, detail: `${projects.length - activeProjects.length} arquivados` },
    { label: "Bancas", value: drafts, detail: "em preparação" },
    { label: "Avaliações", value: evaluations.length, detail: expectedEvaluations ? `de ${expectedEvaluations} esperadas no contexto visível` : "registros visíveis" },
    { label: "Encerradas", value: closed, detail: "bancas encerradas" },
    { label: "Resultados", value: published, detail: "publicados" },
  ];
  const stageDistribution = ["Descoberta", "Protótipo", "Validação", "Concluído"].map((label) => ({
    label,
    value: activeProjects.filter((project) => project.stage === label).length,
  }));
  const maximumStageCount = Math.max(1, ...stageDistribution.map((stage) => stage.value));
  const recentProjects = activeProjects.slice().sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 4);
  const actions = [
    ...(data.capabilities.manageMembers ? [{ title: "Revisar solicitações de acesso", description: `${pending} solicitações aguardando decisão.`, label: "Revisar acessos", href: "/app/members" }] : []),
    ...(data.capabilities.manageEvents ? [{ title: "Preparar bancas", description: `${drafts} bancas em preparação.`, label: "Organizar bancas", href: "/app/events" }] : []),
    ...(data.capabilities.evaluate ? [{ title: "Acompanhar minhas avaliações", description: "Consulte as bancas e os projetos atribuídos a você.", label: "Ver avaliações", href: "/app/evaluations" }] : []),
    { title: "Consultar resultados publicados", description: `${published} resultados disponíveis no período selecionado.`, label: "Ver resultados", href: "/app/results" },
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
        <div className="workspace-filters" aria-label="Filtros do painel">
          <label className="input-field"><span>Ano</span>
            <select value={year} onChange={(event) => setYear(event.target.value)}>
              <option value="">Todos os anos</option>
              {availableYears.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="input-field"><span>Semestre</span>
            <select value={semester} onChange={(event) => setSemester(event.target.value)}>
              <option value="">Todos</option>
              <option value="1">1º semestre</option>
              <option value="2">2º semestre</option>
            </select>
          </label>
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
          <p>Contagens do período selecionado nos registros acessíveis ao seu perfil.</p>
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

      <section className="card overview-detail" aria-labelledby="overview-distribution-title">
        <p className="eyebrow">Projetos por status</p>
        <h2 id="overview-distribution-title">Distribuição por etapa</h2>
        <div className="overview-stage-distribution">
          {stageDistribution.map((stage) => (
            <div className="overview-stage-distribution-row" key={stage.label}>
              <span>{stage.label}</span>
              <div className="overview-stage-track" role="img" aria-label={`${stage.label}: ${stage.value} projetos`}>
                <span style={{ width: `${(stage.value / maximumStageCount) * 100}%` }} />
              </div>
              <strong>{stage.value}</strong>
            </div>
          ))}
        </div>
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
          {recentProjects.length ? (
            <ul className="overview-list overview-projects">
              {recentProjects.map((project) => (
                <li key={project.id}>
                  <div><h3>{project.name}</h3><p>{[project.category, `${project.year}.${project.semester}`].filter(Boolean).join(" · ")}</p></div>
                  <span className="overview-link">{project.stage}</span>
                </li>
              ))}
            </ul>
          ) : <p>Nenhum projeto no período selecionado.</p>}
        </section>
      </div>
    </div>
  );
}
