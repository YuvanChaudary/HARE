import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  FlameKindling,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Bell,
  RefreshCw,
  Send,
  User,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export const Escalations: React.FC = () => {
  const { user } = useAuth();
  const [escalations, setEscalations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEsc, setSelectedEsc] = useState<any | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [resolving, setResolving] = useState<boolean>(false);

  const loadEscalations = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.getEscalations();
      setEscalations(list);
    } catch (err: any) {
      setError(err.message || 'Failed loading escalations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEscalations();
  }, []);

  const handleResolve = async (escalationId: string) => {
    if (!resolutionNotes.trim()) {
      alert('Resolution notes are required');
      return;
    }
    setResolving(true);
    try {
      await api.resolveEscalation(escalationId, resolutionNotes);
      setResolutionNotes('');
      setSelectedEsc(null);
      await loadEscalations();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setResolving(false);
    }
  };

  const [simulating, setSimulating] = useState<boolean>(false);
  const handleSimulateBreach = async () => {
    setSimulating(true);
    try {
      await api.simulateEscalation({
        worksite_id: 'WS-BLR-NORTH-04',
        reason: 'ACKNOWLEDGMENT_SLA_BREACH',
      });
      await loadEscalations();
    } catch (err: any) {
      alert(err.message || 'Failed triggering demo breach');
    } finally {
      setSimulating(false);
    }
  };

  const activeEscalations = escalations.filter(
    (e) => e.state !== 'RESOLVED' && e.status !== 'RESOLVED'
  );
  const resolvedEscalations = escalations.filter(
    (e) => e.state === 'RESOLVED' || e.status === 'RESOLVED'
  );

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1440px', margin: '0 auto' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              Missed-Response Escalations Command
            </h2>
            {activeEscalations.length > 0 && (
              <span
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                }}
              >
                {activeEscalations.length} Active Breach(es)
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Automated SLA breach tracking triggered via AWS Step Functions state machines & Amazon SNS dispatch
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleSimulateBreach}
            disabled={simulating}
            className="btn btn-warning"
            style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <ShieldAlert size={14} />
            <span>{simulating ? 'Simulating...' : '⚡ Simulate Step Functions SLA Timeout'}</span>
          </button>

          <button onClick={loadEscalations} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Escalations</span>
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
        {/* Active Escalations List */}
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Active Breaches Requiring Intervention ({activeEscalations.length})
          </h3>

          {activeEscalations.length === 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid var(--border-light)',
                padding: '3rem 2rem',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                All Escalations Resolved
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '440px', margin: '0 auto 1.25rem' }}>
                No unacknowledged safety actions currently breaching response SLA. You can simulate an AWS Step Functions SLA timeout anytime for demonstration.
              </p>
              <button
                onClick={handleSimulateBreach}
                disabled={simulating}
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', margin: '0 auto' }}
              >
                <ShieldAlert size={14} />
                <span>Simulate Step Functions SLA Breach</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeEscalations.map((esc) => (
                <div
                  key={esc.escalation_id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #fecaca',
                    padding: '1.25rem',
                    boxShadow: 'var(--shadow-sm)',
                    borderLeft: '4px solid #dc2626',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#dc2626' }}>
                          BREACH #{esc.escalation_id?.substring(0, 12)}
                        </span>
                        <span className="badge badge-critical">{esc.reason || esc.trigger_reason || 'ACKNOWLEDGMENT_SLA_BREACH'}</span>
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
                        Worksite: {esc.worksite_id}
                      </h4>
                    </div>

                    <button
                      onClick={() => setSelectedEsc(esc)}
                      className="btn btn-danger"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      <span>Resolve Breach</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.75rem' }}>
                    Target Action: <code>{esc.action_id}</code>
                  </div>

                  {/* SNS Dispatch Evidence */}
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '6px',
                      padding: '0.65rem 0.85rem',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: '#475569',
                    }}
                  >
                    <Bell size={15} color="#ea580c" />
                    <span>
                      AWS SNS Alert: <strong>DISPATCHED</strong> to Regional Safety Mgr ({esc.escalated_to_user_id || esc.notified_role || 'usr_mgr_ananya'})
                    </span>
                    <span style={{ marginLeft: 'auto', color: '#94a3b8' }}>
                      {new Date(esc.triggered_at_utc || esc.created_at_utc || Date.now()).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Historical Resolved Escalations */}
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Historical Resolved Escalations ({resolvedEscalations.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {resolvedEscalations.map((esc) => (
                <div
                  key={esc.escalation_id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    padding: '0.85rem 1rem',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                      Action: <code>{esc.action_id}</code> ({esc.worksite_id})
                    </span>
                    <span className="badge badge-status-verified">RESOLVED</span>
                  </div>
                  <div style={{ color: '#475569', marginTop: '0.35rem' }}>
                    Resolution Notes: {esc.resolution_notes || 'Resolved by Safety Manager'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    Resolved at {new Date(esc.resolved_at_utc || esc.updated_at_utc || Date.now()).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Resolution Action Form */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--border-light)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            height: 'fit-content',
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            Safety Manager Resolution Panel
          </h3>
          <p style={{ fontSize: '0.775rem', color: '#64748b', marginBottom: '1.25rem' }}>
            Regional Safety Managers must record human intervention rationale before closing SLA breaches.
          </p>

          {selectedEsc ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                <div><strong>Selected Breach ID:</strong> <code>{selectedEsc.escalation_id}</code></div>
                <div><strong>Worksite:</strong> {selectedEsc.worksite_id}</div>
                <div><strong>Action ID:</strong> <code>{selectedEsc.action_id}</code></div>
              </div>

              <div>
                <label style={{ fontSize: '0.775rem', fontWeight: 600, color: '#334155' }}>
                  Resolution & Field Intervention Notes:
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Contacted site supervisor Rahul Kumar via radio; deployed backup hydration cooler and verified worker rotation schedule."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-medium)',
                    fontSize: '0.825rem',
                    marginTop: '0.35rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setSelectedEsc(null)}
                  className="btn btn-secondary"
                  style={{ width: '40%' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleResolve(selectedEsc.escalation_id)}
                  disabled={resolving}
                  className="btn btn-success"
                  style={{ width: '60%' }}
                >
                  <CheckCircle2 size={16} />
                  <span>{resolving ? 'Resolving...' : 'Confirm Resolution'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.825rem' }}>
              Select an active breach from the left to enter resolution notes and close the escalation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
