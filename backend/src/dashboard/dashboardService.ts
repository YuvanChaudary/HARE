/**
 * Heat Action Response Engine (HARE) — Dashboard & Analytics Service
 *
 * Computes aggregated, role-scoped operational KPIs, recent activity, and safety metrics.
 */

import { ActionRecord, AuditEvent, EscalationRecord, JwtUserPayload, RiskAssessmentResult, Worksite } from '@hare/shared';
import { storage } from '../storage/localJsonDriver.js';
import { worksiteService } from '../worksite/worksiteService.js';
import { auditService } from '../audit/auditService.js';

export interface DashboardOverview {
  summary: {
    totalWorksites: number;
    worksitesAtRisk: number;
    openActionsCount: number;
    pendingAcknowledgmentCount: number;
    overdueCount: number;
    activeEscalationsCount: number;
    pendingVerificationCount: number;
    verifiedActionsCount: number;
  };
  priorityActions: ActionRecord[];
  recentActivity: AuditEvent[];
  activeWorksite?: Worksite;
  worksitesSummary: Array<{
    worksite_id: string;
    name: string;
    city: string;
    risk_level: string;
    open_actions: number;
    escalated_actions: number;
  }>;
}

export interface AnalyticsSummary {
  complianceRatePct: number;
  onTimeAcknowledgmentPct: number;
  totalActionsGenerated: number;
  totalAcknowledged: number;
  totalEscalated: number;
  totalVerified: number;
  averageAcknowledgmentMinutes: number;
  riskDistribution: {
    LOW: number;
    MODERATE: number;
    HIGH: number;
    CRITICAL: number;
  };
}

export class DashboardService {
  public async getOverview(user: JwtUserPayload): Promise<DashboardOverview> {
    const worksites = await worksiteService.listWorksites(user);
    const allActions = await storage.readCollection<ActionRecord>('actions');
    const allAssessments = await storage.readCollection<RiskAssessmentResult>('risk_assessments');
    const allEscalations = await storage.readCollection<EscalationRecord>('escalations');

    // Scope actions
    let scopedActions = allActions;
    if (user.role === 'SUPERVISOR') {
      const assigned = user.assigned_worksite_id;
      if (assigned && assigned !== 'ALL') {
        scopedActions = scopedActions.filter((a) => a.worksite_id === assigned);
      }
    }

    const now = Date.now();
    let pendingAck = 0;
    let overdue = 0;
    let openActions = 0;
    let pendingVerification = 0;
    let verified = 0;

    for (const a of scopedActions) {
      if (a.status === 'VERIFIED') {
        verified++;
      } else {
        openActions++;
        if (a.status === 'PENDING_ACKNOWLEDGMENT') {
          pendingAck++;
        }
        if (a.verification_evidence && a.status === 'IN_PROGRESS') {
          pendingVerification++;
        }
        if (new Date(a.deadline_utc).getTime() < now) {
          overdue++;
        }
      }
    }

    // Active escalations
    let activeEscalations = allEscalations.filter(
      (e) => e.state === 'TRIGGERED' || e.state === 'PENDING'
    );
    if (user.role === 'SUPERVISOR') {
      const assigned = user.assigned_worksite_id;
      if (assigned && assigned !== 'ALL') {
        activeEscalations = activeEscalations.filter((e) => e.worksite_id === assigned);
      }
    }

    // Worksites summary & risk count
    let sitesAtRisk = 0;
    const worksitesSummary = worksites.map((ws) => {
      const siteAssessments = allAssessments.filter((a) => a.worksite_id === ws.worksite_id);
      siteAssessments.sort(
        (a, b) => new Date(b.evaluated_at_utc).getTime() - new Date(a.evaluated_at_utc).getTime()
      );
      const latestRisk = siteAssessments[0]?.risk_level || 'LOW';
      if (latestRisk === 'HIGH' || latestRisk === 'CRITICAL') {
        sitesAtRisk++;
      }

      const siteOpenActions = scopedActions.filter(
        (a) => a.worksite_id === ws.worksite_id && a.status !== 'VERIFIED'
      ).length;

      const siteEscalated = scopedActions.filter(
        (a) => a.worksite_id === ws.worksite_id && a.status === 'ESCALATED'
      ).length;

      return {
        worksite_id: ws.worksite_id,
        name: ws.name,
        city: ws.location?.city || 'Unknown',
        risk_level: latestRisk,
        open_actions: siteOpenActions,
        escalated_actions: siteEscalated,
      };
    });

    // Priority action queue (P0 and P1 first, newest first)
    const priorityActions = scopedActions
      .filter((a) => a.status !== 'VERIFIED')
      .sort((a, b) => {
        const pOrder: Record<string, number> = {
          P0_CRITICAL: 1,
          CRITICAL: 1,
          P1_HIGH: 2,
          HIGH: 2,
          P2_MEDIUM: 3,
          MEDIUM: 3,
          LOW: 4,
        };
        const pa = pOrder[a.priority] || 5;
        const pb = pOrder[b.priority] || 5;
        if (pa !== pb) return pa - pb;
        return new Date(b.created_at_utc).getTime() - new Date(a.created_at_utc).getTime();
      })
      .slice(0, 8);

    const recentActivity = await auditService.listEvents(user, { limit: 10 });

    return {
      summary: {
        totalWorksites: worksites.length,
        worksitesAtRisk: sitesAtRisk,
        openActionsCount: openActions,
        pendingAcknowledgmentCount: pendingAck,
        overdueCount: overdue,
        activeEscalationsCount: activeEscalations.length,
        pendingVerificationCount: pendingVerification,
        verifiedActionsCount: verified,
      },
      priorityActions,
      recentActivity,
      activeWorksite: worksites[0],
      worksitesSummary,
    };
  }

  public async getAnalytics(user: JwtUserPayload): Promise<AnalyticsSummary> {
    const allActions = await storage.readCollection<ActionRecord>('actions');
    const allAssessments = await storage.readCollection<RiskAssessmentResult>('risk_assessments');

    let scoped = allActions;
    if (user.role === 'SUPERVISOR') {
      const assigned = user.assigned_worksite_id;
      if (assigned && assigned !== 'ALL') {
        scoped = scoped.filter((a) => a.worksite_id === assigned);
      }
    }

    const total = scoped.length;
    const acked = scoped.filter((a) => a.acknowledged_at_utc).length;
    const escalated = scoped.filter((a) => a.status === 'ESCALATED').length;
    const verified = scoped.filter((a) => a.status === 'VERIFIED').length;

    let onTimeAck = 0;
    let totalAckMinutes = 0;
    let ackCount = 0;

    for (const a of scoped) {
      if (a.acknowledged_at_utc) {
        ackCount++;
        const ackTime = new Date(a.acknowledged_at_utc).getTime();
        const createdTime = new Date(a.created_at_utc).getTime();
        const deadline = new Date(a.deadline_utc).getTime();

        const diffMinutes = Math.max(0, Math.round((ackTime - createdTime) / 60000));
        totalAckMinutes += diffMinutes;

        if (ackTime <= deadline) {
          onTimeAck++;
        }
      }
    }

    const riskDist = { LOW: 0, MODERATE: 0, HIGH: 0, CRITICAL: 0 };
    for (const r of allAssessments) {
      if (r.risk_level in riskDist) {
        riskDist[r.risk_level as keyof typeof riskDist]++;
      }
    }

    return {
      complianceRatePct: total > 0 ? Math.round(((total - escalated) / total) * 100) : 100,
      onTimeAcknowledgmentPct: ackCount > 0 ? Math.round((onTimeAck / ackCount) * 100) : 100,
      totalActionsGenerated: total,
      totalAcknowledged: acked,
      totalEscalated: escalated,
      totalVerified: verified,
      averageAcknowledgmentMinutes: ackCount > 0 ? Math.round(totalAckMinutes / ackCount) : 4,
      riskDistribution: riskDist,
    };
  }
}

export const dashboardService = new DashboardService();
