/**
 * Heat Action Response Engine (HARE) — Action Catalog
 *
 * Authoritative Catalog of 9 Canonical Industrial Preventive Action SOPs
 * + Data-Quality & Reassessment Directives.
 *
 * References:
 *   docs/16_ACTION_MODEL.md
 *   docs/40_ACTION_ENGINE.md
 *   docs/41_ACTION_RULES.md
 *   docs/42_SITE_SPECIFIC_ACTIONS.md
 *   docs/74_ACTION_API.md
 *   PHASE.md Task 6.1
 *
 * 100% Deterministic — Zero Generative AI Involvement
 */

import { ActionType, ActionCategory, ActionPriority, UserRole } from '@hare/shared';

export interface ActionDefinition {
  sop_code: ActionType;
  category: ActionCategory;
  title: string;
  description_template: string;
  default_priority: ActionPriority;
  sla_minutes: number;
  owner_role: UserRole;
  is_required: boolean;
  source_reference: string;
  verification_method: 'CHECKLIST_CONFIRMATION' | 'PHYSICAL_INSPECTION' | 'SUPERVISORY_ATTESTATION';
}

export const ACTION_CATALOG: Record<string, ActionDefinition> = {
  ACT_HYDRATION_STAGING: {
    sop_code: 'ACT_HYDRATION_STAGING',
    category: 'HYDRATION_READINESS',
    title: 'Stage 25L Electrolyte Cooler at Work Zone',
    description_template:
      'Stage clean potable water and electrolyte replacement solutions within 100 meters of active crew work zone. Ensure coolers are shaded and replenished.',
    default_priority: 'P1_HIGH',
    sla_minutes: 30,
    owner_role: 'SUPERVISOR',
    is_required: true,
    source_reference: 'OSHA Heat NEP 2022 / NIOSH Criteria 2016',
    verification_method: 'CHECKLIST_CONFIRMATION',
  },

  ACT_SHADE_CANOPY_DEPLOY: {
    sop_code: 'ACT_SHADE_CANOPY_DEPLOY',
    category: 'SHADE_COOLING_READINESS',
    title: 'Erect Shaded Rest Shelter with Misting Fan',
    description_template:
      'Deploy portable pop-up shade canopy with active cooling (misting fan or evaporative cooler) adjacent to active work zone.',
    default_priority: 'P1_HIGH',
    sla_minutes: 45,
    owner_role: 'SUPERVISOR',
    is_required: true,
    source_reference: 'OSHA Heat NEP 2022 / NDMA Heat Action Plan',
    verification_method: 'CHECKLIST_CONFIRMATION',
  },

  ACT_MANDATORY_REST_BREAK: {
    sop_code: 'ACT_MANDATORY_REST_BREAK',
    category: 'WORK_REST_PLAN_REVIEW',
    title: 'Enforce 15-Minute Shaded Rest Break for Crew',
    description_template:
      'Mandate immediate 15-minute shaded cessation of physical labor; enforce 500ml water consumption per worker.',
    default_priority: 'P0_CRITICAL',
    sla_minutes: 20,
    owner_role: 'SUPERVISOR',
    is_required: true,
    source_reference: 'ISO 7243:2017 / ACGIH TLV',
    verification_method: 'SUPERVISORY_ATTESTATION',
  },

  ACT_WORK_REST_CYCLE_ADJUST: {
    sop_code: 'ACT_WORK_REST_CYCLE_ADJUST',
    category: 'WORK_REST_PLAN_REVIEW',
    title: 'Implement 45m Work / 15m Rest Rotation',
    description_template:
      'Transition active shift schedule to structured 45 min work / 15 min shade rest rotation per NIOSH/OSHA criteria.',
    default_priority: 'P1_HIGH',
    sla_minutes: 30,
    owner_role: 'SUPERVISOR',
    is_required: true,
    source_reference: 'NIOSH Criteria 2016 / OSHA Heat NEP',
    verification_method: 'CHECKLIST_CONFIRMATION',
  },

  ACT_TOOLBOX_TALK_HEAT: {
    sop_code: 'ACT_TOOLBOX_TALK_HEAT',
    category: 'SUPERVISOR_BRIEFING',
    title: 'Conduct 5-Minute Heat Hazard Toolbox Briefing',
    description_template:
      'Gather crew at shift start/pause for verbal heat safety briefing on early signs of heat exhaustion and self-pacing.',
    default_priority: 'P2_MEDIUM',
    sla_minutes: 60,
    owner_role: 'SUPERVISOR',
    is_required: false,
    source_reference: 'OSHA 1926 Safety Training Guidelines',
    verification_method: 'CHECKLIST_CONFIRMATION',
  },

  ACT_HIGH_EXERTION_RESCHEDULE: {
    sop_code: 'ACT_HIGH_EXERTION_RESCHEDULE',
    category: 'TASK_RESCHEDULING_REVIEW',
    title: 'Suspend Heavy Rebar/Concrete Work; Reschedule',
    description_template:
      'Immediately halt high-metabolic exertion tasks (heavy casting, trenching); reschedule to cooler night/morning hours.',
    default_priority: 'P0_CRITICAL',
    sla_minutes: 20,
    owner_role: 'SUPERVISOR',
    is_required: true,
    source_reference: 'IMD Heat Action Plan / ISO 8996 Metabolic Ergonomics',
    verification_method: 'SUPERVISORY_ATTESTATION',
  },

  ACT_BUDDY_SYSTEM_ACTIVATE: {
    sop_code: 'ACT_BUDDY_SYSTEM_ACTIVATE',
    category: 'CREW_COMMUNICATION',
    title: 'Pair Workers into Heat Stress Buddy Check Teams',
    description_template:
      'Assign peer buddy pairs for reciprocal monitoring of dizziness, confusion, slurred speech, or cessation of sweating.',
    default_priority: 'P2_MEDIUM',
    sla_minutes: 30,
    owner_role: 'SUPERVISOR',
    is_required: true,
    source_reference: 'NIOSH Criteria 2016 / OSHA Acclimatization Guidance',
    verification_method: 'CHECKLIST_CONFIRMATION',
  },

  ACT_CHILLED_WATER_REFILL: {
    sop_code: 'ACT_CHILLED_WATER_REFILL',
    category: 'HYDRATION_READINESS',
    title: 'Replenish Clean Chilled Drinking Water Stations',
    description_template:
      'Inspect all primary water dispensers across site; restock ice and potable water to ensure uninterrupted supply.',
    default_priority: 'P1_HIGH',
    sla_minutes: 30,
    owner_role: 'SUPERVISOR',
    is_required: true,
    source_reference: 'OSHA 29 CFR 1926.51 Sanitation & Potable Water',
    verification_method: 'CHECKLIST_CONFIRMATION',
  },

  ACT_CRITICAL_EVACUATION_REVIEW: {
    sop_code: 'ACT_CRITICAL_EVACUATION_REVIEW',
    category: 'SAFETY_MANAGER_REVIEW',
    title: 'Stand By Emergency Heat Illness Response Team',
    description_template:
      'Alert site first-aid post, verify ice bath/cool pack readiness, and confirm emergency vehicle transport corridor is unobstructed.',
    default_priority: 'P0_CRITICAL',
    sla_minutes: 15,
    owner_role: 'SAFETY_MANAGER',
    is_required: true,
    source_reference: 'NDMA Heat Wave Action Guidelines / Emergency Medical Preparedness',
    verification_method: 'SUPERVISORY_ATTESTATION',
  },

  ACT_WORKSITE_TELEMETRY_CHECK: {
    sop_code: 'ACT_WORKSITE_TELEMETRY_CHECK',
    category: 'WORKSITE_CHECK',
    title: 'Conduct On-Site Physical Temperature/Humidity Verification',
    description_template:
      'Automated meteorological telemetry is missing, stale, or corrupt. Supervisor must conduct manual wet/dry bulb or hygrometer check on-site.',
    default_priority: 'P1_HIGH',
    sla_minutes: 30,
    owner_role: 'SUPERVISOR',
    is_required: true,
    source_reference: 'HARE Failsafe Protocol docs/37_DATA_FAILURES.md',
    verification_method: 'PHYSICAL_INSPECTION',
  },

  ACT_RISK_REASSESSMENT: {
    sop_code: 'ACT_RISK_REASSESSMENT',
    category: 'RISK_REASSESSMENT',
    title: 'Initiate Environmental Reassessment After Telemetry Refresh',
    description_template:
      'Trigger on-demand environmental reassessment to re-evaluate active worksite thermal conditions.',
    default_priority: 'P2_MEDIUM',
    sla_minutes: 60,
    owner_role: 'SUPERVISOR',
    is_required: false,
    source_reference: 'HARE Dynamic Assessment SLA docs/20_HEAT_RISK_ENGINE.md',
    verification_method: 'CHECKLIST_CONFIRMATION',
  },
};
