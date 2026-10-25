import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import type { Session } from '@supabase/supabase-js';
import { isGoogleEnabled, supabase } from '../lib/supabase';
import { PlatformPanel } from './platform-panel';
import { Btn, Logo } from '../components/prototype-ui';

type Identity = {
  user: { id: string; email?: string };
  isPlatformAdministrator: boolean;
  memberships: Array<{
    id: string; status: string;
    institutions: { id: string; name: string; status: string } | null;
    membership_roles: Array<{ role: string }>;
  }>;
};

const statuses: Record<string, string> = { active: 'Ativo', pending: 'Aguardando aprovação', suspended: 'Suspenso' };

export function IdentityPage({ mode }: { mode: 'login' | 'callback' | 'account' }) {
  const [, navigate] = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      if (alive) setSession(next);
    });
    void supabase.auth.getSession().then(({ data, error: authError }) => {
      if (!alive) return;
      setSession(data.session);
      setLoading(false);
      if (authError) setError('Não foi possível concluir o acesso. Tente entrar novamente.');
      else if (mode === 'callback' && !data.session) setError('O acesso não foi concluído. Volte ao login e tente novamente.');
    }).catch(() => {
      if (alive) { setLoading(false); setError('Serviço de autenticação indisponível.'); }
    });
    return () => { alive = false; subscription.unsubscribe(); };
  }, [mode]);

  useEffect(() => {
    if (session && mode !== 'account') navigate('/conta', { replace: true });
  }, [session, mode, navigate]);

  useEffect(() => {
    if (mode !== 'account' || !session) { setIdentity(null); return; }
    const controller = new AbortController();
    setIdentity(null);
    setError('');
    void fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${session.access_token}` },
      signal: controller.signal,
      cache: 'no-store',
    }).then(async response => {
      if (!response.ok) throw new Error(response.status === 401
        ? 'Sua sessão não é válida. Saia e entre novamente.'
        : 'Não foi possível consultar seus vínculos. Tente novamente.');
      const data: Identity = await response.json();
      if (!controller.signal.aborted) setIdentity(data);
    }).catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Não foi possível consultar seus vínculos.'); });
    return () => controller.abort();
  }, [mode, session, attempt]);

  async function signIn() {
    if (!supabase) return;
    setBusy(true); setError('');
    try {
      if (!await isGoogleEnabled()) {
        setError('O login com Google ainda está sendo configurado. Tente novamente mais tarde.');
        setBusy(false);
        return;
      }
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (authError) throw authError;
    } catch { setError('Não foi possível iniciar o acesso com Google. Tente novamente.'); setBusy(false); }
  }

  async function signOut() {
    if (!supabase) return;
    setBusy(true); setError('');
    try {
      const { error: authError } = await supabase.auth.signOut({ scope: 'local' });
      if (authError) throw authError;
      setIdentity(null); setSession(null); navigate('/login', { replace: true });
    } catch { setError('Não foi possível sair. Tente novamente.'); }
    finally { setBusy(false); }
  }

  return <main className="auth-page">
    <header className="public-nav"><Link href="/"><Logo /></Link><Link href="/">Voltar ao início</Link></header>
    <section className="auth-card" style={identity?.isPlatformAdministrator ? { width: 'min(900px, calc(100% - 32px))', maxWidth: 900 } : undefined}>
      <span className="eyebrow">ACESSO À PLATAFORMA</span>
      <h1>{mode === 'account' ? (identity?.isPlatformAdministrator ? 'Administração da plataforma' : 'Minha conta') : mode === 'callback' ? 'Concluindo seu acesso' : 'Entrar na plataforma'}</h1>
      {error && <p role="alert">{error}</p>}
      {!supabase ? <p>O acesso à plataforma ainda está sendo configurado.</p>
        : loading ? <p role="status">Verificando sua sessão…</p>
        : mode === 'account' && session ? <>
          {!identity && !error && <p role="status">Consultando seus vínculos…</p>}
          {identity && <>
            <p>{identity.user.email}</p>
            {identity.isPlatformAdministrator && <PlatformPanel token={session.access_token} />}
            {!identity.isPlatformAdministrator && (identity.memberships.length === 0 ? <p>Você ainda não possui vínculo com uma instituição. Aguarde um administrador vincular sua conta. O cadastro e a aprovação de acessos serão disponibilizados na próxima etapa.</p>
              : <ul>{identity.memberships.map(m => <li key={m.id}>
                <strong>{m.institutions?.name ?? 'Instituição indisponível'}</strong> — {statuses[m.status] ?? m.status}
                {m.institutions?.status === 'suspended' && <span> · Instituição suspensa</span>}
                {m.status === 'active' && m.institutions?.status === 'active' && <span> · Vínculo ativo. A área institucional será disponibilizada na próxima etapa.</span>}
              </li>)}</ul>)}
          </>}
          {error && <Btn kind="ghost" onClick={() => setAttempt(v => v + 1)}>Tentar novamente</Btn>}
          <button className="btn btn-primary" disabled={busy} onClick={signOut}>Sair da conta</button>
        </> : <>
          <p>Entre com sua conta Google. O acesso às instituições depende de um vínculo aprovado.</p>
          <button className="btn btn-primary" disabled={busy} onClick={signIn}>{busy ? 'Redirecionando…' : 'Entrar com Google'}</button>
        </>}
      <p style={{ marginTop: 24 }}><Link href="/instituicao">Explorar demonstração com dados fictícios</Link></p>
    </section>
  </main>;
}
