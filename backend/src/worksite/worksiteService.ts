import {
  Worksite,
  WorkZone,
  WorksiteStatus,
  ShiftContext,
  ShiftStatus,
  WorksiteDashboardResponse,
  JwtUserPayload,
} from '@hare/shared';
import { storage } from '../storage/localJsonDriver.js';
import { weatherService } from '../weather/weatherService.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Parses "HH:mm" time string into total minutes from midnight.
 */
export function parseMinutes(timeStr: string): number {
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) {
    throw new AppError('VALIDATION_ERROR', `Invalid time format '${timeStr}'. Expected 'HH:mm'`, 400);
  }
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    throw new AppError('VALIDATION_ERROR', `Time '${timeStr}' is out of range [00:00 - 23:59]`, 400);
  }
  return h * 60 + m;
}

/**
 * Determines whether a given time in minutes falls within a shift interval,
 * correctly handling shifts that cross midnight.
 */
export function isTimeInInterval(timeMinutes: number, startMinutes: number, endMinutes: number): boolean {
  if (startMinutes <= endMinutes) {
    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
  }
  // Overnight shift: e.g., 22:00 to 06:00
  return timeMinutes >= startMinutes || timeMinutes < endMinutes;
}

/**
 * Calculates whether a shift interval overlaps with the peak solar window (11:00 to 15:00).
 * Reference: docs/15_WORKER_SHIFT_MODEL.md
 */
export function calculatePeakSunOverlap(startTimeLocal: string, endTimeLocal: string): boolean {
  const peakStart = 11 * 60; // 11:00
  const peakEnd = 15 * 60;   // 15:00

  const shiftStart = parseMinutes(startTimeLocal);
  const shiftEnd = parseMinutes(endTimeLocal);

  if (shiftStart <= shiftEnd) {
    return Math.max(shiftStart, peakStart) < Math.min(shiftEnd, peakEnd);
  }
  // Overnight shift crossing midnight
  return shiftEnd > peakStart || shiftStart < peakEnd;
}

/**
 * Converts a Date object into local minutes from midnight in the target IANA timezone.
 */
export function getLocalMinutes(date: Date, timezone: string): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const h = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const m = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    return (h === 24 ? 0 : h) * 60 + m;
  } catch {
    // Fallback if timezone is invalid
    return date.getUTCHours() * 60 + date.getUTCMinutes();
  }
}

export class WorksiteService {
  private worksiteCollection = 'worksites';
  private shiftCollection = 'shifts';

  /**
   * Retrieves all worksites accessible to the caller within their tenant organization.
   * Supervisors are strictly confined to their assigned worksite.
   */
  public async listWorksites(
    user: JwtUserPayload,
    statusFilter?: WorksiteStatus
  ): Promise<Worksite[]> {
    const allWorksites = await storage.readCollection<Worksite>(this.worksiteCollection);

    // Multi-tenant boundary
    let orgWorksites = allWorksites.filter((w) => w.organization_id === user.org_id);

    // Supervisor confinement
    if (user.role === 'SUPERVISOR' && user.assigned_worksite_id !== 'ALL') {
      orgWorksites = orgWorksites.filter((w) => w.worksite_id === user.assigned_worksite_id);
    }

    if (statusFilter) {
      orgWorksites = orgWorksites.filter((w) => w.status === statusFilter);
    }

    return orgWorksites;
  }

  /**
   * Retrieves a single worksite by ID, enforcing tenant boundaries and supervisor scoping.
   */
  public async getWorksiteById(worksiteId: string, user: JwtUserPayload): Promise<Worksite> {
    const allWorksites = await storage.readCollection<Worksite>(this.worksiteCollection);
    const worksite = allWorksites.find((w) => w.worksite_id === worksiteId);

    if (!worksite) {
      throw new AppError('WORKSITE_NOT_FOUND', `Worksite '${worksiteId}' not found.`, 404);
    }

    if (worksite.organization_id !== user.org_id) {
      throw new AppError(
        'AUTHORIZATION_DENIED',
        'Forbidden: Cross-tenant data access is strictly prohibited.',
        403
      );
    }

    if (user.role === 'SUPERVISOR' && user.assigned_worksite_id !== 'ALL') {
      if (worksite.worksite_id !== user.assigned_worksite_id) {
        throw new AppError(
          'RESOURCE_ACCESS_DENIED',
          `Forbidden: You are assigned to worksite '${user.assigned_worksite_id}' and cannot access '${worksiteId}'.`,
          403
        );
      }
    }

    return worksite;
  }

  /**
   * Provisions a new worksite (Administrator only).
   */
  public async createWorksite(user: JwtUserPayload, payload: Partial<Worksite>): Promise<Worksite> {
    if (!payload.name || typeof payload.name !== 'string' || !payload.name.trim()) {
      throw new AppError('VALIDATION_ERROR', 'Worksite name is required.', 400);
    }

    if (!payload.location || typeof payload.location.latitude !== 'number' || typeof payload.location.longitude !== 'number') {
      throw new AppError('VALIDATION_ERROR', 'Worksite location requires numeric latitude and longitude.', 400);
    }

    const { latitude, longitude } = payload.location;
    if (latitude < -90.0 || latitude > 90.0 || longitude < -180.0 || longitude > 180.0) {
      throw new AppError(
        'INVALID_COORDINATES',
        `Coordinates [${latitude}, ${longitude}] are outside valid geographic bounds [-90..90, -180..180].`,
        422
      );
    }

    const allWorksites = await storage.readCollection<Worksite>(this.worksiteCollection);
    const worksiteId = payload.worksite_id?.trim() || `WS-${Date.now().toString(36).toUpperCase()}`;

    if (allWorksites.some((w) => w.worksite_id === worksiteId)) {
      throw new AppError('VALIDATION_ERROR', `Worksite with ID '${worksiteId}' already exists.`, 409);
    }

    const newWorksite: Worksite = {
      worksite_id: worksiteId,
      name: payload.name.trim(),
      organization_id: user.org_id, // Authoritative tenant binding
      timezone: payload.timezone || 'Asia/Kolkata',
      worksite_type: payload.worksite_type || 'CONSTRUCTION',
      environment_type: payload.environment_type || 'OUTDOOR',
      location: {
        city: payload.location.city || 'Bengaluru',
        state: payload.location.state || 'Karnataka',
        address: payload.location.address || '',
        latitude,
        longitude,
        elevation_m: payload.location.elevation_m ?? 900.0,
      },
      zones: payload.zones || [],
      safeguards: payload.safeguards || {
        water_stations_count: 2,
        shaded_rest_areas_count: 1,
        active_misting_fans_count: 0,
        first_aid_station_present: true,
      },
      assigned_supervisor_id: payload.assigned_supervisor_id || user.sub,
      status: payload.status || 'ACTIVE',
      created_at_utc: new Date().toISOString(),
      updated_at_utc: new Date().toISOString(),
    };

    allWorksites.push(newWorksite);
    await storage.writeCollection(this.worksiteCollection, allWorksites);

    return newWorksite;
  }

  /**
   * Updates an existing worksite (Safety Manager or Administrator).
   */
  public async updateWorksite(
    worksiteId: string,
    user: JwtUserPayload,
    updates: Partial<Worksite>
  ): Promise<Worksite> {
    const worksite = await this.getWorksiteById(worksiteId, user);
    const allWorksites = await storage.readCollection<Worksite>(this.worksiteCollection);
    const idx = allWorksites.findIndex((w) => w.worksite_id === worksiteId);

    // Validate coordinates if updated
    if (updates.location) {
      const lat = updates.location.latitude ?? worksite.location.latitude;
      const lon = updates.location.longitude ?? worksite.location.longitude;
      if (lat < -90.0 || lat > 90.0 || lon < -180.0 || lon > 180.0) {
        throw new AppError(
          'INVALID_COORDINATES',
          `Coordinates [${lat}, ${lon}] are outside valid bounds.`,
          422
        );
      }
    }

    const updatedWorksite: Worksite = {
      ...worksite,
      ...updates,
      worksite_id: worksite.worksite_id, // Immutable
      organization_id: worksite.organization_id, // Immutable
      updated_at_utc: new Date().toISOString(),
    };

    allWorksites[idx] = updatedWorksite;
    await storage.writeCollection(this.worksiteCollection, allWorksites);

    return updatedWorksite;
  }

  /**
   * Updates dynamic operational parameters of a specific work zone (Task 4.5).
   * Authorized for Supervisor (assigned site) and Safety Manager / Admin.
   */
  public async updateWorkZone(
    worksiteId: string,
    zoneId: string,
    user: JwtUserPayload,
    updates: Partial<WorkZone>
  ): Promise<Worksite> {
    const worksite = await this.getWorksiteById(worksiteId, user);
    const zoneIndex = worksite.zones.findIndex((z) => z.zone_id === zoneId);

    if (zoneIndex === -1) {
      throw new AppError('ZONE_NOT_FOUND', `Zone '${zoneId}' not found in worksite '${worksiteId}'.`, 404);
    }

    const existingZone = worksite.zones[zoneIndex];

    if (updates.active_crew_count !== undefined && updates.active_crew_count < 0) {
      throw new AppError('VALIDATION_ERROR', 'Active crew count cannot be negative.', 400);
    }

    if (updates.water_access_distance_m !== undefined && updates.water_access_distance_m < 0) {
      throw new AppError('VALIDATION_ERROR', 'Water access distance cannot be negative.', 400);
    }

    const updatedZone: WorkZone = {
      ...existingZone,
      ...updates,
      zone_id: existingZone.zone_id, // Immutable
    };

    worksite.zones[zoneIndex] = updatedZone;
    worksite.updated_at_utc = new Date().toISOString();

    const allWorksites = await storage.readCollection<Worksite>(this.worksiteCollection);
    const worksiteIdx = allWorksites.findIndex((w) => w.worksite_id === worksiteId);
    allWorksites[worksiteIdx] = worksite;
    await storage.writeCollection(this.worksiteCollection, allWorksites);

    return worksite;
  }

  /**
   * Lists shifts scheduled or active for a specific worksite.
   */
  public async listShifts(
    worksiteId: string,
    user: JwtUserPayload,
    statusFilter?: ShiftStatus
  ): Promise<ShiftContext[]> {
    await this.getWorksiteById(worksiteId, user);

    const allShifts = await storage.readCollection<ShiftContext>(this.shiftCollection);
    let siteShifts = allShifts.filter((s) => s.worksite_id === worksiteId);

    if (statusFilter) {
      siteShifts = siteShifts.filter((s) => s.status === statusFilter);
    }

    return siteShifts;
  }

  /**
   * Creates a new operational shift roster for a worksite.
   */
  public async createShift(
    worksiteId: string,
    user: JwtUserPayload,
    payload: Partial<ShiftContext>
  ): Promise<ShiftContext> {
    const worksite = await this.getWorksiteById(worksiteId, user);

    if (!payload.start_time_local || !payload.end_time_local) {
      throw new AppError('VALIDATION_ERROR', 'Shift requires start_time_local and end_time_local.', 400);
    }

    const startMinutes = parseMinutes(payload.start_time_local);
    const endMinutes = parseMinutes(payload.end_time_local);
    const peakOverlap = calculatePeakSunOverlap(payload.start_time_local, payload.end_time_local);

    const allShifts = await storage.readCollection<ShiftContext>(this.shiftCollection);
    const shiftId = payload.shift_id?.trim() || `SHIFT-${Date.now().toString(36).toUpperCase()}`;

    const newShift: ShiftContext = {
      shift_id: shiftId,
      worksite_id: worksite.worksite_id,
      name: payload.name?.trim() || 'General Operational Shift',
      shift_type: payload.shift_type || 'DAY_SHIFT',
      start_time_local: payload.start_time_local,
      end_time_local: payload.end_time_local,
      peak_sun_overlap: peakOverlap,
      workload_intensity: payload.workload_intensity || 'MODERATE',
      worker_count: payload.worker_count ?? 10,
      supervisor_user_id: payload.supervisor_user_id || worksite.assigned_supervisor_id,
      status: payload.status || 'SCHEDULED',
      created_at_utc: new Date().toISOString(),
      updated_at_utc: new Date().toISOString(),
    };

    allShifts.push(newShift);
    await storage.writeCollection(this.shiftCollection, allShifts);

    return newShift;
  }

  /**
   * Resolves the active shift for a worksite given a reference timestamp.
   * Explicitly detects and flags multi-shift ambiguities.
   */
  public async resolveActiveShift(
    worksite: Worksite,
    referenceDate = new Date()
  ): Promise<{ activeShift: ShiftContext | null; isAmbiguous: boolean; matchingCount: number }> {
    const allShifts = await storage.readCollection<ShiftContext>(this.shiftCollection);
    const candidateShifts = allShifts.filter(
      (s) => s.worksite_id === worksite.worksite_id && (s.status === 'ACTIVE' || s.status === 'SCHEDULED')
    );

    const localMinutes = getLocalMinutes(referenceDate, worksite.timezone);

    const activeMatches = candidateShifts.filter((shift) => {
      const startMin = parseMinutes(shift.start_time_local);
      const endMin = parseMinutes(shift.end_time_local);
      return isTimeInInterval(localMinutes, startMin, endMin);
    });

    if (activeMatches.length === 1) {
      return { activeShift: activeMatches[0], isAmbiguous: false, matchingCount: 1 };
    }

    if (activeMatches.length > 1) {
      // Step 3 requirement: Do not silently choose an arbitrary shift when multiple shifts match!
      return { activeShift: null, isAmbiguous: true, matchingCount: activeMatches.length };
    }

    // No active shift currently matching
    return { activeShift: null, isAmbiguous: false, matchingCount: 0 };
  }

  /**
   * Aggregated operational dashboard snapshot (docs/72_WORKSITE_API.md section 4.6).
   */
  public async getWorksiteDashboard(
    worksiteId: string,
    user: JwtUserPayload
  ): Promise<WorksiteDashboardResponse> {
    const worksite = await this.getWorksiteById(worksiteId, user);
    const { activeShift, isAmbiguous } = await this.resolveActiveShift(worksite);

    let weatherSummary: WorksiteDashboardResponse['weather_summary'] = null;
    try {
      const weather = await weatherService.getCurrentWeather(worksiteId, user.org_id);
      weatherSummary = {
        dry_bulb_temperature_c: weather.metrics.dry_bulb_temperature_c,
        relative_humidity_pct: weather.metrics.relative_humidity_pct,
        apparent_temperature_c: weather.metrics.apparent_temperature_c,
        heat_index_c: weather.metrics.heat_index_c,
        quality_status: weather.provenance.quality_status,
        is_simulation: weather.provenance.is_simulation,
        observation_timestamp: weather.provenance.observation_timestamp,
        observation_age_minutes: weather.provenance.observation_age_minutes,
      };
    } catch {
      // Inability to retrieve weather must not crash the entire worksite dashboard
      weatherSummary = null;
    }

    const totalCrew = worksite.zones.reduce((acc, z) => acc + (z.active_crew_count || 0), 0);

    return {
      worksite: {
        worksite_id: worksite.worksite_id,
        name: worksite.name,
        timezone: worksite.timezone,
        status: worksite.status,
        location: worksite.location,
        safeguards: worksite.safeguards,
      },
      active_shift: activeShift,
      shift_ambiguity_flag: isAmbiguous,
      zones: worksite.zones,
      total_active_crew: totalCrew,
      weather_summary: weatherSummary,
    };
  }
}

export const worksiteService = new WorksiteService();
