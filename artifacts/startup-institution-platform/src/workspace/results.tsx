import { apiFetch } from "../lib/api";
import { useEffect, useRef, useState } from "react";
import type { WorkspaceData } from "./types";
import { Card, Empty, InputField, score } from "./ui";

export function ResultsModule({
  data,
  token,
  institutionId,
  mode,
}: {
  data: WorkspaceData;
  token: string;
  institutionId: string;
  mode: "results" | "reports" | "podium";
}) {
  const [eventId, setEventId] = useState("");
  const [query, setQuery] = useState("");
  const [confetti, setConfetti] = useState(true);
  const [sound, setSound] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const audio = useRef<AudioContext | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const result =
    data.results.find((r) => r.event_id === eventId) ?? data.results[0];
  function stopAudio() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    const context = audio.current;
    audio.current = null;
    if (context && context.state !== "closed")
      void context.close().catch(() => {});
  }
  useEffect(() => {
    setSound(false);
    return stopAudio;
  }, [result?.event_id, mode]);
  async function toggleSound() {
    if (sound) {
      stopAudio();
      setSound(false);
      return;
    }
    try {
      const context = new AudioContext();
      audio.current = context;
      await context.resume();
      const play = () => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.frequency.value = 660;
        gain.gain.setValueAtTime(0.035, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          context.currentTime + 0.25,
        );
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.26);
      };
      play();
      timer.current = setInterval(play, 1800);
      setSound(true);
    } catch {
      stopAudio();
      setSound(false);
      setError("Não foi possível reproduzir o som neste dispositivo.");
    }
  }
  async function download(type: "projects" | "results") {
    if (downloading) return;
    setDownloading(true);
    setError("");
    try {
      const response = await apiFetch(
        `/api/workspace/${institutionId}/export?type=${type}${type === "results" ? `&event=${result?.event_id ?? ""}` : ""}`,
        { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
      );
      if (!response.ok)
        throw new Error("Exportação não disponível para este contexto.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `catapimba-${type}.csv`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha ao exportar.");
    } finally {
      setDownloading(false);
    }
  }
  const rows =
    result?.rows.filter((r) =>
      r.name.toLowerCase().includes(query.toLowerCase()),
    ) ?? [];
  return (
    <>
      <Card>
        <h2 className="section-title">
          {mode === "podium"
            ? "Pódio de premiação"
            : mode === "reports"
              ? "Relatórios e exportação"
              : "Resultados e classificação"}
        </h2>
        <p>
          Média ponderada pelos critérios de cada avaliação e média entre
          avaliadores. Empates na média final de quatro casas decimais
          compartilham a mesma posição; a exibição usa duas casas. Resultados
          parciais ficam restritos à gestão.
        </p>
        {error && (
          <p role="alert" className="notice error">
            {error}
          </p>
        )}
        {downloading && <p role="status">Preparando arquivo…</p>}
        {mode === "reports" && (
          <div className="workspace-actions">
            <button
              className="btn btn-primary"
              disabled={downloading}
              onClick={() => download("projects")}
            >
              Exportar portfólio autorizado (CSV)
            </button>
            {result && (
              <button
                className="btn btn-ghost"
                disabled={downloading}
                onClick={() => download("results")}
              >
                Exportar resultado desta banca (CSV)
              </button>
            )}
          </div>
        )}
        {!data.results.length ? (
          <Empty>Ainda não há resultados disponíveis para seu perfil</Empty>
        ) : (
          <>
            <InputField label="Banca dos resultados">
              <select
                value={result?.event_id ?? ""}
                onChange={(e) => setEventId(e.target.value)}
              >
                {data.results.map((r) => (
                  <option key={r.event_id} value={r.event_id}>
                    {r.name} · {r.published ? "Publicado" : "Restrito à gestão"}
                  </option>
                ))}
              </select>
            </InputField>
            <p className="notice">
              {result?.status === "closed"
                ? "Banca encerrada"
                : "Resultado parcial — avaliações em andamento"}{" "}
              ·{" "}
              {result?.published
                ? "Publicado para a instituição"
                : "Ainda não publicado"}
            </p>
            {mode === "podium" && result && (
              <>
                {result.status !== "closed" ? (
                  <p>Encerre a banca antes da premiação.</p>
                ) : (
                  <div className="podium-hero">
                    <h2>{result.name}</h2>
                    <div className="workspace-actions">
                      <button
                        className="btn btn-ghost"
                        aria-pressed={confetti}
                        onClick={() => setConfetti((v) => !v)}
                      >
                        {confetti ? "Desativar" : "Ativar"} confete
                      </button>
                      <button
                        className="btn btn-ghost"
                        aria-pressed={sound}
                        onClick={toggleSound}
                      >
                        {sound ? "Desligar som" : "Ligar som"}
                      </button>
                    </div>
                    {confetti && (
                      <div className="confetti" aria-hidden="true">
                        {Array.from({ length: 20 }, (_, i) => (
                          <i
                            key={i}
                            style={{
                              left: `${(i * 37) % 100}%`,
                              background: ["#56c9a7", "#ecc66a", "#d5e0e2"][
                                i % 3
                              ],
                              animationDelay: `${-(i % 7) * 0.3}s`,
                            }}
                          />
                        ))}
                      </div>
                    )}
                    <div className="workspace-podium">
                      {result.rows
                        .filter((r) => r.position !== null && r.position <= 3)
                        .map((r) => (
                          <article
                            key={r.id}
                            className={`podium-place ${r.position === 1 ? "first" : r.position === 2 ? "second" : "third"}`}
                          >
                            <div className="podium-name">{r.name}</div>
                            <div className="podium-score">
                              {score(r.score)} / 5
                            </div>
                            <div className="podium-block">{r.position}º</div>
                          </article>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
            <InputField label="Pesquisar no resultado">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nome do projeto"
              />
            </InputField>
            <div
              className="table-wrap"
              tabIndex={0}
              role="region"
              aria-label="Classificação dos projetos"
            >
              <table>
                <thead>
                  <tr>
                    <th>Posição</th>
                    <th>Projeto</th>
                    <th>Média</th>
                    <th>Avaliações</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.position ? `${r.position}º` : "—"}</td>
                      <td>{r.name}</td>
                      <td>{score(r.score)}</td>
                      <td>
                        {r.submitted}/{r.expected}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!rows.length && (
              <Empty>
                {result?.rows.length
                  ? "Nenhum projeto corresponde à pesquisa"
                  : "Nenhuma avaliação registrada nesta banca"}
              </Empty>
            )}
          </>
        )}
      </Card>
    </>
  );
}
