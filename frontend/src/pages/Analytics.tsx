import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import {
  BarChart3,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Info,
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAnalytics();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed loading analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading && !data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
        <p>Calculating operational heat response analytics...</p>
      </div>
    );
  }

  const riskDist = data?.riskDistribution || { LOW: 0, MODERATE: 0, HIGH: 0, CRITICAL: 0 };
  const totalAssessments = (riskDist.LOW || 0) + (riskDist.MODERATE || 0) + (riskDist.HIGH || 0) + (riskDist.CRITICAL || 0) || 1;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            Operational Heat-Safety Analytics
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Evidence-based metrics tracking response timeliness, protocol acknowledgment, and verification closure
          </p>
        </div>

        <button onClick={loadAnalytics} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Main Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <MetricCard
          label="Operational Compliance Rate"
          value={`${data?.complianceRatePct || 0}%`}
          subtext="Actions completed & human-verified"
          tone="success"
        />
        <MetricCard
          label="Escalation Breach Rate"
          value={`${data?.escalationRatePct || 0}%`}
          subtext="Actions breaching acknowledgment SLA"
          tone={data?.escalationRatePct > 0 ? 'danger' : 'neutral'}
        />
        <MetricCard
          label="Avg Acknowledgment Latency"
          value={`${data?.avgAcknowledgmentMinutes || 0} min`}
          subtext="From assignment to supervisor ack"
          tone="primary"
        />
        <MetricCard
          label="Total Managed Actions"
          value={data?.totalActionsCount || 0}
          subtext="Authoritative actions tracked"
          tone="neutral"
        />
      </div>

      {/* Risk Distribution Breakdown */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--border-light)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.5rem',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
          Deterministic Heat-Risk Assessment Distribution
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <RiskBar
            label="CRITICAL RISK"
            count={riskDist.CRITICAL || 0}
            pct={Math.round(((riskDist.CRITICAL || 0) / totalAssessments) * 100)}
            color="#ef4444"
          />
          <RiskBar
            label="HIGH RISK"
            count={riskDist.HIGH || 0}
            pct={Math.round(((riskDist.HIGH || 0) / totalAssessments) * 100)}
            color="#f97316"
          />
          <RiskBar
            label="MODERATE RISK"
            count={riskDist.MODERATE || 0}
            pct={Math.round(((riskDist.MODERATE || 0) / totalAssessments) * 100)}
            color="#f59e0b"
          />
          <RiskBar
            label="LOW RISK"
            count={riskDist.LOW || 0}
            pct={Math.round(((riskDist.LOW || 0) / totalAssessments) * 100)}
            color="#10b981"
          />
        </div>
      </div>

      {/* Scientific Regulatory Limitation Callout */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid var(--border-light)',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          fontSize: '0.8rem',
          color: '#64748b',
          lineHeight: 1.5,
        }}
      >
        <Info size={18} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Operational Accountability Disclaimer:</strong> These metrics quantify supervisor and safety manager adherence to workplace heat procedures (acknowledgment timeliness, blocker reporting, and verification). They are administrative metrics and do not constitute individual medical physiological determinations.
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext: string;
  tone: 'primary' | 'success' | 'danger' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, subtext, tone }) => {
  const getCol = () => {
    switch (tone) {
      case 'success':
        return '#16a34a';
      case 'danger':
        return '#dc2626';
      case 'primary':
        return '#0284c7';
      default:
        return '#0f172a';
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        border: '1px solid var(--border-light)',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ fontSize: '0.775rem', fontWeight: 600, color: '#64748b' }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: getCol(), margin: '0.35rem 0' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.725rem', color: '#94a3b8' }}>{subtext}</div>
    </div>
  );
};

const RiskBar: React.FC<{ label: string; count: number; pct: number; color: string }> = ({
  label,
  count,
  pct,
  color,
}) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
        <span style={{ fontWeight: 700, color: '#334155' }}>{label}</span>
        <span style={{ color: '#64748b' }}>{count} assessments ({pct}%)</span>
      </div>
      <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '4px' }} />
      </div>
    </div>
  );
};
