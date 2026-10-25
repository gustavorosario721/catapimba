import type { ReactNode } from 'react';
import { Link } from 'wouter';
import {
  Activity,
  Bell,
  ChartNoAxesCombined,
  CircleHelp,
  ClipboardCheck,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  PanelsTopLeft,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  UsersRound,
} from 'lucide-react';
import {
  navItems,
  type DemoMembership,
  type DemoUser,
  type Role,
} from '../demo-data';

const icons: Record<string, typeof LayoutDashboard> = {
  LayoutDashboard,
  UsersRound,
  Users,
  Lightbulb,
  PanelsTopLeft,
  ListChecks,
  ShieldCheck,
  GraduationCap,
  ClipboardCheck,
  ChartNoAxesCombined,
  FileBarChart,
  Trophy,
};

export function AuthenticatedLayout({
  children,
  role,
  institution,
  title,
  membershipId,
  setMembershipId,
  memberships,
  users,
  currentUser,
  allowed,
  roleLanding,
  onNotify,
}: {
  children: ReactNode;
  role: Role;
  institution: string;
  title: string;
  membershipId: number;
  setMembershipId: (id: number) => void;
  memberships: DemoMembership[];
  users: DemoUser[];
  currentUser: DemoUser;
  allowed: Array<(typeof navItems)[number]>;
  roleLanding: Record<Role, string>;
  onNotify: (message: string) => void;
}) {
  const currentMemberships = memberships.filter(
    (membership) => membership.status === 'Ativo',
  );

  return (
    <>
      <aside className="sidebar">
        <Link href={roleLanding[role]} style={{ textDecoration: 'none' }}>
          <div className="brand">
            <span className="brand-mark">
              <Activity size={19} />
            </span>{' '}
            elo.
          </div>
        </Link>
        <div className="workspace-label">
          {role === 'Superadministrador' ? 'PLATAFORMA' : institution}
        </div>
        <nav className="nav-list" aria-label="Navegação principal">
          {allowed.map((item) => {
            const Icon = icons[item.icon] || LayoutDashboard;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${title === item.label ? 'active' : ''}`}
                data-testid={`link-nav-${item.label
                  .toLowerCase()
                  .replaceAll(' ', '-')}`}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-note">
            <Sparkles
              size={13}
              style={{
                verticalAlign: 'middle',
                marginRight: 5,
                color: '#68d0b4',
              }}
            />
            Demonstração interativa
            <br />
            Ações ficam nesta sessão.
          </div>
          <button
            className="nav-link"
            onClick={() => onNotify('Central de ajuda demonstrativa')}
            type="button"
          >
            <CircleHelp />
            <span>Ajuda</span>
          </button>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div className="crumb">
            Elo <span style={{ margin: '0 8px', color: '#c0c9d0' }}>/</span>{' '}
            {title}
          </div>
          <div className="top-actions">
            <label className="sr-only" htmlFor="demo-membership">
              Contexto demonstrativo
            </label>
            <select
              id="demo-membership"
              data-testid="select-demo-membership"
              aria-label="Vínculo e contexto da demonstração"
              className="context-select"
              value={membershipId}
              onChange={(event) => {
                const next = memberships.find(
                  (membership) =>
                    membership.id === Number(event.target.value),
                );
                if (next) {
                  setMembershipId(next.id);
                  onNotify(
                    `Contexto: ${users.find((user) => user.id === next.userId)?.name} · ${next.role} · ${next.institution}`,
                  );
                }
              }}
            >
              {currentMemberships.map((membership) => (
                <option key={membership.id} value={membership.id}>
                  {users.find((user) => user.id === membership.userId)?.name} ·{' '}
                  {membership.role} · {membership.institution}
                </option>
              ))}
            </select>
            <button
              aria-label="Notificações"
              className="btn btn-ghost"
              style={{ padding: 8 }}
              onClick={() =>
                onNotify('Você está em dia com as notificações.')
              }
              type="button"
            >
              <Bell size={16} />
            </button>
            <div className="avatar" aria-label={currentUser.name}>
              {currentUser.name
                .split(' ')
                .map((name) => name[0])
                .slice(0, 2)
                .join('')}
            </div>
          </div>
        </header>
        {children}
      </div>
    </>
  );
}
