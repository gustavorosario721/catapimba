import { useEffect, useState, type FormEvent } from "react";

type Institution = {
  id: string;
  name: string;
  status: "active" | "suspended";
  created_at: string;
};

export function PlatformPanel({
  token,
  onChange,
}: {
  token: string;
  onChange?: () => void;
}) {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [attempt, setAttempt] = useState(0);

  async function request(path: string, options: RequestInit = {}) {
    const response = await fetch(`/api/admin/institutions${path}`, {
      ...options,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (response.status === 401 || response.status === 403) {
      setInstitutions([]);
      setDenied(true);
      throw new Error(
        "Seu acesso administrativo não está disponível. Atualize sua conta ou entre novamente.",
      );
    }
    const body = await response.json();
    if (!response.ok)
      throw new Error(body.error ?? "Não foi possível concluir a operação.");
    return body;
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setDenied(false);
    setInstitutions([]);
    void request("", { signal: controller.signal })
      .then((body) => {
        if (!controller.signal.aborted) setInstitutions(body.institutions);
      })
      .catch((reason) => {
        if (!controller.signal.aborted)
          setError(
            reason instanceof Error
              ? reason.message
              : "Não foi possível carregar as instituições.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token, attempt]);

  async function create(event: FormEvent) {
    event.preventDefault();
    if (busy || !name.trim()) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const body = await request("", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
      setInstitutions((current) => [body.institution, ...current]);
      setName("");
      setNotice("Instituição cadastrada.");
      onChange?.();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível cadastrar a instituição.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(institution: Institution) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const status = institution.status === "active" ? "suspended" : "active";
      const body = await request(`/${institution.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setInstitutions((current) =>
        current.map((item) =>
          item.id === institution.id ? body.institution : item,
        ),
      );
      setNotice(
        status === "active" ? "Instituição ativada." : "Instituição suspensa.",
      );
      onChange?.();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível alterar o status.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-label="Gestão de instituições"
      style={{ marginBlock: 24, textAlign: "left" }}
    >
      <h2 className="section-title">Instituições</h2>
      <p>
        Gerencie as instituições da plataforma. Seu acesso de superadministrador
        não depende de vínculo institucional.
      </p>
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {loading ? (
        <p role="status">Carregando instituições…</p>
      ) : (
        !denied && (
          <>
            <form onSubmit={create}>
              <div className="field">
                <label htmlFor="institution-name">Nome da instituição</label>
                <input
                  id="institution-name"
                  name="name"
                  required
                  maxLength={200}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={busy}
                  placeholder="Ex.: SENAI CIMATEC"
                />
              </div>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={busy || !name.trim()}
              >
                Cadastrar instituição
              </button>
            </form>
            {error && (
              <button
                className="btn btn-ghost"
                disabled={busy}
                onClick={() => setAttempt((v) => v + 1)}
              >
                Recarregar instituições
              </button>
            )}
            {!institutions.length && !error && (
              <p>Nenhuma instituição cadastrada.</p>
            )}
            <ul style={{ listStyle: "none", padding: 0 }}>
              {institutions.map((item) => (
                <li
                  key={item.id}
                  style={{ borderTop: "1px solid #e5eaee", paddingBlock: 16 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ overflowWrap: "anywhere" }}>
                      <strong>{item.name}</strong>
                      <br />
                      <span className="status">
                        {item.status === "active" ? "Ativa" : "Suspensa"}
                      </span>
                    </div>
                    <button
                      className="btn btn-ghost"
                      disabled={busy}
                      onClick={() => changeStatus(item)}
                      aria-label={`${item.status === "active" ? "Suspender" : "Ativar"} ${item.name}`}
                    >
                      {item.status === "active" ? "Suspender" : "Ativar"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )
      )}
    </section>
  );
}
