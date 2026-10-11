/**
 * Heat Action Response Engine (HARE) — Authoritative Domain Models & Enums
 * Master Specification matching docs/70_API_CONTRACTS.md & docs/79_ERROR_CONTRACTS.md
 */

// ============================================================================
// 1. ENUMS
// ============================================================================

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';

export type DataHealthStatus =
  | 'VALID'
  | 'STALE'
  | 'MISSING'
  | 'INVALID'
  | 'UNKNOWN'
  | 'CONFLICTING';

export type UserRole = 'ADMIN' | 'SAFETY_MANAGER' | 'SUPERVISOR';

export type WorkloadCategory = 'LIGHT' | 'MODERATE' | 'HEAVY' | 'VERY_HEAVY';

export type SunExposure = 'INDOORS' | 'FULL_SHADE' | 'PARTIAL_SHADE' | 'DIRECT_SUN';

export type ActionPriority =
  | 'P0_CRITICAL'
  | 'P1_HIGH'
  | 'P2_MEDIUM'
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

export type ActionCategory =
  | 'HYDRATION_READINESS'
  | 'SHADE_COOLING_READINESS'
  | 'SUPERVISOR_BRIEFING'
  | 'WORK_REST_PLAN_REVIEW'
  | 'TASK_RESCHEDULING_REVIEW'
  | 'WORKSITE_CHECK'
  | 'CREW_COMMUNICATION'
  | 'RISK_REASSESSMENT'
  | 'SAFETY_MANAGER_REVIEW';

export type ActionType =
  | 'ACT_HYDRATION_STAGING'
  | 'ACT_SHADE_CANOPY_DEPLOY'
  | 'ACT_MANDATORY_REST_BREAK'
  | 'ACT_WORK_REST_CYCLE_ADJUST'
  | 'ACT_TOOLBOX_TALK_HEAT'
  | 'ACT_HIGH_EXERTION_RESCHEDULE'
  | 'ACT_BUDDY_SYSTEM_ACTIVATE'
  | 'ACT_CHILLED_WATER_REFILL'
  | 'ACT_CRITICAL_EVACUATION_REVIEW'
  | 'ACT_WORKSITE_TELEMETRY_CHECK'
  | 'ACT_RISK_REASSESSMENT'
  | 'HYDRATION_READINESS'
  | 'SHADE_COOLING_READINESS'
  | 'SUPERVISOR_BRIEFING'
  | 'WORK_REST_PLAN_REVIEW'
  | 'TASK_RESCHEDULING_REVIEW'
  | 'WORKSITE_CHECK'
  | 'CREW_COMMUNICATION'
  | 'RISK_REASSESSMENT'
  | 'SAFETY_MANAGER_REVIEW';

export type ActionStatus =
  | 'PENDING_ACKNOWLEDGMENT'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'VERIFIED'
  | 'ESCALATED'
  | 'EXPIRED';

export type EscalationState =
  | 'NOT_REQUIRED'
  | 'PENDING'
  | 'TRIGGERED'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export type NotificationStatus =
  | 'CREATED'
  | 'QUEUED'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'ACKNOWLEDGED'
  | 'FAILED';

export type AuditEventType =
  | 'WEATHER_INGESTED'
  | 'RISK_EVALUATED'
  | 'ACTION_GENERATED'
  | 'ACTION_ASSIGNED'
  | 'ACTION_ACKNOWLEDGED'
  | 'ACTION_IN_PROGRESS'
  | 'ACTION_ESCALATED'
  | 'ACTION_VERIFIED'
  | 'SIMULATION_TRIGGERED'
  | 'USER_LOGIN';

// ============================================================================
// 2. METEOROLOGY & ENVIRONMENTAL MODELS
// ============================================================================

export type TelemetryType = 'OBSERVATION' | 'FORECAST' | 'SIMULATION' | 'ADVISORY' | 'DERIVED';

export interface WeatherMetrics {
  dry_bulb_temperature_c: number;
  relative_humidity_pct: number;
  apparent_temperature_c: number;
  heat_index_c?: number;
  solar_radiation_wm2?: number;
  wind_speed_kmh?: number;
  wind_speed_ms?: number;
}

export interface WeatherProvenance {
  provider: 'OPEN_METEO' | 'SIMULATION' | 'IMD_PROVISIONAL' | 'IOT_EDGE';
  station_id: string;
  observation_timestamp: string;
  retrieval_timestamp: string;
  observation_age_minutes: number;
  quality_status: DataHealthStatus;
  is_simulation: boolean;
  simulation_scenario_id?: string;
}

export interface WeatherTelemetryResponse {
  worksite_id: string;
  telemetry_type: TelemetryType;
  metrics: WeatherMetrics;
  provenance: WeatherProvenance;
}

export interface WeatherForecastPoint {
  target_timestamp: string;
  dry_bulb_temperature_c: number;
  relative_humidity_pct: number;
  apparent_temperature_c?: number;
  heat_index_c?: number;
  solar_radiation_wm2?: number;
  wind_speed_ms?: number;
  wind_speed_kmh?: number;
  wet_bulb_temp_c?: number;
  wbgt_estimated_c?: number;
  projected_risk_level?: RiskLevel;
}

export interface WeatherForecastPeriod {
  period_start_utc: string;
  period_end_utc: string;
  metrics: WeatherMetrics;
  provenance: WeatherProvenance;
}

export interface WeatherForecastResponse {
  worksite_id: string;
  telemetry_type: TelemetryType;
  model_run_timestamp: string;
  forecast_horizon_hours: number;
  forecast_series: WeatherForecastPoint[];
  periods?: WeatherForecastPeriod[];
  provenance: WeatherProvenance;
}

export interface SimulationScenario {
  scenario_id: string;
  scenario_name: string;
  description: string;
  metrics: WeatherMetrics;
  provenance_tag: string;
}

export interface WeatherSnapshot {
  worksite_id: string;
  ambient_temperature_c: number;
  relative_humidity_pct: number;
  apparent_temperature_c: number;
  solar_radiation_wm2?: number;
  wind_speed_kmh?: number;
  timestamp_utc: string;
  provenance: 'OPEN_METEO' | 'SIMULATION' | 'IMD_PROVISIONAL';
  data_health: DataHealthStatus;
  is_simulation?: boolean;
  simulation_scenario_id?: string;
}

// ============================================================================
// 3. WORKSITE & SHIFT CONTEXT MODELS
// ============================================================================

export interface WorkZone {
  zone_id: string;
  name: string;
  sun_exposure: SunExposure;
  workload_category: WorkloadCategory;
  active_crew_count: number;
  shade_available: boolean;
  water_access_distance_m: number;
}

export type WorksiteStatus = 'ACTIVE' | 'MAINTENANCE' | 'OFFLINE' | 'PAUSED' | 'DRAFT' | 'ARCHIVED';

export interface WorksiteLocation {
  city?: string;
  state?: string;
  address?: string;
  latitude: number;
  longitude: number;
  elevation_m?: number;
}

export interface WorksiteSafeguards {
  water_stations_count: number;
  shaded_rest_areas_count: number;
  active_misting_fans_count: number;
  first_aid_station_present: boolean;
  nearest_medical_facility_km?: number;
}

export interface Worksite {
  worksite_id: string;
  name: string;
  organization_id: string;
  timezone: string;
  worksite_type?: string;
  environment_type?: 'OUTDOOR' | 'INDOOR_UNCOOLED' | 'SEMI_ENCLOSED' | 'INDOOR_COOLED';
  location: WorksiteLocation;
  zones: WorkZone[];
  safeguards?: WorksiteSafeguards;
  assigned_supervisor_id: string;
  active_shift_id?: string;
  status: WorksiteStatus;
  created_at_utc?: string;
  updated_at_utc?: string;
}

export type ShiftStatus = 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type ShiftType = 'DAY_SHIFT' | 'AFTERNOON_SHIFT' | 'NIGHT_SHIFT';

export interface ShiftContext {
  shift_id: string;
  worksite_id: string;
  name: string;
  shift_type?: ShiftType;
  start_time_local: string; // e.g., "07:00"
  end_time_local: string;   // e.g., "15:30"
  peak_sun_overlap: boolean;
  workload_intensity?: WorkloadCategory;
  worker_count?: number;
  supervisor_user_id: string;
  status: ShiftStatus;
  created_at_utc?: string;
  updated_at_utc?: string;
}

export interface WorksiteDashboardResponse {
  worksite: {
    worksite_id: string;
    name: string;
    timezone: string;
    status: WorksiteStatus;
    location: WorksiteLocation;
    safeguards?: WorksiteSafeguards;
  };
  active_shift?: ShiftContext | null;
  shift_ambiguity_flag?: boolean;
  zones: WorkZone[];
  total_active_crew: number;
  weather_summary?: {
    dry_bulb_temperature_c: number;
    relative_humidity_pct: number;
    apparent_temperature_c: number;
    heat_index_c?: number;
    quality_status: DataHealthStatus;
    is_simulation: boolean;
    observation_timestamp: string;
    observation_age_minutes: number;
  } | null;
}

// ============================================================================
// 4. RISK ASSESSMENT RESULT & EXPLANATION MODELS
// ============================================================================

export type AcclimatizationContext = 'ESTABLISHED' | 'NEW_OR_RETURNING' | 'UNKNOWN';

export interface RiskFactorItem {
  factor_name: string;
  value: number | string;
  unit: string;
  weight: 'CRITICAL' | 'MAJOR' | 'MODERATE' | 'MINOR';
  contribution: string;
}

export interface RiskSourceContext {
  weather_source: string;
  source_type: TelemetryType | 'CURRENT_OBSERVATION';
  observation_timestamp: string;
  observation_age_minutes: number;
  station_id?: string;
}

export interface RiskExplanation {
  what: string;
  why: string;
  data: string;
  rule: string;
  limitations: string;
  next_steps: string;
}

export interface RiskAssessmentResult {
  assessment_id: string;
  risk_id?: string; // Alias for docs/73_RISK_API.md compatibility
  worksite_id: string;
  organization_id?: string;
  shift_id?: string;
  risk_level: RiskLevel;
  heat_index_c: number;
  swbgt_c: number;
  trigger_factors: string[];
  triggered_rule_ids: string[];
  rule_version: string;
  evaluated_at_utc: string;
  valid_until_utc: string;
  data_health: DataHealthStatus;
  is_simulation: boolean;
  source_context: RiskSourceContext;
  risk_factors: RiskFactorItem[];
  explanation: RiskExplanation;
  reason_synthesis: string;
  generated_action_ids?: string[];
}

// ============================================================================
// 5. ACTION MODELS
// ============================================================================

export interface ActionRecord {
  action_id: string;
  organization_id?: string;
  worksite_id: string;
  zone_id?: string;
  shift_id?: string;
  assessment_id: string;
  risk_id?: string; // docs/74_ACTION_API.md alias
  action_type: ActionType;
  category?: ActionCategory;
  title: string;
  description: string;
  priority: ActionPriority;
  status: ActionStatus;
  assigned_supervisor_id: string;
  owner_role?: UserRole;
  created_at_utc: string;
  deadline_utc: string;
  sla_minutes: number;
  is_required?: boolean;
  is_simulation?: boolean;
  deduplication_key?: string;
  explanation?: string;
  acknowledged_at_utc?: string;
  acknowledged_by_user_id?: string;
  supervisor_notes?: string;
  started_at_utc?: string;
  verified_at_utc?: string;
  verified_by_user_id?: string;
  verification_evidence?: {
    checklist_confirmed: boolean;
    notes?: string;
    photo_placeholder_url?: string;
  };
  escalation_record_id?: string;
  source_rule_id: string;
  rule_version: string;
}

// ============================================================================
// 6. ESCALATION & NOTIFICATION MODELS
// ============================================================================

export interface EscalationRecord {
  escalation_id: string;
  action_id: string;
  worksite_id: string;
  supervisor_id: string;
  escalated_to_user_id: string;
  reason: 'ACKNOWLEDGMENT_SLA_BREACH' | 'EXECUTION_TIMEOUT' | 'SUPERVISOR_BLOCKED';
  state: EscalationState;
  triggered_at_utc: string;
  acknowledged_at_utc?: string;
  resolved_at_utc?: string;
  resolution_notes?: string;
}

export interface NotificationEnvelope {
  notification_id: string;
  action_id: string;
  recipient_user_id: string;
  priority: ActionPriority;
  title: string;
  body: string;
  sla_deadline_utc: string;
  status: NotificationStatus;
  dispatched_at_utc: string;
  read_at_utc?: string;
}

// ============================================================================
// 7. USER & AUTH MODELS
// ============================================================================

export interface UserProfile {
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization_id: string;
  assigned_worksite_id?: string; // If 'ALL', has cross-site access
}

export interface UserRecord extends UserProfile {
  password_hash: string;
  is_active: boolean;
  created_at_utc: string;
}

export interface JwtUserPayload {
  sub: string;
  email: string;
  role: UserRole;
  org_id: string;
  assigned_worksite_id?: string;
}

export interface AuthSession {
  token: string;
  user: UserProfile;
  expires_at_utc: string;
}

// ============================================================================
// 8. AUDIT MODELS
// ============================================================================

export interface AuditEvent {
  event_id: string;
  timestamp_utc: string;
  event_type: AuditEventType;
  actor_user_id: string;
  actor_role: UserRole | 'SYSTEM';
  worksite_id: string;
  entity_id: string;
  payload_snapshot: Record<string, unknown>;
  previous_hash: string;
  current_hash: string;
}

// ============================================================================
// 9. API ENVELOPES (docs/70_API_CONTRACTS.md & docs/79_ERROR_CONTRACTS.md)
// ============================================================================

export interface ApiResponseMeta {
  request_id: string;
  timestamp: string;
  resource_version?: number;
  count?: number;
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiResponseMeta;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  request_id: string;
  correlation_id?: string;
  timestamp: string;
  retryable?: boolean;
  details?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
}
