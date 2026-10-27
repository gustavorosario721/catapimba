import { apiFetch } from "../../lib/api";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, Check, MessageCircle, Sparkles, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

type Message = { role: "user" | "assistant"; content: string };
const topics = [
  {
    id: "login",
    label: "Como entrar",
    reply:
      "Vamos por etapas. 1. Use “Entrar com Google”. 2. Escolha sua conta no Google. 3. Ao voltar, consulte seus vínculos. O Catapimba não solicita sua senha aqui.",
  },
  {
    id: "access",
    label: "Pedir acesso",
    reply:
      "Primeiro entre com Google. Depois abra “Meus acessos”, escolha a instituição e o perfil desejado e envie o pedido. A gestão precisa aprovar o vínculo; entrar não concede acesso automaticamente.",
  },
  {
    id: "recover",
    label: "Recuperar conta",
    reply:
      "Não há senha própria do Catapimba. Se perdeu o acesso ao Google, use a recuperação oficial do Google. Não consigo recuperar ou alterar sua conta por este chat.",
  },
  {
    id: "platform",
    label: "Conhecer a plataforma",
    reply:
      "O Catapimba reúne projetos, equipes, critérios e bancas de avaliação. Alunos e orientadores acompanham seus projetos; avaliadores designados enviam notas de 1 a 5. Cada instituição controla seus acessos e resultados.",
  },
];
function guidance(text: string) {
  const q = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (/senha|recuper|perdi/.test(q)) return topics[2].reply;
  if (/acesso|institui|vincul|aprov/.test(q)) return topics[1].reply;
  if (/entrar|login|google|cadastro/.test(q)) return topics[0].reply;
  if (/plataforma|projeto|avali|banca/.test(q)) return topics[3].reply;
  return "Posso orientar sobre entrada com Google, solicitação de vínculo e recuperação da conta Google. Use uma das opções acima. Este guia não consulta contas, não envia pedidos e não altera dados.";
}
export function ConciergeChat({ onFocusLogin }: { onFocusLogin: () => void }) {
  const [open, setOpen] = useState(false),
    [text, setText] = useState(""),
    [messages, setMessages] = useState<Message[]>([]),
    [available, setAvailable] = useState(false),
    [useAI, setUseAI] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    void apiFetch("/api/concierge/status", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((v) => {
        if (!controller.signal.aborted) setAvailable(v?.available === true);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [open]);
  async function send(content: string) {
    if (busy || !content.trim()) return;
    const message: Message = {
      role: "user",
      content: content.trim().slice(0, 600),
    };
    const history = [...messages, message].slice(-10);
    setText("");
    setError("");
    if (!useAI) {
      setMessages([
        ...history,
        { role: "assistant", content: guidance(content) },
      ]);
      return;
    }
    setMessages(history);
    setBusy(true);
    const controller = new AbortController();
    abort.current = controller;
    try {
      const r = await apiFetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      const data = await r.json().catch(() => {
        throw new Error("O serviço de IA não respondeu. Use o guia de acesso.");
      });
      if (!r.ok)
        throw new Error(
          data.error ?? "A IA não respondeu. Use o guia de acesso.",
        );
      setMessages([...history, { role: "assistant", content: data.text }]);
    } catch (reason) {
      if (!controller.signal.aborted)
        setError(
          reason instanceof Error ? reason.message : "Não foi possível enviar.",
        );
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    void send(text);
  }
  return (
    <section className="concierge" aria-labelledby="concierge-heading">
      <button
        type="button"
        className="concierge-trigger"
        aria-expanded={open}
        aria-controls="concierge-content"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="concierge-avatar">
          <MessageCircle size={19} />
        </span>
        <span>
          <strong id="concierge-heading">Vamos juntos?</strong>
          <small>Um guia por texto, no seu ritmo.</small>
        </span>
        {open ? <X size={18} /> : <span className="concierge-open">Abrir</span>}
      </button>
      <div id="concierge-content" hidden={!open} className="concierge-content">
        <p>
          Guia de acesso com respostas prontas. Não envie senhas, documentos ou
          dados pessoais.
        </p>
        <div className="concierge-topics">
          {topics.map((t) => (
            <Button
              key={t.id}
              variant="ghost"
              disabled={busy}
              onClick={() => void send(t.label)}
            >
              {t.label}
            </Button>
          ))}
        </div>
        {available && (
          <label className="workspace-check">
            <input
              type="checkbox"
              checked={useAI}
              disabled={busy}
              onChange={(e) => setUseAI(e.target.checked)}
            />
            Conversar com IA · respostas geradas podem conter erros
          </label>
        )}
        {useAI && (
          <p className="concierge-disclosure">
            Ao enviar, sua dúvida será processada pelo provedor de IA
            configurado. Não inclua dados pessoais.
          </p>
        )}
        <div
          className="concierge-transcript"
          role="log"
          aria-label="Conversa de orientação"
          aria-live="polite"
          aria-relevant="additions text"
        >
          {messages.map((m, i) => (
            <p key={i} className={`chat-message ${m.role}`}>
              <span className="sr-only">
                {m.role === "user" ? "Você" : "Guia"}:{" "}
              </span>
              {m.content}
            </p>
          ))}
          {busy && (
            <p role="status">
              <Sparkles size={16} />
              Preparando uma resposta…
            </p>
          )}
        </div>
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
        <form onSubmit={submit} className="concierge-form">
          <Label htmlFor="concierge-message" className="sr-only">
            Sua dúvida sobre o acesso
          </Label>
          <Input
            ref={input}
            id="concierge-message"
            placeholder="Como posso ajudar com seu acesso?"
            maxLength={600}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
            }}
            disabled={busy}
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Enviar dúvida"
            disabled={busy || !text.trim()}
          >
            <ArrowUp size={18} />
          </Button>
        </form>
        <div className="concierge-actions">
          <Button variant="ghost" onClick={onFocusLogin}>
            <Check size={16} />
            Ir para o botão de entrada
          </Button>
          <a
            href="https://accounts.google.com/signin/recovery"
            target="_blank"
            rel="noreferrer"
          >
            Recuperar conta Google
            <span className="sr-only"> (abre em outra aba)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
