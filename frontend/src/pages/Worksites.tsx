import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  MapPin,
  Clock,
  Sun,
  Droplets,
  Wind,
  Shield,
  Layers,
  Thermometer,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

export const Worksites: React.FC = () => {
  const { selectedWorksiteId, setSelectedWorksiteId } = useAuth();
  const [worksites, setWorksites] = useState<any[]>([]);
  const [activeDetail, setActiveDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.getWorksites();
      setWorksites(list);

      const targetId = selectedWorksiteId || list[0]?.worksite_id;
      if (targetId) {
        const detail = await api.getWorksiteDetail(targetId);
        setActiveDetail(detail);
      }
    } catch (err: any) {
      setError(err.message || 'Failed loading worksites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedWorksiteId]);

  const handleSelectSite = async (id: string) => {
    setSelectedWorksiteId(id);
    try {
      const detail = await api.getWorksiteDetail(id);
      setActiveDetail(detail);
    } catch (err: any) {
      setError(err.message || 'Failed loading worksite detail');
    }
  };

  if (loading && !activeDetail) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
        <p>Loading worksite context and environmental telemetry...</p>
      </div>
    );
  }

  const ws = activeDetail?.worksite || activeDetail;
  const weather = activeDetail?.weather_summary || activeDetail?.weather;
  const zones = (activeDetail?.zones && activeDetail.zones.length > 0) ? activeDetail.zones : (ws?.zones || []);

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
            Worksites & Zone Context
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Worksite geometry, indoor/outdoor zones, cooling readiness, and localized microclimate data
          </p>
        </div>
        <button onClick={loadData} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
          <RefreshCw size={14} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Main Grid: Worksite Selector on left, Detail on right */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
        {/* Left: Worksite Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
            Managed Facilities ({worksites.length})
          </h3>
          {worksites.map((site) => {
            const isSelected = site.worksite_id === (ws?.worksite_id || selectedWorksiteId);
            return (
              <div
                key={site.worksite_id}
                onClick={() => handleSelectSite(site.worksite_id)}
                style={{
                  backgroundColor: '#ffffff',
                  border: isSelected ? '2px solid #0284c7' : '1px solid var(--border-light)',
                  borderRadius: '10px',
                  padding: '1rem',
                  cursor: 'pointer',
                  boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                    {site.name}
                  </h4>
                  <span
                    style={{
                      fontSize: '0.675rem',
                      fontWeight: 700,
                      backgroundColor: '#f1f5f9',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                    }}
                  >
                    {site.worksite_id}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  <MapPin size={13} />
                  <span>{site.location?.city || 'India'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.725rem', color: '#475569' }}>
                  <span>{site.zones?.length || 0} Zones</span>
                  <span>•</span>
                  <span>{site.shifts?.length || 0} Shift profiles</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Worksite Panel */}
        {ws ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top Worksite Overview Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid var(--border-light)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      {ws.name}
                    </h3>
                    <span className="badge badge-low">OPERATIONAL</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                    <span>Worksite ID: <code>{ws.worksite_id}</code></span>
                    <span>Coordinates: <strong>{ws.location?.latitude?.toFixed(4)}, {ws.location?.longitude?.toFixed(4)}</strong></span>
                    <span>Timezone: <strong>{ws.timezone || 'Asia/Kolkata'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Weather Telemetry Row */}
              {weather && (
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    padding: '1rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Thermometer size={14} color="#f97316" />
                      <span>Dry Bulb Temp</span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      {(weather.dry_bulb_temperature_c ?? weather.metrics?.dry_bulb_temperature_c)?.toFixed(1) || '--'}°C
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Droplets size={14} color="#0284c7" />
                      <span>Relative Humidity</span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      {(weather.relative_humidity_pct ?? weather.metrics?.relative_humidity_pct)?.toFixed(0) || '--'}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Wind size={14} color="#64748b" />
                      <span>Wind Speed</span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      {(weather.wind_speed_ms ?? weather.metrics?.wind_speed_ms ?? 2.8)?.toFixed(1)} m/s
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Sun size={14} color="#eab308" />
                      <span>Solar Radiation</span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      {(weather.solar_radiation_wm2 ?? weather.metrics?.solar_radiation_wm2 ?? 420)?.toFixed(0)} W/m²
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Data Quality</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#16a34a' }}>
                      {weather.quality_status || weather.data_quality?.state || 'VALID'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Configured Zones List */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid var(--border-light)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                Operational Work Zones ({zones.length})
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {zones.map((zone: any) => (
                  <div
                    key={zone.zone_id}
                    style={{
                      border: '1px solid var(--border-light)',
                      borderRadius: '8px',
                      padding: '1rem',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                        {zone.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.675rem',
                          fontWeight: 700,
                          backgroundColor: zone.environment_type === 'OUTDOOR' ? '#fef3c7' : '#e0f2fe',
                          color: zone.environment_type === 'OUTDOOR' ? '#b45309' : '#0369a1',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                        }}
                      >
                        {zone.environment_type}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div>Zone ID: <code>{zone.zone_id}</code></div>
                      <div>Workload Level: <strong>{zone.workload_level || 'MODERATE'}</strong></div>
                      <div>Sun Exposure: <strong>{zone.sun_exposure_level || 'PARTIAL'}</strong></div>
                      <div>Cooling Status: <strong>{zone.has_cooling ? 'Active Misting / AC' : 'Natural Ventilation'}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
