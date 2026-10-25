import {
  Activity,
  ArrowRight,
  CheckCheck,
  ClipboardCheck,
  Trophy,
} from 'lucide-react';
import type {
  DemoAssessment,
  DemoUser,
  Project,
  Role,
} from '../demo-data';
import { events } from '../demo-data';
import { Btn, Card, PageHead, Stat } from '../components/prototype-ui';

const permissionColumns = [
  'Projetos',
  'Bancas',
  'Avaliações',
  'Usuários',
  'Resultados',
];
const formatScore = (score: number) =>
  score.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

type DemoEvent = (typeof events)[number];

export function PermissionsPage({
  roles,
  permissions,
  defaults,
  setPermissions,
  notify,
}: {
  roles: Role[];
  permissions: Record<string, boolean>;
  defaults: Record<string, boolean>;
  setPermissions: (value: Record<string, boolean>) => void;
  notify: (message: string) => void;
}) {
  return (
    <>
      <PageHead
        eyebrow="CONFIGURAÇÃO INSTITUCIONAL"
        title="Permissões"
        description="Uma visão configurável para demonstrar os escopos por perfil."
      />
      <div className="notice warn">
        Esta matriz é apenas visual. A troca de perfil não representa controle
        real de autorização.
      </div>
      <Card>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Perfil</th>
                {permissionColumns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role}>
                  <td>
                    <strong>{role}</strong>
                  </td>
                  {permissionColumns.map((column, index) => {
                    const key = `${role}:${index}`;
                    const allowed = permissions[key] ?? defaults[key] ?? false;
                    return (
                      <td key={column}>
                        <button
                          aria-label={`${allowed ? 'Restringir' : 'Permitir'} ${column} para ${role}`}
                          data-testid={`button-permission-${role}-${index}`}
                          aria-pressed={allowed}
                          onClick={() => {
                            setPermissions({
                              ...permissions,
                              [key]: !allowed,
                            });
                            notify(
                              `${column} ${allowed ? 'restrito' : 'permitido'} para ${role} nesta sessão.`,
                            );
                          }}
                          className="btn btn-ghost"
                          style={{ fontSize: 10, padding: '6px 8px' }}
                        >
                          {allowed ? 'Permitido' : 'Restrito'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

export function ResultsPage({
  projects,
  assessments,
  users,
  years,
  semesters,
  institution,
  year,
  semester,
  eventFilterId,
  institutions,
  events: availableEvents,
  setInstitution,
  setYear,
  setSemester,
  setEventFilterId,
  onOpenProject,
  onOpenPodium,
}: {
  projects: Project[];
  assessments: DemoAssessment[];
  users: DemoUser[];
  years: string[];
  semesters: string[];
  institution: string;
  year: string;
  semester: string;
  eventFilterId: number | null;
  institutions: string[];
  events: DemoEvent[];
  setInstitution: (value: string) => void;
  setYear: (value: string) => void;
  setSemester: (value: string) => void;
  setEventFilterId: (value: number | null) => void;
  onOpenProject: (project: Project) => void;
  onOpenPodium: () => void;
}) {
  const ranked = [...projects].sort((a, b) => b.score - a.score);
  const average = projects.length
    ? projects.reduce((total, project) => total + project.score, 0) /
      projects.length
    : 0;
  const highest = ranked[0];
  const visibleProjectIds = new Set(projects.map((project) => project.id));
  const visibleAssessments = assessments.filter((assessment) =>
    visibleProjectIds.has(assessment.projectId),
  );

  return (
    <>
      <PageHead
        eyebrow="ANÁLISE DE CICLO"
        title="Resultados"
        description="Acompanhe as notas demonstrativas e as avaliações enviadas neste recorte."
      />
      <div className="toolbar">
        <select
          data-testid="select-results-institution"
          className="filter-select"
          value={institution}
          onChange={(event) => setInstitution(event.target.value)}
          aria-label="Filtrar por instituição"
        >
          <option>Todas as instituições</option>
          {institutions.map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={year}
          onChange={(event) => setYear(event.target.value)}
          aria-label="Filtrar por ano"
        >
          {years.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={semester}
          onChange={(event) => setSemester(event.target.value)}
          aria-label="Filtrar por semestre"
        >
          {semesters.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select
          data-testid="select-results-event"
          className="filter-select"
          value={eventFilterId ?? ''}
          onChange={(event) =>
            setEventFilterId(
              event.target.value ? Number(event.target.value) : null,
            )
          }
          aria-label="Filtrar por banca"
        >
          <option value="">Todas as bancas</option>
          {availableEvents.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </div>
      <div className="stat-grid">
        <Stat
          label="Projetos no recorte"
          value={projects.length}
          icon={<ClipboardCheck />}
          foot={`Ciclo ${semester}`}
        />
        <Stat
          label="Média das notas"
          value={average.toLocaleString('pt-BR', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 2,
          })}
          icon={<Activity />}
          foot="base demonstrativa · escala 1 a 5"
        />
        <Stat
          label="Avaliações nesta sessão"
          value={visibleAssessments.length}
          icon={<CheckCheck />}
          foot="Notas submetidas na demonstração"
        />
        <Stat
          label="Maior nota"
          value={
            highest
              ? highest.score.toLocaleString('pt-BR', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })
              : '—'
          }
          icon={<Trophy />}
          foot={highest?.name ?? 'Sem projetos neste recorte'}
        />
      </div>
      <Card>
        <div className="section-head">
          <div>
            <h2 className="section-title">Ranking do ciclo</h2>
            <div className="section-sub">
              Resultados demonstrativos · {year}
            </div>
          </div>
          <Btn kind="ghost" onClick={onOpenPodium}>
            Ver pódio <Trophy />
          </Btn>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pos.</th>
                <th>Projeto</th>
                <th>Instituição</th>
                <th>Média</th>
                <th>Origem da nota</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((project, index) => (
                <tr key={project.id}>
                  <td>
                    <strong style={{ color: index < 3 ? '#37977f' : '#728196' }}>
                      {String(index + 1).padStart(2, '0')}
                    </strong>
                  </td>
                  <td>
                    <button
                      className="row-link"
                      onClick={() => onOpenProject(project)}
                    >
                      {project.name}
                    </button>
                  </td>
                  <td>{project.institution}</td>
                  <td>
                    <strong>{formatScore(project.score)}</strong>
                  </td>
                  <td>
                    {visibleAssessments.some(
                      (assessment) => assessment.projectId === project.id,
                    )
                      ? 'Avaliação enviada'
                      : 'Base demonstrativa'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {projects.length === 0 && (
            <div className="empty-state">
              <ClipboardCheck />
              <strong>Nenhum resultado neste recorte</strong>
              <span>Ajuste os filtros ou troque o vínculo demonstrativo.</span>
            </div>
          )}
        </div>
      </Card>
      <Card style={{ marginTop: 17 }}>
        <div className="section-head">
          <div>
            <h2 className="section-title">Avaliações recebidas</h2>
            <div className="section-sub">
              Notas e observações enviadas nesta sessão
            </div>
          </div>
        </div>
        {visibleAssessments.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Projeto</th>
                  <th>Avaliador</th>
                  <th>Notas por critério</th>
                  <th>Média</th>
                  <th>Observação</th>
                </tr>
              </thead>
              <tbody>
                {visibleAssessments.map((assessment) => {
                  const project = projects.find(
                    (item) => item.id === assessment.projectId,
                  );
                  const evaluator = users.find(
                    (item) => item.id === assessment.evaluatorId,
                  );
                  return (
                    <tr key={assessment.id}>
                      <td>{project?.name ?? 'Projeto'}</td>
                      <td>{evaluator?.name ?? 'Avaliador demonstrativo'}</td>
                      <td>{assessment.scores.join(' · ')}</td>
                      <td>
                        <strong>{assessment.average.toFixed(1)}</strong>
                      </td>
                      <td>{assessment.notes || 'Sem observação'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <ClipboardCheck />
            <strong>Nenhuma avaliação enviada ainda</strong>
            <span>
              Após enviar uma avaliação, suas notas aparecerão aqui e no
              ranking.
            </span>
          </div>
        )}
      </Card>
    </>
  );
}

function PodiumPlace({
  rank,
  project,
}: {
  rank: 'first' | 'second' | 'third';
  project: Project;
}) {
  const place = rank === 'first' ? '1' : rank === 'second' ? '2' : '3';
  return (
    <div className={`podium-place ${rank}`}>
      <div className="podium-name">{project.name}</div>
      <div className="podium-score">
        {project.score.toLocaleString('pt-BR', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}{' '}
        / 5,0
      </div>
      <div className="podium-block">{place}</div>
    </div>
  );
}

export function PodiumPage({
  projects,
  confetti,
  setConfetti,
  soundEnabled,
  onToggleSound,
  onOpenResults,
}: {
  projects: Project[];
  confetti: boolean;
  setConfetti: (value: boolean) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenResults: () => void;
}) {
  const ranked = [...projects].sort((a, b) => b.score - a.score).slice(0, 3);
  const placements = [
    { rank: 'second' as const, project: ranked[1] },
    { rank: 'first' as const, project: ranked[0] },
    { rank: 'third' as const, project: ranked[2] },
  ];

  return (
    <>
      <PageHead
        eyebrow="CELEBRAÇÃO DO CICLO"
        title="Pódio"
        description="Reconheça as equipes que se destacaram nesta rodada."
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn kind="ghost" onClick={() => setConfetti(!confetti)}>
              {confetti ? 'Desativar' : 'Ativar'} confete
            </Btn>
            <Btn kind="ghost" onClick={onToggleSound}>
              {soundEnabled ? 'Som ligado' : 'Som desligado'}
            </Btn>
          </div>
        }
      />
      <div className="podium-hero">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span className="eyebrow" style={{ color: '#82d7c2' }}>
            CLASSIFICAÇÃO DO RECORTE ATUAL
          </span>
          <h2>Ideias que já estão em movimento.</h2>
          <div style={{ color: '#b4c4d2', fontSize: 12 }}>
            Médias demonstrativas · atualizadas após cada avaliação submetida
          </div>
        </div>
        {confetti && (
          <div className="confetti" aria-hidden="true">
            {Array.from({ length: 24 }, (_, index) => (
              <i
                key={index}
                style={{
                  left: `${(index * 37) % 100}%`,
                  top: `${(index * 19) % 35}%`,
                  background: ['#56c9a7', '#ecc66a', '#d5e0e2', '#e0a37c'][
                    index % 4
                  ],
                  animationDelay: `${(index % 9) * -0.31}s`,
                }}
              />
            ))}
          </div>
        )}
        {ranked.length ? (
          <div className="podium-stage">
            {placements.map(
              ({ rank, project }) =>
                project && <PodiumPlace key={rank} rank={rank} project={project} />,
            )}
          </div>
        ) : (
          <div className="empty-state">
            <Trophy />
            <strong>Sem projetos para exibir</strong>
            <span>Escolha outro contexto ou recorte de resultados.</span>
          </div>
        )}
      </div>
      <Card style={{ marginTop: 17 }}>
        <div className="section-head">
          <div>
            <h2 className="section-title">Notas do ciclo</h2>
            <div className="section-sub">
              Resultado demonstrativo, atualizado localmente
            </div>
          </div>
          <button className="inline-link" onClick={onOpenResults}>
            Ver tabela completa <ArrowRight size={14} />
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Classificação</th>
                <th>Equipe</th>
                <th>Média</th>
                <th>Instituição</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((project, index) => (
                <tr key={project.id}>
                  <td>{['1º lugar', '2º lugar', '3º lugar'][index]}</td>
                  <td>
                    <strong>{project.name}</strong>
                  </td>
                  <td>{formatScore(project.score)}</td>
                  <td>{project.institution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
