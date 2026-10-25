import { useEffect } from "react";
import { Redirect, useLocation } from "wouter";
import { PublicHome, AccessInfo, RecoveryInfo } from "./pages/public-pages";
import { IdentityPage } from "./pages/identity-page";
import NotFound from "./pages/not-found";

// Preserve bookmarked addresses without retaining any simulated application.
const legacyRoutes: Record<string, string> = {
  "/instituicao": "/conta",
  "/superadmin": "/app/institutions",
  "/usuarios": "/app/members",
  "/projetos": "/app/projects",
  "/projetos/novo": "/app/projects",
  "/equipes": "/app/projects",
  "/orientacao": "/app/projects",
  "/bancas": "/app/events",
  "/criterios": "/app/criteria",
  "/avaliacoes": "/app/evaluations",
  "/resultados": "/app/results",
  "/relatorios": "/app/reports",
  "/podio": "/app/podium",
  "/permissoes": "/conta",
};

export default function App() {
  const [path] = useLocation();
  useEffect(() => {
    document.title = "Catapimba · Gestão e avaliação de projetos";
    // Announce route changes to keyboard and screen-reader users.
    document.querySelector<HTMLElement>("main h1")?.focus();
    window.scrollTo({ top: 0 });
  }, [path]);
  if (path === "/") return <PublicHome />;
  if (path === "/login") return <IdentityPage mode="login" />;
  if (path === "/auth/callback") return <IdentityPage mode="callback" />;
  if (path === "/conta" || path.startsWith("/app/"))
    return <IdentityPage mode="account" />;
  if (path === "/app") return <Redirect to="/conta" />;
  if (path === "/solicitar-acesso") return <AccessInfo />;
  if (path === "/recuperar-senha") return <RecoveryInfo />;
  const destination =
    legacyRoutes[path] ??
    (/^\/projetos\/[^/]+$/.test(path) ? "/app/projects" : undefined) ??
    (/^\/bancas\/[^/]+$/.test(path) ? "/app/events" : undefined);
  return destination ? <Redirect to={destination} /> : <NotFound />;
}
