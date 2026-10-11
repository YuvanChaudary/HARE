import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  LayoutDashboard,
  Building2,
  AlertTriangle,
  ClipboardList,
  FlameKindling,
  ShieldCheck,
  BarChart3,
  Activity,
  LogOut,
  User,
  MapPin,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'worksites'
  | 'risk'
  | 'actions'
  | 'escalations'
  | 'audit'
  | 'analytics'
  | 'health';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeEscalationsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  activeEscalationsCount = 0,
}) => {
  const { user, logout, selectedWorksiteId, setSelectedWorksiteId } = useAuth();

  const worksiteOptions = [
    { id: 'WS-BLR-NORTH-04', label: 'Bangalore Logistics Hub (WS-BLR-NORTH-04)' },
    { id: 'WS-CHN-PORT-02', label: 'Chennai Port Container Terminal (WS-CHN-PORT-02)' },
    { id: 'WS-DEL-AIR-01', label: 'Delhi Air Cargo T3 (WS-DEL-AIR-01)' },
  ];

  const roleBadge = (role: string) => {
    switch (role) {
      case 'SUPERVISOR':
        return { label: 'Site Supervisor', bg: '#e0f2fe', text: '#0369a1' };
      case 'SAFETY_MANAGER':
        return { label: 'Regional Safety Mgr', bg: '#fef3c7', text: '#b45309' };
      case 'ADMIN':
        return { label: 'System Admin', bg: '#ede9fe', text: '#6d28d9' };
      default:
        return { label: role, bg: '#f1f5f9', text: '#475569' };
    }
  };

  const badge = user ? roleBadge(user.role) : { label: 'Guest', bg: '#f1f5f9', text: '#475569' };

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-light)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Flame size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                HARE
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                }}
              >
                AWS CLOUD
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Heat Action Response Engine • Operational Safety Cockpit
            </p>
          </div>
        </div>

        {/* Center: Worksite Context Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#f8fafc',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--border-light)',
            }}
          >
            <MapPin size={16} color="#0284c7" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Scope:</span>
            <select
              value={selectedWorksiteId}
              onChange={(e) => setSelectedWorksiteId(e.target.value)}
              disabled={user?.role === 'SUPERVISOR'}
              style={{
                fontSize: '0.825rem',
                fontWeight: 600,
                color: '#0f172a',
                border: 'none',
                background: 'transparent',
                cursor: user?.role === 'SUPERVISOR' ? 'not-allowed' : 'pointer',
                outline: 'none',
              }}
            >
              {worksiteOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: User Profile & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#334155',
              }}
            >
              <User size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a' }}>
                  {user?.name || user?.email?.split('@')[0] || 'User'}
                </span>
                <span
                  style={{
                    fontSize: '0.675rem',
                    fontWeight: 700,
                    backgroundColor: badge.bg,
                    color: badge.text,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                  }}
                >
                  {badge.label}
                </span>
              </div>
              <span style={{ fontSize: '0.725rem', color: '#64748b' }}>{user?.email}</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
            title="Sign out"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 1.5rem',
          backgroundColor: '#ffffff',
          overflowX: 'auto',
        }}
      >
        <NavButton
          active={activeTab === 'overview'}
          onClick={() => onSelectTab('overview')}
          icon={<LayoutDashboard size={16} />}
          label="Operations Dashboard"
        />
        <NavButton
          active={activeTab === 'worksites'}
          onClick={() => onSelectTab('worksites')}
          icon={<Building2 size={16} />}
          label="Worksites & Zones"
        />
        <NavButton
          active={activeTab === 'risk'}
          onClick={() => onSelectTab('risk')}
          icon={<AlertTriangle size={16} />}
          label="Risk Assessments"
        />
        <NavButton
          active={activeTab === 'actions'}
          onClick={() => onSelectTab('actions')}
          icon={<ClipboardList size={16} />}
          label="Action Center"
        />
        <NavButton
          active={activeTab === 'escalations'}
          onClick={() => onSelectTab('escalations')}
          icon={<FlameKindling size={16} />}
          label="Escalations"
          badgeCount={activeEscalationsCount}
        />
        <NavButton
          active={activeTab === 'audit'}
          onClick={() => onSelectTab('audit')}
          icon={<ShieldCheck size={16} />}
          label="Audit History"
        />
        <NavButton
          active={activeTab === 'analytics'}
          onClick={() => onSelectTab('analytics')}
          icon={<BarChart3 size={16} />}
          label="Analytics"
        />
        <NavButton
          active={activeTab === 'health'}
          onClick={() => onSelectTab('health')}
          icon={<Activity size={16} />}
          label="System Health"
        />
      </nav>
    </header>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badgeCount?: number;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label, badgeCount }) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.45rem 0.75rem',
        borderRadius: '6px',
        fontSize: '0.825rem',
        fontWeight: active ? 700 : 500,
        color: active ? '#0284c7' : '#475569',
        backgroundColor: active ? '#f0f9ff' : 'transparent',
        border: active ? '1px solid #bae6fd' : '1px solid transparent',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      <span>{label}</span>
      {badgeCount && badgeCount > 0 ? (
        <span
          style={{
            backgroundColor: '#ef4444',
            color: '#ffffff',
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '0.1rem 0.4rem',
            borderRadius: '9999px',
            lineHeight: 1,
          }}
        >
          {badgeCount}
        </span>
      ) : null}
    </button>
  );
};
