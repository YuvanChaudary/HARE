import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Play,
  AlertOctagon,
  ShieldCheck,
  FlameKindling,
  Search,
  Filter,
  RefreshCw,
  X,
  UserCheck,
  ChevronRight,
  Send,
  AlertTriangle,
} from 'lucide-react';

export const ActionCenter: React.FC = () => {
  const { user, selectedWorksiteId } = useAuth();
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Action for Modal Details & Execution
  const [selectedAction, setSelectedAction] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionNotes, setActionNotes] = useState<string>('');
  const [blockerReason, setBlockerReason] = useState<string>('');
  const [showBlockModal, setShowBlockModal] = useState<boolean>(false);

  const loadActions = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.getActions({
        worksite_id: selectedWorksiteId,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setActions(list);
    } catch (err: any) {
      setError(err.message || 'Failed loading actions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActions();
  }, [selectedWorksiteId, statusFilter]);

  // Operational Transitions
  const handleAcknowledge = async (actionId: string) => {
    setActionLoading(true);
    try {
      await api.acknowledgeAction(actionId);
      await loadActions();
      if (selectedAction?.action_id === actionId) {
        setSelectedAction((prev: any) => ({ ...prev, status: 'ACKNOWLEDGED' }));
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async (actionId: string) => {
    setActionLoading(true);
    try {
      await api.startAction(actionId);
      await loadActions();
      if (selectedAction?.action_id === actionId) {
        setSelectedAction((prev: any) => ({ ...prev, status: 'IN_PROGRESS' }));
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = async (actionId: string) => {
    if (!blockerReason.trim()) {
      alert('Blocker reason is required');
      return;
    }
    setActionLoading(true);
    try {
      await api.blockAction(actionId, blockerReason);
      setShowBlockModal(false);
      setBlockerReason('');
      await loadActions();
      if (selectedAction?.action_id === actionId) {
        setSelectedAction((prev: any) => ({ ...prev, status: 'BLOCKED' }));
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (actionId: string) => {
    setActionLoading(true);
    try {
      await api.completeAction(actionId, actionNotes || 'Field actions executed per heat safety protocol');
      setActionNotes('');
      await loadActions();
      if (selectedAction?.action_id === actionId) {
        setSelectedAction((prev: any) => ({ ...prev, status: 'COMPLETED' }));
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async (actionId: string) => {
    setActionLoading(true);
    try {
      await api.verifyAction(actionId, actionNotes || 'Verified compliance on site');
      setActionNotes('');
      await loadActions();
      if (selectedAction?.action_id === actionId) {
        setSelectedAction((prev: any) => ({ ...prev, status: 'VERIFIED' }));
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async (actionId: string) => {
    setActionLoading(true);
    try {
      await api.escalateAction(actionId, 'Simulated acknowledgment SLA breach');
      await loadActions();
      if (selectedAction?.action_id === actionId) {
        setSelectedAction((prev: any) => ({ ...prev, status: 'ESCALATED' }));
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = actions.filter((a) => {
    if (!searchQuery) return true;
    return (
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.action_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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
            Workplace Action Center
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Deterministic safety actions assigned to worksite supervisors with SLA deadlines and human verification
          </p>
        </div>

        <button onClick={loadActions} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Actions</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid var(--border-light)',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '50%' }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search actions by title, description, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '0.85rem',
              color: '#0f172a',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <Filter size={15} color="#64748b" />
            <span style={{ fontWeight: 600, color: '#475569' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid var(--border-medium)',
                fontSize: '0.8rem',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="BLOCKED">Blocked</option>
              <option value="COMPLETED">Completion Submitted</option>
              <option value="VERIFIED">Verified</option>
              <option value="ESCALATED">Escalated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--border-light)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: '#64748b' }}>
              <th style={{ padding: '0.75rem 1rem' }}>Priority & Title</th>
              <th style={{ padding: '0.75rem 1rem' }}>Worksite</th>
              <th style={{ padding: '0.75rem 1rem' }}>Assignee</th>
              <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem' }}>Source Rule</th>
              <th style={{ padding: '0.75rem 1rem' }}>Deadline</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  No actions found matching current filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((action) => (
                <tr
                  key={action.action_id}
                  onClick={() => setSelectedAction(action)}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: action.status === 'ESCALATED' ? '#fef2f2' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (action.status !== 'ESCALATED') e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (action.status !== 'ESCALATED') e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          color: action.priority === 'P0_CRITICAL' || action.priority === 'CRITICAL' ? '#dc2626' : '#d97706',
                        }}
                      >
                        [{action.priority}]
                      </span>
                      <strong style={{ color: '#0f172a' }}>{action.title}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      ID: <code>{action.action_id}</code>
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#475569', fontWeight: 600 }}>
                    {action.worksite_id}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>
                    {action.assigned_to_user_id || action.assigned_supervisor_id || 'Rahul Kumar (Supervisor)'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {getStatusBadge(action.status)}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                    <code>{action.source_rule_id}</code>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                    {action.deadline_utc ? new Date(action.deadline_utc).toLocaleTimeString() : 'N/A'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAction(action);
                      }}
                      className="btn btn-primary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      <span>Manage</span>
                      <ChevronRight size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Action Detail & Workflow Execution Drawer / Modal */}
      {selectedAction && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 100,
          }}
        >
          <div
            style={{
              width: '560px',
              backgroundColor: '#ffffff',
              height: '100%',
              padding: '2rem',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626' }}>
                      [{selectedAction.priority}]
                    </span>
                    {getStatusBadge(selectedAction.status)}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    {selectedAction.title}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Action ID: <code>{selectedAction.action_id}</code>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAction(null)}
                  style={{ color: '#64748b', padding: '0.25rem' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Action Description */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontSize: '0.85rem',
                  color: '#334155',
                  marginBottom: '1.5rem',
                  lineHeight: 1.5,
                }}
              >
                <strong>Operational Directive:</strong>
                <p style={{ marginTop: '0.35rem' }}>{selectedAction.description}</p>
              </div>

              {/* Details Metadata Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.85rem',
                  fontSize: '0.8rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div>
                  <span style={{ color: '#64748b' }}>Worksite ID:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedAction.worksite_id}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Assigned Supervisor:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedAction.assigned_to_user_id || 'Unassigned'}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Source Assessment:</span>
                  <div><code>{selectedAction.source_assessment_id}</code></div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Authoritative Rule:</span>
                  <div><code>{selectedAction.source_rule_id}</code></div>
                </div>
              </div>

              {/* Human Operational Controls */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Operational State Transitions
                </h4>

                {/* Supervisor & Operational Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(selectedAction.status === 'PENDING_ACKNOWLEDGMENT' || selectedAction.status === 'ASSIGNED') && (
                    <button
                      onClick={() => handleAcknowledge(selectedAction.action_id)}
                      disabled={actionLoading}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.65rem' }}
                    >
                      <CheckCircle2 size={16} />
                      <span>Acknowledge Assignment (Supervisor)</span>
                    </button>
                  )}

                  {(selectedAction.status === 'ACKNOWLEDGED' || selectedAction.status === 'PENDING_ACKNOWLEDGMENT' || selectedAction.status === 'ASSIGNED') && (
                    <button
                      onClick={() => handleStart(selectedAction.action_id)}
                      disabled={actionLoading}
                      className="btn btn-secondary"
                      style={{ width: '100%', padding: '0.65rem' }}
                    >
                      <Play size={16} />
                      <span>Start Work (Mark In Progress)</span>
                    </button>
                  )}

                  {selectedAction.status !== 'VERIFIED' && selectedAction.status !== 'BLOCKED' && (
                    <button
                      onClick={() => setShowBlockModal(true)}
                      disabled={actionLoading}
                      className="btn btn-danger"
                      style={{ width: '100%', padding: '0.65rem' }}
                    >
                      <AlertOctagon size={16} />
                      <span>Report Operational Blocker</span>
                    </button>
                  )}

                  {(selectedAction.status === 'ACKNOWLEDGED' || selectedAction.status === 'IN_PROGRESS' || selectedAction.status === 'PENDING_ACKNOWLEDGMENT') && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                        Supervisor Completion Notes:
                      </label>
                      <textarea
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        placeholder="Detail hydration stations deployed, rest intervals established..."
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-medium)',
                          fontSize: '0.8rem',
                          margin: '0.35rem 0',
                        }}
                      />
                      <button
                        onClick={() => handleComplete(selectedAction.action_id)}
                        disabled={actionLoading}
                        className="btn btn-success"
                        style={{ width: '100%', padding: '0.65rem' }}
                      >
                        <Send size={16} />
                        <span>Submit Completion for Verification</span>
                      </button>
                    </div>
                  )}

                  {/* Safety Manager Verification */}
                  {selectedAction.status !== 'VERIFIED' && (
                    <div style={{ marginTop: '0.5rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#166534', marginBottom: '0.5rem' }}>
                        Safety Manager Verification Review
                      </div>
                      <textarea
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        placeholder="Enter safety manager compliance audit notes (e.g. verified cooler temp <15°C, crew accounted for)..."
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-medium)',
                          fontSize: '0.8rem',
                          marginBottom: '0.5rem',
                        }}
                      />
                      <button
                        onClick={() => handleVerify(selectedAction.action_id)}
                        disabled={actionLoading}
                        className="btn btn-success"
                        style={{ width: '100%', padding: '0.65rem' }}
                      >
                        <ShieldCheck size={16} />
                        <span>Accept Human Verification & Close</span>
                      </button>
                    </div>
                  )}

                  {/* Simulation SLA Escalation Breach Trigger */}
                  {selectedAction.status !== 'VERIFIED' && selectedAction.status !== 'ESCALATED' && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                      <button
                        onClick={() => handleEscalate(selectedAction.action_id)}
                        disabled={actionLoading}
                        className="btn btn-secondary"
                        style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem', color: '#dc2626' }}
                      >
                        <FlameKindling size={14} />
                        <span>Simulate Missed-Response Escalation Breach (Step Functions / SNS)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '1rem' }}>
              <button
                onClick={() => setSelectedAction(null)}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blocker Modal */}
      {showBlockModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 150,
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '1.75rem',
              width: '440px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991b1b', marginBottom: '0.5rem' }}>
              Report Operational Blocker
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
              State reason why heat safety action cannot be executed immediately (e.g. water supply shortage, equipment fault).
            </p>
            <textarea
              value={blockerReason}
              onChange={(e) => setBlockerReason(e.target.value)}
              placeholder="Enter specific operational impediment..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '6px',
                border: '1px solid var(--border-medium)',
                fontSize: '0.85rem',
                marginBottom: '1rem',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setShowBlockModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => selectedAction && handleBlock(selectedAction.action_id)}
                className="btn btn-danger"
              >
                Confirm Blocker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
