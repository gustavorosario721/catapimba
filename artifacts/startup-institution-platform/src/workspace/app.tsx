import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Activity,
  Building2,
  UsersRound,
  Lightbulb,
  PanelsTopLeft,
  ListChecks,
  ClipboardCheck,
  ChartNoAxesCombined,
  FileBarChart,
  Trophy,
  History,
  LogOut,
  LayoutDashboard,
  UserRound,
} from "lucide-react";
import { PlatformPanel } from "../pages/platform-panel";
import { AccessRequest, MembersModule } from "./access";
import { ProjectsModule } from "./projects";
import { CriteriaModule } from "./criteria";
import { EventsModule } from "./events";
import { EvaluationsModule } from "./evaluations";
import { ResultsModule } from "./results";
import type {
  Command,
  Identity,
  Institution,
  Role,
  WorkspaceData,
} from "./types";
import { roleNames } from "./types";
import { Card, PageHead, Stat, Empty, auditNames, dateTime } from "./ui";

export function WorkspaceApp({
  identity,
  token,
  onSignOut,
  refreshIdentity,
}: {
  identity: Identity;
  token: string;
  onSignOut: () => Promise<void>;
  refreshIdentity: () => void;
}) {
  const [path, navigate] = useLocation();
  const [catalog, setCatalog] = useState<Institution[]>([]);
  const [institutionId, setInstitutionId] = useState("");
  const [scope, setScope] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [attempt, setAttempt] = useState(0);
  const inFlight = useRef(false);
  const activeMemberships = identity.memberships.filter(
    (m) => m.status === "active" && m.institutions?.status === "active",
  );
  const options = identity.isPlatformAdministrator
    ? catalog
    : activeMemberships.map((m) => m.institutions!).filter(Boolean);
  const institution = options.find((i) => i.id === institutionId);
  const data =
    scope?.institution.id === institutionId && institution?.status === "active"
      ? scope
      : null;
  const module =
    path === "/conta" ? "overview" : (path.split("/")[2] ?? "overview");
  const ownRoles = identity.memberships
    .find((m) => m.institution_id === institutionId)
    ?.membership_roles.map((r) => roleNames[r.role])
    .join(", ");

  async function api(url: string, options: RequestInit = {}) {
    const response = await fetch(`/api${url}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const body = await response.json();
    if (!response.ok)
      throw new Error(body.error ?? "Não foi possível carregar este contexto.");
    return body;
  }
  useEffect(() => {
    const controller = new AbortController();
    void api("/workspace/catalog", { signal: controller.signal })
      .then((body) => {
        if (!controller.signal.aborted) setCatalog(body.institutions);
      })
      .catch((reason) => {
        if (!controller.signal.aborted)
          setError(
            reason instanceof Error
              ? reason.message
              : "Não foi possível carregar as instituições.",
          );
      });
    return () => controller.abort();
  }, [token, attempt]);
  useEffect(() => {
    if (options.length && !options.some((i) => i.id === institutionId))
      setInstitutionId(
        options.find((i) => i.status === "active")?.id ?? options[0].id,
      );
    else if (!options.length && institutionId) setInstitutionId("");
  }, [catalog, identity, institutionId]);
  useEffect(() => {
    const controller = new AbortController();
    setScope(null);
    setError("");
    if (!institutionId || institution?.status !== "active") {
      setLoading(false);
      return;
    }
    setLoading(true);
    void api(`/workspace/${institutionId}`, { signal: controller.signal })
      .then((body) => {
        if (!controller.signal.aborted) setScope(body);
      })
      .catch((reason) => {
        if (!controller.signal.aborted)
          setError(
            reason instanceof Error
              ? reason.message
              : "Não foi possível carregar os dados.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [institutionId, institution?.status, token, attempt]);

  const command: Command = async (action, payload) => {
    if (inFlight.current) return false;
    inFlight.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api(`/workspace/${institutionId}/commands`, {
        method: "POST",
        body: JSON.stringify({ action, data: payload }),
      });
      setNotice("Alteração registrada.");
      try {
        const updated = await api(`/workspace/${institutionId}`);
        setScope(updated);
      } catch {
        setScope(null);
        setError(
          "A alteração foi registrada, mas não foi possível atualizar a tela. Recarregue os dados.",
        );
      }
      return true;
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Não foi possível salvar.",
      );
      return false;
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  async function requestAccess(id: string, role: Role) {
    setBusy(true);
    setError("");
    try {
      await api(`/workspace/${id}/commands`, {
        method: "POST",
        body: JSON.stringify({ action: "access.request", data: { role } }),
      });
      return true;
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível solicitar acesso.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  const nav = [
    { id: "overview", name: "Visão geral", icon: LayoutDashboard, show: true },
    {
      id: "institutions",
      name: "Instituições",
      icon: Building2,
      show: identity.isPlatformAdministrator,
    },
    {
      id: "members",
      name: "Usuários e acessos",
      icon: UsersRound,
      show: !!data?.capabilities.manageMembers,
    },
    {
      id: "projects",
      name: ownRoles?.includes("Orientador")
        ? "Projetos e orientação"
        : "Projetos e equipes",
      icon: Lightbulb,
      show: !!data,
    },
    { id: "events", name: "Bancas", icon: PanelsTopLeft, show: !!data },
    { id: "criteria", name: "Critérios", icon: ListChecks, show: !!data },
    {
      id: "evaluations",
      name: "Avaliações",
      icon: ClipboardCheck,
      show: !!data?.capabilities.evaluate,
    },
    {
      id: "results",
      name: "Resultados",
      icon: ChartNoAxesCombined,
      show: !!data,
    },
    {
      id: "reports",
      name: "Relatórios",
      icon: FileBarChart,
      show: !!data?.capabilities.manageEvents,
    },
    { id: "podium", name: "Pódio", icon: Trophy, show: !!data },
    {
      id: "audit",
      name: "Auditoria",
      icon: History,
      show: !!data?.capabilities.readAudit,
    },
    { id: "access", name: "Meus acessos", icon: UserRound, show: true },
  ];
  const current = nav.find((n) => n.id === module && n.show);
  const pending =
    data?.memberships.filter((m) => m.status === "pending").length ?? 0;
  return (
    <div className="app-shell workspace-shell">
      <aside className="sidebar">
        <Link className="brand" href="/conta">
          <span className="brand-mark">
            <Activity />
          </span>
          elo.
        </Link>
        <div className="workspace-label">
          {identity.isPlatformAdministrator
            ? "Administração da plataforma"
            : (institution?.name ?? "Minha conta")}
        </div>
        <nav className="nav-list" aria-label="Navegação principal">
          {nav
            .filter((n) => n.show)
            .map((n) => (
              <Link
                key={n.id}
                href={`/app/${n.id}`}
                className={`nav-link ${module === n.id ? "active" : ""}`}
              >
                <n.icon />
                <span>{n.name}</span>
              </Link>
            ))}
        </nav>
        <div className="sidebar-bottom">
          <p className="demo-note">
            {identity.isPlatformAdministrator
              ? "Superadministrador"
              : (ownRoles ?? "Aguardando vínculo")}
          </p>
          <button className="nav-link" onClick={onSignOut}>
            <LogOut />
            Sair da conta
          </button>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div className="crumb">
            Elo / {current?.name ?? "Área institucional"}
          </div>
          <div className="top-actions">
            <label className="sr-only" htmlFor="workspace-institution">
              Instituição atual
            </label>
            <select
              id="workspace-institution"
              className="context-select"
              value={institutionId}
              disabled={busy || !options.length}
              onChange={(e) => {
                setInstitutionId(e.target.value);
                setNotice("");
              }}
            >
              <option value="">Selecione a instituição</option>
              {options.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                  {i.status === "suspended" ? " · Suspensa" : ""}
                </option>
              ))}
            </select>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setAttempt((v) => v + 1);
                refreshIdentity();
              }}
              disabled={busy}
            >
              Atualizar
            </button>
            <button
              className="btn btn-ghost"
              onClick={onSignOut}
              aria-label="Sair da conta"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>
        <main className="content workspace-content">
          <PageHead
            eyebrow={
              identity.isPlatformAdministrator
                ? "ADMINISTRAÇÃO DA PLATAFORMA"
                : (ownRoles ?? "MINHA CONTA")
            }
            title={current?.name ?? "Área institucional"}
            description={institution?.name ?? identity.user.email ?? ""}
          />
          {error && (
            <div role="alert" className="notice warn">
              {error}
            </div>
          )}
          {notice && (
            <div role="status" className="notice">
              {notice}
            </div>
          )}
          {module === "institutions" && identity.isPlatformAdministrator ? (
            <PlatformPanel
              token={token}
              onChange={() => setAttempt((v) => v + 1)}
            />
          ) : module === "access" ? (
            <AccessRequest
              institutions={catalog}
              identity={identity}
              request={requestAccess}
              busy={busy}
              refresh={refreshIdentity}
            />
          ) : loading ? (
            <Card>
              <p role="status">Carregando seu contexto institucional…</p>
            </Card>
          ) : !data ? (
            <Card>
              <h2 className="section-title">
                {institution?.status === "suspended"
                  ? "Instituição suspensa"
                  : "Bem-vindo à plataforma"}
              </h2>
              <p>
                {institution?.status === "suspended"
                  ? "A área institucional está indisponível até a reativação."
                  : "Você pode solicitar acesso a uma instituição ou acompanhar suas solicitações."}
              </p>
              <div className="workspace-actions">
                <Link className="btn btn-primary" href="/app/access">
                  Meus acessos
                </Link>
                {identity.isPlatformAdministrator && (
                  <Link className="btn btn-primary" href="/app/institutions">
                    Gerenciar instituições
                  </Link>
                )}
                <button
                  className="btn btn-ghost"
                  onClick={() => setAttempt((v) => v + 1)}
                >
                  Recarregar dados
                </button>
              </div>
            </Card>
          ) : !current ? (
            <Card>
              <Empty>Esta página não está disponível para seu perfil</Empty>
            </Card>
          ) : module === "overview" ? (
            <>
              <div className="stat-grid">
                <Stat
                  label="Projetos no seu contexto"
                  value={data.projects.filter((p) => !p.archived).length}
                  icon={<Lightbulb />}
                  foot="projetos que você pode consultar"
                />
                <Stat
                  label="Bancas abertas"
                  value={data.events.filter((e) => e.status === "open").length}
                  icon={<PanelsTopLeft />}
                  foot="no seu contexto de acesso"
                />
                <Stat
                  label="Avaliações registradas"
                  value={data.evaluations.length}
                  icon={<ClipboardCheck />}
                  foot="registros visíveis ao seu perfil"
                />
                <Stat
                  label="Resultados disponíveis"
                  value={data.results.length}
                  icon={<Trophy />}
                  foot="bancas autorizadas"
                />
              </div>
              <div className="split">
                <Card>
                  <h2 className="section-title">O que pede atenção</h2>
                  {data.capabilities.manageMembers && (
                    <p>
                      {pending} solicitações pendentes.{" "}
                      <Link href="/app/members">Revisar acessos</Link>
                    </p>
                  )}
                  <p>
                    {data.events.filter((e) => e.status === "draft").length}{" "}
                    bancas em preparação.
                  </p>
                  <Link className="btn btn-primary" href="/app/projects">
                    Acompanhar projetos
                  </Link>
                </Card>
                <Card>
                  <h2 className="section-title">Seu espaço de trabalho</h2>
                  <p>{identity.user.email}</p>
                  <p>
                    {identity.isPlatformAdministrator
                      ? "Administração global"
                      : ownRoles}
                  </p>
                  <p>
                    Dados persistidos da instituição selecionada. Alterar o
                    contexto atualiza os recursos e as permissões disponíveis.
                  </p>
                  <Link href="/app/access">Consultar meus vínculos</Link>
                </Card>
              </div>
            </>
          ) : module === "members" ? (
            <MembersModule
              data={data}
              command={command}
              busy={busy}
              isPlatform={identity.isPlatformAdministrator}
            />
          ) : module === "projects" ? (
            <ProjectsModule
              key={institutionId}
              data={data}
              command={command}
              busy={busy}
              userId={identity.user.id}
            />
          ) : module === "criteria" ? (
            <CriteriaModule
              key={institutionId}
              data={data}
              command={command}
              busy={busy}
            />
          ) : module === "events" ? (
            <EventsModule
              key={institutionId}
              data={data}
              command={command}
              busy={busy}
            />
          ) : module === "evaluations" ? (
            <EvaluationsModule
              key={institutionId}
              data={data}
              command={command}
              busy={busy}
              userId={identity.user.id}
            />
          ) : ["results", "reports", "podium"].includes(module) ? (
            <ResultsModule
              key={`${institutionId}:${module}`}
              data={data}
              token={token}
              institutionId={institutionId}
              mode={
                module === "podium"
                  ? "podium"
                  : module === "reports"
                    ? "reports"
                    : "results"
              }
            />
          ) : module === "audit" ? (
            <Card>
              <h2 className="section-title">
                Últimas operações da instituição
              </h2>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Operação</th>
                      <th>Responsável</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.audit.map((a) => (
                      <tr key={a.id}>
                        <td>{dateTime(a.occurred_at)}</td>
                        <td>{auditNames[a.action] ?? a.action}</td>
                        <td>
                          {data.people.find((p) => p.id === a.actor_id)?.name ??
                            "Operador autorizado"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!data.audit.length && <Empty>Sem operações registradas</Empty>}
            </Card>
          ) : null}
        </main>
      </div>
    </div>
  );
}
