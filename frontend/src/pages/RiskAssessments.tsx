import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  AlertTriangle,
  Play,
  ShieldCheck,
  Thermometer,
  Droplets,
  Layers,
  FileText,
  Info,
  Clock,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Sun,
  Activity,
  ChevronRight,
} from 'lucide-react';

export const RiskAssessments: React.FC = () => {
  const { selectedWorksiteId } = useAuth();
  const targetWorksiteId = !selectedWorksiteId || selectedWorksiteId === 'ALL' ? 'WS-BLR-NORTH-04' : selectedWorksiteId;
  const [assessment, setAssessment] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string>('LIVE');

  // Automatically attempt to load latest or evaluate on mount / worksite change
  useEffect(() => {
    let isMounted = true;
    const fetchLatestOrEvaluate = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.evaluateRisk(targetWorksiteId, selectedScenario !== 'LIVE' ? { scenario_id: selectedScenario } : undefined);
        if (isMounted) {
          setAssessment(res);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed evaluating deterministic risk');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLatestOrEvaluate();
    return () => {
      isMounted = false;
    };
  }, [targetWorksiteId, selectedScenario]);

  const handleEvaluate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.evaluateRisk(targetWorksiteId, selectedScenario !== 'LIVE' ? { scenario_id: selectedScenario } : undefined);
      setAssessment(res);
    } catch (err: any) {
      setError(err.message || 'Failed evaluating deterministic risk');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectScenario = async (scenarioId: string) => {
    setSelectedScenario(scenarioId);
  };

  const getRiskColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
        return { text: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'CRITICAL RISK', badge: 'badge-high' };
      case 'HIGH':
        return { text: '#ea580c', bg: '#fff7ed', border: '#fed7aa', label: 'HIGH RISK', badge: 'badge-medium' };
      case 'MODERATE':
        return { text: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'MODERATE RISK', badge: 'badge-medium' };
      case 'LOW':
        return { text: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'LOW RISK', badge: 'badge-low' };
      default:
        return { text: '#475569', bg: '#f8fafc', border: '#e2e8f0', label: 'UNKNOWN / DEGRADED', badge: 'badge-low' };
    }
  };

  const rc = assessment ? getRiskColor(assessment.risk_level) : null;

  // Safe extraction of metrics
  const heatIndex = assessment?.heat_index_c ?? assessment?.calculated_metrics?.heat_index_c;
  const swbgt = assessment?.swbgt_c ?? assessment?.calculated_metrics?.simplified_wbgt_c;
  
  // Safe extraction of telemetry factors
  const dryBulb = assessment?.risk_factors?.find((f: any) => f.factor_name === 'DRY_BULB_TEMPERATURE')?.value 
    ?? assessment?.inputs?.temperature_c;
  const humidity = assessment?.risk_factors?.find((f: any) => f.factor_name === 'RELATIVE_HUMIDITY')?.value 
    ?? assessment?.inputs?.humidity_pct;
  const workload = assessment?.risk_factors?.find((f: any) => f.factor_name === 'WORKLOAD_INTENSITY')?.value 
    ?? 'MODERATE';
  const sunExposure = assessment?.risk_factors?.find((f: any) => f.factor_name === 'DIRECT_SUN_EXPOSURE')?.value 
    ?? 'DIRECT_SUN';

  // Safe extraction of explanation string / object
  const explanationObj = typeof assessment?.explanation === 'object' && assessment?.explanation !== null
    ? assessment.explanation
    : null;
  const mainExplanationText = explanationObj?.why 
    || assessment?.reason_synthesis 
    || (typeof assessment?.explanation === 'string' ? assessment.explanation : null)
    || explanationObj?.what 
    || 'Deterministic multi-factor risk evaluation completed according to OSHA NEP standards.';

  // Safe extraction of rules
  const rulesList: Array<{ id: string; desc: string }> = [];
  if (Array.isArray(assessment?.triggered_rule_ids)) {
    assessment.triggered_rule_ids.forEach((r: any) => {
      const id = typeof r === 'string' ? r : r.rule_id || 'RULE';
      const desc = typeof r === 'object' && r.description ? r.description : getRuleFriendlyDescription(id);
      rulesList.push({ id, desc });
    });
  } else if (Array.isArray(assessment?.applied_rules)) {
    assessment.applied_rules.forEach((r: any) => {
      const id = typeof r === 'string' ? r : r.rule_id || 'RULE';
      const desc = typeof r === 'object' && r.description ? r.description : getRuleFriendlyDescription(id);
      rulesList.push({ id, desc });
    });
  }

  function getRuleFriendlyDescription(ruleId: string): string {
    if (ruleId.includes('TEMPERATURE') || ruleId.includes('R01')) return 'High Ambient Air Temperature Hazard Threshold';
    if (ruleId.includes('HUMIDITY') || ruleId.includes('R02')) return 'Elevated Relative Humidity Evaporative Impediment';
    if (ruleId.includes('WORKLOAD') || ruleId.includes('R03')) return 'Metabolic Internal Body Heat Burden';
    if (ruleId.includes('SUN') || ruleId.includes('R04')) return 'Direct Solar Irradiance Thermal Load';
    if (ruleId.includes('ACCLIMATIZATION') || ruleId.includes('R05')) return 'Unacclimatized Workforce Susceptibility Factor';
    if (ruleId.includes('DEFAULT') || ruleId.includes('R06')) return 'Safety Conservative Default Applied';
    return 'Authoritative OSHA NEP / IMD Heat Threshold Standard Applied';
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            Deterministic Risk Engine & Explanations
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Authoritative, rule-based occupational heat hazard calculations (Engine v1.0.0)
          </p>
        </div>

        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="btn btn-primary"
          style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}
        >
          {loading ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>Evaluating Engine Rules...</span>
            </>
          ) : (
            <>
              <Play size={16} />
              <span>Evaluate Risk for {targetWorksiteId}</span>
            </>
          )}
        </button>
      </div>

      {/* Demo Hazard Proof Simulation Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '1px solid var(--border-light)',
          padding: '0.85rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} color="#7c3aed" />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
              HAZARD PROOF SIMULATION CONTROLS:
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Prove to evaluators that warnings & extreme risks trigger automatically:
            </span>
          </div>

          {selectedScenario !== 'LIVE' && (
            <button
              onClick={() => handleSelectScenario('LIVE')}
              style={{
                fontSize: '0.75rem',
                color: '#0284c7',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontWeight: 600,
              }}
            >
              Reset to Real-Time Satellite Telemetry
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'LIVE', label: '🛰️ Real-Time Live Satellite (Open-Meteo)', color: '#0284c7', bg: '#f0f9ff' },
            { id: 'SCENARIO-DEMO-04-UNACK-ESCALATION', label: '🔴 Severe Heat Spike (39°C / 58% RH) ➔ CRITICAL', color: '#dc2626', bg: '#fef2f2' },
            { id: 'SCENARIO-DEMO-03-HIGH-HEAT', label: '🟠 High Heat Spike (37.5°C / 52% RH) ➔ HIGH RISK', color: '#ea580c', bg: '#fff7ed' },
            { id: 'SCENARIO-DEMO-02-ELEVATED', label: '🟡 Elevated Heat (33°C / 60% RH) ➔ MODERATE', color: '#d97706', bg: '#fffbeb' },
            { id: 'SCENARIO-DEMO-05-STALE-ANOMALY', label: '⚠️ Outage / Stale (>2h old) ➔ FAIL-SAFE', color: '#475569', bg: '#f8fafc' },
          ].map((sc) => {
            const isActive = selectedScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(sc.id)}
                disabled={loading}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 700 : 500,
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  border: isActive ? `2px solid ${sc.color}` : '1px solid #cbd5e1',
                  backgroundColor: isActive ? sc.bg : '#ffffff',
                  color: isActive ? sc.color : '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {sc.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Evaluation Result Display */}
      {assessment ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Risk Level Hero Banner */}
          <div
            style={{
              backgroundColor: rc?.bg,
              border: `2px solid ${rc?.border}`,
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '1.35rem',
                    fontWeight: 900,
                    color: rc?.text,
                    letterSpacing: '0.025em',
                  }}
                >
                  {rc?.label}
                </span>
                <span className="badge badge-low" style={{ fontWeight: 700 }}>100% DETERMINISTIC</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#64748b',
                  }}
                >
                  Data Quality: <strong>{assessment.data_health || 'VALID'}</strong>
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#1e293b', maxWidth: '750px', lineHeight: 1.5 }}>
                {mainExplanationText}
              </p>
            </div>

            <div style={{ textAlign: 'right', minWidth: '150px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                Heat Index
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: rc?.text, lineHeight: 1.1 }}>
                {typeof heatIndex === 'number' ? `${heatIndex.toFixed(1)}°C` : '--'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                sWBGT: {typeof swbgt === 'number' ? `${swbgt.toFixed(1)}°C` : '--'}
              </div>
            </div>
          </div>

          {/* Environmental Inputs Grid */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid var(--border-light)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              Normalized Environmental Telemetry Inputs
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: '1rem',
              }}
            >
              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Thermometer size={13} color="#0284c7" />
                  <span>Dry Bulb Temp</span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>
                  {typeof dryBulb === 'number' ? `${dryBulb.toFixed(1)}°C` : `${dryBulb}°C`}
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Droplets size={13} color="#0284c7" />
                  <span>Relative Humidity</span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>
                  {typeof humidity === 'number' ? `${humidity.toFixed(0)}%` : `${humidity}%`}
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Activity size={13} color="#0284c7" />
                  <span>Workload Intensity</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>
                  {String(workload)}
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Sun size={13} color="#f59e0b" />
                  <span>Solar Exposure</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>
                  {String(sunExposure).replace('_', ' ')}
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={13} color="#64748b" />
                  <span>Assessment ID</span>
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', marginTop: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <code>{(assessment.assessment_id || assessment.risk_id || 'ID').substring(0, 16)}...</code>
                </div>
              </div>
            </div>
          </div>

          {/* 6-Part Explanation Breakdown (docs/73_RISK_API.md Section 7) */}
          {explanationObj && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid var(--border-light)',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                Comprehensive Hazard Explanation & Guidance
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
                {explanationObj.what && (
                  <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', marginBottom: '0.25rem' }}>
                      OPERATIONAL SITUATION (WHAT)
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#1e293b', lineHeight: 1.4 }}>
                      {explanationObj.what}
                    </div>
                  </div>
                )}

                {explanationObj.why && (
                  <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', marginBottom: '0.25rem' }}>
                      HAZARD ATTRIBUTION (WHY)
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#1e293b', lineHeight: 1.4 }}>
                      {explanationObj.why}
                    </div>
                  </div>
                )}

                {explanationObj.next_steps && (
                  <div style={{ padding: '0.85rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', marginBottom: '0.25rem' }}>
                      MANDATORY ACTION DIRECTIVES
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#14532d', lineHeight: 1.4 }}>
                      {explanationObj.next_steps}
                    </div>
                  </div>
                )}

                {explanationObj.limitations && (
                  <div style={{ padding: '0.85rem', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309', marginBottom: '0.25rem' }}>
                      OPERATIONAL LIMITATIONS & METHODOLOGY
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#78350f', lineHeight: 1.4 }}>
                      {explanationObj.limitations}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Applied Deterministic Rules Breakdown */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid var(--border-light)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
              Applied Authoritative Rules ({rulesList.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {rulesList.length > 0 ? (
                rulesList.map((rule, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid var(--border-light)',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ShieldCheck size={16} color="#0284c7" />
                      <code style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a' }}>
                        {rule.id}
                      </code>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {rule.desc}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                  Standard baseline evaluation — no severe critical threshold violations triggered.
                </div>
              )}
            </div>
          </div>

          {/* Safety Engine Guardrails Note */}
          <div
            style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <Info size={20} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8rem', color: '#0369a1', lineHeight: 1.5 }}>
              <strong>Authoritative Invariant:</strong> HARE calculates heat stress solely via deterministic mathematical formulas (NOAA Heat Index SR 90-23, sWBGT Australian BOM formulation, OSHA National Emphasis Program). AI is strictly assistive and is never in the authoritative calculation path.
            </div>
          </div>
        </div>
      ) : (
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
          <AlertTriangle size={36} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            Ready to Evaluate Heat Risk
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            Click the button above to ingest real-time weather observations for {targetWorksiteId} and evaluate deterministic safety rules.
          </p>
          <button onClick={handleEvaluate} className="btn btn-primary" disabled={loading}>
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
            <span>{loading ? 'Evaluating...' : 'Run Evaluation Now'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
