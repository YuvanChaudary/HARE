import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertOctagon,
  FlameKindling,
  ShieldCheck,
  RefreshCw,
  Building2,
  Calendar,
  Activity,
  ArrowRight,
  UserCheck,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface OperationsDashboardProps {
  onNavigateTab: (tab: any) => void;
}

export const OperationsDashboard: React.FC<OperationsDashboardProps> = ({ onNavigateTab }) => {
  const { user, selectedWorksiteId } = useAuth();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboardOverview();
      setData(res);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message || 'Failed loading operations dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [selectedWorksiteId]);

  if (loading && !data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
        <p>Loading authoritative operational data...</p>
      </div>
    );
  }

  const summary = data?.summary || {
    totalWorksites: 0,
    worksitesAtRisk: 0,
    openActionsCount: 0,
    pendingAcknowledgmentCount: 0,
    overdueCount: 0,
    activeEscalationsCount: 0,
    pendingVerificationCount: 0,
    verifiedActionsCount: 0,
  };

  const priorityActions = data?.priorityActions || [];
  const worksitesSummary = data?.worksitesSummary || [];
  const recentActivity = data?.recentActivity || [];
  const activeWorksite = data?.activeWorksite;

  const getRiskBadge = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
        return <span className="badge badge-critical">CRITICAL RISK</span>;
      case 'HIGH':
        return <span className="badge badge-high">HIGH RISK</span>;
      case 'MODERATE':
        return <span className="badge badge-moderate">MODERATE RISK</span>;
      case 'LOW':
        return <span className="badge badge-low">LOW RISK</span>;
      default:
        return <span className="badge badge-unknown">UNKNOWN</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACKNOWLEDGED':
        return <span className="badge badge-status-ack">ACKNOWLEDGED</span>;
      case 'IN_PROGRESS':
        return <span className="badge badge-status-in_progress">IN PROGRESS</span>;
      case 'BLOCKED':
        return <span className="badge badge-status-blocked">BLOCKED</span>;
      case 'COMPLETED':
        return <span className="badge badge-status-completed">COMPLETION SUBMITTED</span>;
      case 'VERIFIED':
        return <span className="badge badge-status-verified">VERIFIED</span>;
      case 'ESCALATED':
        return <span className="badge badge-status-escalated">ESCALATED</span>;
      default:
        return <span className="badge badge-status-assigned">{status}</span>;
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Scope & Context Top Banner */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          border: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              Operations Command Cockpit
            </h2>
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 700,
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
              }}
            >
              {user?.role === 'SUPERVISOR' ? 'SUPERVISOR WORKSPACE' : 'MULTI-SITE REGIONAL COMMAND'}
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Active Worksite Scope: <strong>{activeWorksite?.name || selectedWorksiteId}</strong> • Timezone: Asia/Kolkata (IST) • Deterministic Risk Authority Engine v1.0.0
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Data Freshness</div>
            <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#16a34a' }}>
              LIVE • Last checked: {lastRefreshed || 'Just now'}
            </div>
          </div>
          <button
            onClick={loadDashboard}
            disabled={loading}
            className="btn btn-secondary"
            title="Refresh authoritative metrics"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Escalation Alert Callout if Active */}
      {summary.activeEscalationsCount > 0 && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FlameKindling size={24} color="#dc2626" />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#991b1b' }}>
                {summary.activeEscalationsCount} Active SLA Escalation Breach(es)
              </div>
              <p style={{ fontSize: '0.775rem', color: '#b91c1c' }}>
                Assigned supervisor acknowledgment deadline has expired. AWS Step Functions & SNS notifications have been triggered.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('escalations')}
            className="btn btn-danger"
            style={{ fontSize: '0.8rem' }}
          >
            <span>Resolve Breaches</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Operational KPI Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <KpiCard
          label="Worksites at Risk"
          value={summary.worksitesAtRisk}
          total={summary.totalWorksites}
          icon={<AlertTriangle size={20} color="#f97316" />}
          tone={summary.worksitesAtRisk > 0 ? 'warning' : 'neutral'}
          subtext="High or Critical risk level"
        />
        <KpiCard
          label="Open Actions"
          value={summary.openActionsCount}
          icon={<Activity size={20} color="#0284c7" />}
          tone="primary"
          subtext="Assigned, ack, or in-flight"
        />
        <KpiCard
          label="Pending Acknowledgment"
          value={summary.pendingAcknowledgmentCount}
          icon={<Clock size={20} color="#eab308" />}
          tone={summary.pendingAcknowledgmentCount > 0 ? 'warning' : 'neutral'}
          subtext="Awaiting supervisor ack"
        />
        <KpiCard
          label="Active Escalations"
          value={summary.activeEscalationsCount}
          icon={<FlameKindling size={20} color="#ef4444" />}
          tone={summary.activeEscalationsCount > 0 ? 'danger' : 'neutral'}
          subtext="SLA breach alerts"
        />
        <KpiCard
          label="Pending Verification"
          value={summary.pendingVerificationCount}
          icon={<UserCheck size={20} color="#8b5cf6" />}
          tone="neutral"
          subtext="Awaiting safety mgr review"
        />
        <KpiCard
          label="Verified Actions"
          value={summary.verifiedActionsCount}
          icon={<ShieldCheck size={20} color="#10b981" />}
          tone="success"
          subtext="Human verified & closed"
        />
      </div>

      {/* Main 2-Column Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Priority Action Queue & Worksites Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Priority Action Queue */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid var(--border-light)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  Priority Action Queue
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Critical and High priority heat responses requiring supervisor action
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('actions')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              >
                <span>View All Actions</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {priorityActions.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.85rem' }}>No pending critical or high actions in queue.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {priorityActions.map((action: any) => (
                  <div
                    key={action.action_id}
                    style={{
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: action.status === 'ESCALATED' ? '#fef2f2' : '#f8fafc',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: action.priority === 'P0_CRITICAL' ? '#dc2626' : '#d97706',
                          }}
                        >
                          [{action.priority}]
                        </span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                          {action.title}
                        </span>
                        {getStatusBadge(action.status)}
                      </div>
                      <p style={{ fontSize: '0.775rem', color: '#475569', marginBottom: '0.35rem' }}>
                        {action.description}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.725rem', color: '#64748b' }}>
                        <span>Site: <strong>{action.worksite_id}</strong></span>
                        <span>Assignee: <strong>{action.assigned_to_user_id || 'Unassigned'}</strong></span>
                        <span>Rule: <code>{action.source_rule_id}</code></span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateTab('actions')}
                      className="btn btn-primary"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', flexShrink: 0 }}
                    >
                      <span>Take Action</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Authorized Worksites Summary Table */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid var(--border-light)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  Authorized Worksites & Risk Freshness
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Continuous deterministic monitoring across managed logistics facilities
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('worksites')}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
              >
                <span>Manage Worksites</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Worksite</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>City</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Current Risk</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Open Actions</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Escalations</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {worksitesSummary.map((ws: any) => (
                  <tr key={ws.worksite_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#0f172a' }}>
                      {ws.name}
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{ws.worksite_id}</div>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#475569' }}>{ws.city}</td>
                    <td style={{ padding: '0.75rem' }}>{getRiskBadge(ws.risk_level)}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{ws.open_actions}</td>
                    <td style={{ padding: '0.75rem' }}>
                      {ws.escalated_actions > 0 ? (
                        <span style={{ color: '#dc2626', fontWeight: 700 }}>{ws.escalated_actions} active</span>
                      ) : (
                        <span style={{ color: '#16a34a' }}>0</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <button
                        onClick={() => onNavigateTab('risk')}
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                      >
                        Assess
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Recent Operational Activity / Audit Timeline */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--border-light)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Operational Activity Stream
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Live SHA-256 hash chained compliance audit events
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('audit')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            >
              <span>Full Audit</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {recentActivity.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                No audit events recorded yet.
              </div>
            ) : (
              recentActivity.map((evt: any) => (
                <div
                  key={evt.event_id}
                  style={{
                    borderLeft: '2px solid #0284c7',
                    paddingLeft: '0.75rem',
                    paddingTop: '0.15rem',
                    paddingBottom: '0.15rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                      {evt.action_type || evt.event_type}
                    </span>
                    <span style={{ fontSize: '0.675rem', color: '#94a3b8' }}>
                      {new Date(evt.timestamp_utc).toLocaleTimeString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.725rem', color: '#475569', margin: '0.2rem 0' }}>
                    Entity: <code>{evt.entity_id}</code> • Actor: <strong>{evt.actor_user_id}</strong>
                  </p>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                    Hash: <code>{evt.current_hash?.substring(0, 16)}...</code>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface KpiCardProps {
  label: string;
  value: number;
  total?: number;
  icon: React.ReactNode;
  tone: 'primary' | 'warning' | 'danger' | 'success' | 'neutral';
  subtext: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, total, icon, tone, subtext }) => {
  const getColors = () => {
    switch (tone) {
      case 'danger':
        return { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' };
      case 'warning':
        return { bg: '#fffbeb', border: '#fde68a', text: '#d97706' };
      case 'success':
        return { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' };
      case 'primary':
        return { bg: '#f0f9ff', border: '#bae6fd', text: '#0284c7' };
      default:
        return { bg: '#ffffff', border: 'var(--border-light)', text: '#0f172a' };
    }
  };

  const col = getColors();

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        border: `1px solid ${col.border}`,
        padding: '1rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.775rem', fontWeight: 600, color: '#64748b' }}>{label}</span>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: col.text, lineHeight: 1 }}>
          {value}
          {total !== undefined ? <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}> / {total}</span> : null}
        </div>
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.35rem' }}>{subtext}</div>
      </div>
    </div>
  );
};
