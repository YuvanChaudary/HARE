import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navigation, NavTab } from './components/Navigation';
import { Login } from './pages/Login';
import { OperationsDashboard } from './pages/OperationsDashboard';
import { Worksites } from './pages/Worksites';
import { RiskAssessments } from './pages/RiskAssessments';
import { ActionCenter } from './pages/ActionCenter';
import { Escalations } from './pages/Escalations';
import { AuditHistory } from './pages/AuditHistory';
import { Analytics } from './pages/Analytics';
import { SystemHealth } from './pages/SystemHealth';
import { api } from './api/client';
import { ShieldCheck, Flame, RefreshCw } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [activeEscalationsCount, setActiveEscalationsCount] = useState<number>(0);

  // Poll or check active escalations count periodically
  useEffect(() => {
    if (!user) return;
    const fetchEscalations = async () => {
      try {
        const escs = await api.getEscalations();
        const active = escs.filter((e: any) => e.status !== 'RESOLVED');
        setActiveEscalationsCount(active.length);
      } catch {
        // ignore background poll error
      }
    };
    fetchEscalations();
    const interval = setInterval(fetchEscalations, 15000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <Flame size={36} color="#ef4444" className="animate-spin" />
        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
          Initializing Heat Action Response Engine...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OperationsDashboard onNavigateTab={setActiveTab} />;
      case 'worksites':
        return <Worksites />;
      case 'risk':
        return <RiskAssessments />;
      case 'actions':
        return <ActionCenter />;
      case 'escalations':
        return <Escalations />;
      case 'audit':
        return <AuditHistory />;
      case 'analytics':
        return <Analytics />;
      case 'health':
        return <SystemHealth />;
      default:
        return <OperationsDashboard onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeEscalationsCount={activeEscalationsCount}
      />

      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        <ErrorBoundary fallbackTitle="View Rendering Issue">
          {renderTabContent()}
        </ErrorBoundary>
      </main>

      {/* Enterprise Operational Footer */}
      <footer
        style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid var(--border-light)',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: '#64748b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={16} color="#16a34a" />
          <span>
            <strong>HARE v1.0.0</strong> • Occupational Heat Risk Engine • Authoritative Determinism Guarantee
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>AWS Region: <strong>ap-southeast-2 (Sydney)</strong></span>
          <span>•</span>
          <span>Account: <strong>293951764497</strong></span>
          <span>•</span>
          <span>NVIDIA NIM: <strong>meta/llama-3.2-11b-vision-instruct</strong></span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Heat Action Response Engine">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
