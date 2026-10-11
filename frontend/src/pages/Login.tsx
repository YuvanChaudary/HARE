import React, { useState } from 'react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { Flame, ShieldCheck, ArrowRight, UserCheck, Lock, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, quickLogin } = useAuth();
  const [email, setEmail] = useState('rahul@site.hare.local');
  const [password, setPassword] = useState('HareSafety#2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (role: 'SUPERVISOR' | 'SAFETY_MANAGER' | 'ADMIN') => {
    setLoading(true);
    setError(null);
    try {
      await quickLogin(role);
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Left Side: Brand & Product Value */}
        <div
          style={{
            backgroundColor: '#1e293b',
            padding: '3rem 2.5rem',
            color: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  padding: '0.6rem',
                  borderRadius: '10px',
                  display: 'flex',
                }}
              >
                <Flame size={28} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  HARE
                </h1>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Heat Action Response Engine
                </p>
              </div>
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '1rem', color: '#f1f5f9' }}>
              From heat warning to verified workplace action.
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '2rem' }}>
              An occupational heat-risk response coordination platform powered by deterministic risk assessment, human acknowledgment, missed-response escalation, and immutable audit trails.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <ShieldCheck size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                    Authoritative Determinism
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Risk rules are deterministic and transparent. AI is assistive only and never overrides safety thresholds.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <UserCheck size={20} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                    Human Operational Accountability
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Mandatory acknowledgment, blocker reporting, and human verification before safety actions are closed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #334155' }}>
            <span style={{ fontSize: '0.725rem', color: '#64748b' }}>
              Deployed on AWS Cloud (ap-southeast-2) • Hackathon Edition
            </span>
          </div>
        </div>

        {/* Right Side: Sign In & Quick Switcher */}
        <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              Operations Portal Sign In
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
              Select a persona for live demonstration or enter credentials.
            </p>
          </div>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.825rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Switcher */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Demo Personas:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleQuick('SUPERVISOR')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-light)',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a' }}>
                    Rahul Kumar
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                    Site Supervisor • Bangalore Logistics Hub
                  </div>
                </div>
                <ArrowRight size={16} color="#0284c7" />
              </button>

              <button
                type="button"
                onClick={() => handleQuick('SAFETY_MANAGER')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-light)',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a' }}>
                    Ananya Rao
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                    Regional Safety Manager • Multi-Worksite Scope
                  </div>
                </div>
                <ArrowRight size={16} color="#d97706" />
              </button>

              <button
                type="button"
                onClick={() => handleQuick('ADMIN')}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-light)',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a' }}>
                    Vikram Singh
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                    System Administrator • Enterprise Scope
                  </div>
                </div>
                <ArrowRight size={16} color="#7c3aed" />
              </button>
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              textAlign: 'center',
              margin: '1rem 0',
            }}
          >
            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0' }} />
            <span
              style={{
                position: 'absolute',
                top: '-9px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#ffffff',
                padding: '0 0.5rem',
                fontSize: '0.75rem',
                color: '#94a3b8',
              }}
            >
              or sign in with password
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.775rem', fontWeight: 600, color: '#334155' }}>
                Username / Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.85rem',
                  marginTop: '0.25rem',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.775rem', fontWeight: 600, color: '#334155' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.85rem',
                  marginTop: '0.25rem',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.65rem', marginTop: '0.5rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Operations Cockpit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
