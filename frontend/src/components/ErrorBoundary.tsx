import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[HARE ErrorBoundary] Uncaught render error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '2.5rem',
            maxWidth: '650px',
            margin: '3rem auto',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #fecaca',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <AlertTriangle size={24} color="#dc2626" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            {this.props.fallbackTitle || 'Component Render Anomaly'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            A user interface render issue occurred. Your operational data remains intact and secure.
          </p>
          {this.state.error && (
            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '0.75rem',
                color: '#dc2626',
                fontFamily: 'monospace',
                textAlign: 'left',
                marginBottom: '1.5rem',
                maxHeight: '120px',
                overflowY: 'auto',
              }}
            >
              {this.state.error.message || String(this.state.error)}
            </div>
          )}
          <button
            onClick={this.handleReset}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={16} />
            <span>Reload Application</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
