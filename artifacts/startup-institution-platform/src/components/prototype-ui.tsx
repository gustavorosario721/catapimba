import type { CSSProperties, ReactNode } from 'react';
import { Activity, Search } from 'lucide-react';

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="public-logo" style={light ? { color: '#fff' } : {}}>
      <span className="brand-mark">
        <Activity size={19} />
      </span>{' '}
      elo<span style={{ color: '#55bda1' }}>.</span>
    </span>
  );
}

export function Btn({
  children,
  onClick,
  kind = 'primary',
  type = 'button',
  testId,
}: {
  children: ReactNode;
  onClick?: () => void;
  kind?: string;
  type?: 'button' | 'submit';
  testId?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      data-testid={testId}
      className={`btn btn-${kind}`}
    >
      {children}
    </button>
  );
}

export function PageHead({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <section className={`card ${className}`} style={style}>
      {children}
    </section>
  );
}

export function Status({
  children,
  variant = '',
}: {
  children: ReactNode;
  variant?: string;
}) {
  return <span className={`status ${variant}`}>{children}</span>;
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  icon,
  foot,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  foot: string;
}) {
  return (
    <Card className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">{foot}</div>
    </Card>
  );
}

export function SearchBox({
  query,
  setQuery,
  placeholder,
}: {
  query: string;
  setQuery: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="searchbox">
      <Search />
      <input
        data-testid="input-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
