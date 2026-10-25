import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ArrowRight,
  ChartNoAxesCombined,
  Check,
  ListChecks,
  LockKeyhole,
  LogIn,
  PanelsTopLeft,
  UsersRound,
} from 'lucide-react';
import { institutions, roles } from '../demo-data';
import { Btn, Logo } from '../components/prototype-ui';

export function PublicHome() {
  return (
    <main className="public-page">
      <header className="public-nav">
        <Logo />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/solicitar-acesso" className="inline-link">
            Solicitar acesso
          </Link>
          <Link href="/login" className="btn btn-primary">
            <LogIn size={15} /> Entrar
          </Link>
        </div>
      </header>
      <section className="public-hero">
        <div className="hero-copy">
          <span className="eyebrow">PLATAFORMA DE INOVAÇÃO</span>
          <h1>
            Boas ideias
            <br />
            merecem um
            <br />
            <span style={{ color: '#40a78d' }}>bom espaço.</span>
          </h1>
          <p>
            Um lugar claro para acompanhar equipes, organizar bancas e avaliar
            projetos de inovação — do primeiro insight ao resultado final.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/login" className="btn btn-primary">
              Conhecer a plataforma <ArrowRight size={15} />
            </Link>
            <Link href="/solicitar-acesso" className="btn btn-ghost">
              Pedir acesso
            </Link>
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: 11,
              color: '#8491a0',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <LockKeyhole size={13} /> Protótipo demonstrativo · sem dados reais
          </div>
        </div>
        <div className="hero-art">
          <div className="art-grid">
            <div className="art-tile">
              <span>CICLO DE INOVAÇÃO · 2025.2</span>
              <strong>18 projetos</strong>
              <span>em acompanhamento</span>
            </div>
            <div className="art-tile">
              <span>AVALIAÇÕES</span>
              <strong>72%</strong>
              <span>concluídas no ciclo</span>
              <div
                className="progress-track"
                style={{ marginTop: 11, background: '#ffffff2b' }}
              >
                <span style={{ width: '72%' }} />
              </div>
            </div>
            <div className="art-tile art-wide">
              <div>
                <span>PRÓXIMA BANCA</span>
                <strong style={{ fontSize: 15, margin: '8px 0 0' }}>
                  Validação de propostas
                </strong>
                <span>18 de novembro · 14h</span>
              </div>
              <div className="mint-orb">
                <PanelsTopLeft size={24} />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="public-section">
        <span className="eyebrow">UM FLUXO, DO COMEÇO AO FIM</span>
        <h2>
          Menos planilhas soltas.
          <br />
          Mais tempo para boas conversas.
        </h2>
        <p>
          Coordene o trabalho de cada ciclo sem perder de vista as pessoas, os
          projetos e as decisões que fazem a inovação avançar.
        </p>
        <div className="feature-row">
          <div className="feature">
            <UsersRound size={20} color="#429d87" />
            <h3>Times conectados</h3>
            <p>
              Alunos, orientadores e avaliadores no mesmo espaço de trabalho,
              com contexto de cada instituição.
            </p>
          </div>
          <div className="feature">
            <ListChecks size={20} color="#429d87" />
            <h3>Avaliação consistente</h3>
            <p>
              Critérios claros, escalas alinhadas e registros demonstrativos
              para cada apresentação.
            </p>
          </div>
          <div className="feature">
            <ChartNoAxesCombined size={20} color="#429d87" />
            <h3>Decisões à vista</h3>
            <p>
              Resultados e relatórios que ajudam a entender o ciclo sem
              complicar a leitura.
            </p>
          </div>
        </div>
      </section>
      <section
        className="public-section"
        style={{ background: '#edf4f2' }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 25,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span className="eyebrow">COMECE PELA DEMO</span>
            <h2 style={{ marginTop: 9 }}>
              Explore como sua instituição pode trabalhar.
            </h2>
            <p>
              Alterne entre seis perspectivas e veja como o mesmo ciclo ganha
              clareza para cada pessoa.
            </p>
          </div>
          <Link href="/instituicao" className="btn btn-primary">
            Explorar demonstração <ArrowRight size={15} />
          </Link>
        </div>
      </section>
      <footer className="public-footer">
        <Logo />
        <span>Protótipo visual · dados fictícios · 2025</span>
      </footer>
    </main>
  );
}

export function AuthPage({
  kind,
}: {
  kind: 'login' | 'request' | 'recover';
}) {
  const [, setLocation] = useLocation();
  const [sent, setSent] = useState(false);
  const title =
    kind === 'login'
      ? 'Entre para explorar'
      : kind === 'request'
        ? 'Peça acesso à sua instituição'
        : 'Recupere seu acesso';
  const description =
    kind === 'login'
      ? 'A demonstração é aberta. Escolha uma perspectiva depois de entrar.'
      : kind === 'request'
        ? 'Conte um pouco sobre você e sua instituição. O envio é apenas demonstrativo.'
        : 'Informe seu e-mail para receber uma confirmação demonstrativa.';

  function submit(event: FormEvent) {
    event.preventDefault();
    if (kind === 'login') {
      setLocation('/instituicao');
      return;
    }
    setSent(true);
  }

  return (
    <main className="auth-page">
      <header className="public-nav">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Logo />
        </Link>
        <Link className="inline-link" href="/">
          Voltar para início
        </Link>
      </header>
      <div className="auth-card">
        <span className="eyebrow">ELO · AMBIENTE DEMONSTRATIVO</span>
        <h1>{sent ? 'Tudo certo por aqui.' : title}</h1>
        <p>
          {sent
            ? 'Esta ação foi simulada localmente. Nenhum dado foi enviado a um servidor.'
            : description}
        </p>
        {sent ? (
          <div className="notice">
            <Check
              size={16}
              style={{ verticalAlign: 'middle', marginRight: 7 }}
            />
            Confirmação local registrada com sucesso.
          </div>
        ) : kind === 'login' ? (
          <div>
            <Btn onClick={() => setLocation('/instituicao')}>
              Explorar demonstração <ArrowRight size={15} />
            </Btn>
          </div>
        ) : (
          <form onSubmit={submit}>
            {kind === 'request' && (
              <div className="field">
                <label>Seu nome</label>
                <input
                  required
                  placeholder="Como podemos chamar você?"
                  data-testid="input-access-name"
                />
              </div>
            )}
            <div className="field">
              <label>E-mail institucional</label>
              <input
                type="email"
                required
                placeholder="nome@instituicao.edu.br"
                data-testid="input-access-email"
              />
            </div>
            {kind === 'request' && (
              <>
                <div className="field">
                  <label>Instituição</label>
                  <select
                    required
                    defaultValue=""
                    data-testid="select-access-institution"
                  >
                    <option value="" disabled>
                      Selecione a instituição
                    </option>
                    {institutions.map((institution) => (
                      <option key={institution}>{institution}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Perfil desejado</label>
                  <select data-testid="select-access-role">
                    {roles.slice(1).map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <Btn type="submit" testId="button-submit-access-request">
              {kind === 'request'
                ? 'Enviar solicitação'
                : 'Enviar confirmação'}{' '}
              <ArrowRight size={15} />
            </Btn>
          </form>
        )}
        <div className="auth-links">
          {kind !== 'request' && (
            <Link href="/solicitar-acesso" className="inline-link">
              Solicitar acesso
            </Link>
          )}
          {kind === 'login' && (
            <Link href="/recuperar-senha" className="inline-link">
              Esqueci minha senha
            </Link>
          )}
          {kind === 'recover' && (
            <Link href="/login" className="inline-link">
              Voltar ao login
            </Link>
          )}
        </div>
        {kind === 'login' && (
          <div
            className="notice"
            style={{ marginTop: 22, marginBottom: 0 }}
          >
            Acesso sem credenciais: o botão abre a plataforma com dados fictícios
            e controles de demonstração.
          </div>
        )}
      </div>
    </main>
  );
}
