import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Layers3,
  ArrowUpRight,
} from "lucide-react";
import { Logo, LoadingState } from "../components/app-ui";
import { Button } from "../components/ui/button";
import { Tooltip } from "../components/ui/tooltip";
import { useAccessibility } from "../features/accessibility/AccessibilityProvider";
import { ConciergeChat } from "../features/login/ConciergeChat";
const Podium = lazy(() => import("../features/login/InteractivePodium"));
export type LoginProps = {
  mode: "login" | "callback" | "account";
  hasSession: boolean;
  configured: boolean;
  loading: boolean;
  error: string;
  busy: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  retry: () => void;
};
function PodiumPlaceholder() {
  return (
    <div className="static-podium" aria-hidden="true">
      <span className="static-orbit">✧</span>
      <div>
        <span className="podium-step step-two">2</span>
        <span className="podium-step step-one">1</span>
        <span className="podium-step step-three">3</span>
      </div>
    </div>
  );
}
export default function LoginPage({
  mode,
  hasSession,
  configured,
  loading,
  error,
  busy,
  signIn,
  signOut,
  retry,
}: LoginProps) {
  const { theme, preferences, reduceMotion } = useAccessibility();
  const [activity, setActivity] = useState(0);
  const [desktop, setDesktop] = useState(false);
  const [enable3D, setEnable3D] = useState(false);
  const loginButton = useRef<HTMLButtonElement>(null);
  const activityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const media = matchMedia("(min-width: 960px)");
    setDesktop(media.matches);
    const change = () => setDesktop(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(
    () => () => {
      if (activityTimer.current) clearTimeout(activityTimer.current);
    },
    [],
  );
  function interact() {
    if (activityTimer.current) return;
    setActivity((v) => v + 1);
    activityTimer.current = setTimeout(() => {
      activityTimer.current = null;
    }, 400);
  }
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.code === "KeyL") {
        e.preventDefault();
        loginButton.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const render3D = !reduceMotion && (desktop || enable3D);
  return (
    <div className="login-page" data-login-theme={theme}>
      <header className="login-header">
        <Link href="/" aria-label="Catapimba, página inicial">
          <Logo />
        </Link>
        <Link href="/" className="back-link">
          <ArrowLeft size={16} />
          Voltar ao início
        </Link>
      </header>
      <main id="main-content" className="login-layout">
        <motion.section
          className="login-form-pane"
          aria-labelledby="login-heading"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.35 }}
        >
          <div className="login-overline">
            <span className="login-accent" />
            SEU ESPAÇO DE INOVAÇÃO
          </div>
          <h1 id="login-heading" tabIndex={-1}>
            {mode === "callback" ? (
              "Só mais um instante."
            ) : hasSession ? (
              "Sua conta, seu espaço."
            ) : (
              <>
                Boas ideias começam
                <br />
                com uma <em>conexão.</em>
              </>
            )}
          </h1>
          <p className="login-description">
            {mode === "callback"
              ? "Estamos concluindo seu acesso com segurança."
              : "Acompanhe projetos, conecte sua equipe e dê espaço ao próximo passo."}
          </p>
          <div className="login-access-card">
            <div className="login-access-title">
              <ShieldCheck size={19} />
              <h2>
                {mode === "callback"
                  ? "Concluindo seu acesso"
                  : mode === "account" && hasSession
                    ? "Minha conta"
                    : "Entrar na plataforma"}
              </h2>
            </div>
            {error && (
              <div
                className="notice error login-error"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle size={19} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
            {!configured ? (
              <p role="status">
                O acesso à plataforma ainda está sendo configurado.
              </p>
            ) : loading ? (
              <LoadingState>Verificando sua sessão…</LoadingState>
            ) : hasSession ? (
              <>
                <p>
                  {error
                    ? "Tente consultar seus vínculos novamente."
                    : "Consultando seus vínculos…"}
                </p>
                {error && (
                  <Button variant="ghost" onClick={retry}>
                    Tentar novamente
                  </Button>
                )}
                <Button onClick={signOut} disabled={busy}>
                  Sair da conta
                </Button>
              </>
            ) : (
              <>
                <p>
                  Use sua conta Google para entrar ou criar sua conta. O acesso
                  à instituição depende de um vínculo aprovado.
                </p>
                <Button
                  ref={loginButton}
                  className="google-signin"
                  onFocus={interact}
                  onPointerEnter={interact}
                  onClick={() => {
                    interact();
                    void signIn();
                  }}
                  disabled={busy}
                >
                  {busy ? (
                    "Redirecionando…"
                  ) : (
                    <>
                      <span className="google-letter" aria-hidden="true">
                        G
                      </span>
                      Entrar com Google
                      <ArrowRight size={18} />
                    </>
                  )}
                </Button>
                <p className="login-privacy">
                  <ShieldCheck size={14} aria-hidden="true" />
                  Sua senha fica com o Google. Não a pedimos aqui.
                </p>
              </>
            )}
            <div className="auth-links">
              <Link href="/solicitar-acesso">Como solicitar acesso</Link>
              <Link href="/recuperar-senha">Preciso de ajuda</Link>
            </div>
          </div>
          {mode !== "callback" && (
            <ConciergeChat
              onActivity={interact}
              onFocusLogin={() => loginButton.current?.focus()}
            />
          )}
          <p className="login-footnote">
            Cada instituição com seu contexto.
            <br />
            Cada pessoa com seu próximo passo.
          </p>
        </motion.section>
        <motion.aside
          className="login-visual"
          aria-label="Inspiração para seus projetos"
          initial={false}
          animate={{
            opacity: 1,
            backgroundColor: theme === "dark" ? "#152f32" : "#e1eee7",
          }}
          transition={{ duration: reduceMotion ? 0 : 0.4 }}
        >
          <div className="visual-topline">
            <span>
              <Layers3 size={16} />
              CATAPIMBA
            </span>
            <span className="visual-pill">Ideias que avançam</span>
          </div>
          <div className="podium-illustration">
            {render3D ? (
              <Suspense fallback={<PodiumPlaceholder />}>
                <Podium activity={activity} />
              </Suspense>
            ) : (
              <PodiumPlaceholder />
            )}
          </div>
          <div className="visual-caption">
            <span className="eyebrow">CONSTRUA. COMPARTILHE. EVOLUA.</span>
            <h2>
              O próximo destaque
              <br />
              pode começar com você.
            </h2>
            <p>
              Um lugar para transformar o potencial de cada projeto em novas
              possibilidades.
            </p>
            {!reduceMotion && !desktop && (
              <Tooltip text="Visual decorativo opcional. Não altera seu acesso.">
                <Button variant="ghost" onClick={() => setEnable3D((v) => !v)}>
                  {enable3D ? "Usar visual estático" : "Ativar visual 3D"}
                </Button>
              </Tooltip>
            )}
            <span className="visual-caption-note">
              {preferences.calm
                ? "Visual simplificado · modo tranquilo"
                : reduceMotion
                  ? "Visual estático · preferência de movimento reduzido"
                  : "Uma perspectiva diferente para boas ideias."}
            </span>
          </div>
          <div className="visual-bottomline">
            <span>Feito para conectar pessoas.</span>
            <ArrowUpRight size={22} aria-hidden="true" />
          </div>
        </motion.aside>
      </main>
    </div>
  );
}
