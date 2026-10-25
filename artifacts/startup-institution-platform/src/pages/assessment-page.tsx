import {
  CheckCheck,
  ClipboardCheck,
} from 'lucide-react';
import type {
  DemoAssessment,
  Project,
} from '../demo-data';
import { events } from '../demo-data';
import { Btn, Card, Field, PageHead, Status } from '../components/prototype-ui';

type DemoEvent = (typeof events)[number];

export function AssessmentPage({
  evaluatorName,
  roleLabel,
  assignedEvents,
  assignedProjects,
  criteria,
  assessments,
  evaluatorId,
  selectedProject,
  setSelectedProject,
  scores,
  setScores,
  notes,
  setNotes,
  submitted,
  receipt,
  onSubmit,
  onReset,
}: {
  evaluatorName: string;
  roleLabel: string;
  assignedEvents: DemoEvent[];
  assignedProjects: Project[];
  criteria: string[];
  assessments: DemoAssessment[];
  evaluatorId: number;
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  scores: number[];
  setScores: (scores: number[]) => void;
  notes: string;
  setNotes: (notes: string) => void;
  submitted: boolean;
  receipt: string;
  onSubmit: () => void;
  onReset: () => void;
}) {
  const selectedAssessment = selectedProject
    ? assessments.find(
        (assessment) =>
          assessment.projectId === selectedProject.id &&
          assessment.evaluatorId === evaluatorId,
      )
    : undefined;

  return (
    <>
      <PageHead
        eyebrow="MINHA ÁREA"
        title="Avaliações"
        description="Bancas atribuídas a você e formulários de avaliação."
      />
      <div className="notice">
        Você está na perspectiva de {evaluatorName} · {roleLabel}. Notas e
        observações ficam somente nesta sessão demonstrativa.
      </div>
      {submitted ? (
        <Card>
          <div className="empty-state">
            <div className="stat-icon" style={{ margin: 'auto' }}>
              <CheckCheck />
            </div>
            <strong>Avaliação enviada</strong>
            <span>
              Recibo demonstrativo · {receipt}
              {selectedProject ? ` · ${selectedProject.name}` : ''}
            </span>
            <div style={{ marginTop: 17 }}>
              <Btn kind="ghost" onClick={onReset}>
                Nova avaliação
              </Btn>
            </div>
          </div>
        </Card>
      ) : (
        <div className="split">
          <Card>
            <div className="section-head">
              <div>
                <h2 className="section-title">Bancas atribuídas</h2>
                <div className="section-sub">
                  {assignedEvents.length} eventos para este vínculo
                </div>
              </div>
              <Status variant="pending">Em andamento</Status>
            </div>
            {assignedProjects.map((project) => {
              const event = assignedEvents.find((item) =>
                item.projectIds.includes(project.id),
              );
              const priorAssessment = assessments.find(
                (assessment) =>
                  assessment.projectId === project.id &&
                  assessment.evaluatorId === evaluatorId,
              );
              return (
                <button
                  data-testid={`button-select-evaluation-project-${project.id}`}
                  key={project.id}
                  onClick={() => {
                    setSelectedProject(project);
                    setScores(
                      priorAssessment?.scores ?? criteria.map(() => 0),
                    );
                    setNotes(priorAssessment?.notes ?? '');
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: 13,
                    background:
                      selectedProject?.id === project.id
                        ? '#e9f6f1'
                        : '#f8fafb',
                    border: '1px solid #e7ecef',
                    borderRadius: 8,
                    marginBottom: 8,
                    cursor: 'pointer',
                    color: '#33485e',
                  }}
                >
                  <strong style={{ fontSize: 12 }}>{project.name}</strong>
                  <div className="section-sub">
                    {event?.name ?? 'Banca atribuída'}
                  </div>
                </button>
              );
            })}
            {assignedProjects.length === 0 && (
              <div className="empty-state">
                <ClipboardCheck />
                <strong>Nenhum projeto atribuído</strong>
                <span>
                  Peça à coordenação para incluir você em uma banca.
                </span>
              </div>
            )}
          </Card>
          <Card>
            {!selectedProject ||
            !assignedProjects.some(
              (project) => project.id === selectedProject.id,
            ) ? (
              <div className="empty-state">
                <ClipboardCheck size={22} />
                <strong>Escolha um projeto</strong>
                <span>
                  Selecione um projeto de uma banca atribuída ao seu vínculo.
                </span>
              </div>
            ) : (
              <>
                <div className="section-head">
                  <div>
                    <h2 className="section-title">{selectedProject.name}</h2>
                    <div className="section-sub">{selectedProject.team}</div>
                  </div>
                </div>
                {criteria.map((criterion, index) => (
                  <div
                    key={`${index}-${criterion}`}
                    style={{
                      padding: '11px 0',
                      borderBottom: '1px solid #edf0f2',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#42566b',
                      }}
                    >
                      {criterion}
                    </div>
                    <div
                      style={{ display: 'flex', gap: 6, marginTop: 8 }}
                      role="group"
                      aria-label={`Notas para ${criterion}`}
                    >
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          aria-label={`${criterion}: nota ${score}`}
                          aria-pressed={scores[index] === score}
                          data-testid={`score-${index}-${score}`}
                          key={score}
                          onClick={() =>
                            setScores(
                              criteria.map((_, position) =>
                                position === index ? score : scores[position] ?? 0,
                              ),
                            )
                          }
                          className="btn"
                          style={{
                            padding: '7px 11px',
                            background:
                              scores[index] === score ? '#203752' : '#f1f4f5',
                            color:
                              scores[index] === score ? 'white' : '#6b7c8b',
                            borderColor: 'transparent',
                          }}
                        >
                          {score}
                        </button>
                      ))}
                      <span
                        className="section-sub"
                        style={{ alignSelf: 'center', marginLeft: 4 }}
                      >
                        {[
                          'Inicial',
                          'Em desenvolvimento',
                          'Adequado',
                          'Consistente',
                          'Referência',
                        ][(scores[index] || 0) - 1] || 'Selecione'}
                      </span>
                    </div>
                  </div>
                ))}
                <Field label="Observação para a equipe">
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    data-testid="input-assessment-notes"
                    placeholder="Registre um comentário construtivo..."
                  />
                </Field>
                <Btn testId="button-submit-evaluation" onClick={onSubmit}>
                  Submeter avaliação
                </Btn>
                {selectedAssessment && (
                  <div className="section-sub" style={{ marginTop: 10 }}>
                    Você já enviou uma avaliação deste projeto. Uma nova
                    submissão substituirá a anterior nesta sessão.
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
