import { ApiResponse } from '@hare/shared';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '';

export interface UserSession {
  token: string;
  user_id: string;
  email: string;
  role: 'SUPERVISOR' | 'SAFETY_MANAGER' | 'ADMIN';
  assigned_worksite_id?: string;
  name?: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('hare_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('hare_token', token);
    } else {
      localStorage.removeItem('hare_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.error?.message) {
          errorMsg = errorJson.error.message;
        }
      } catch {
        // use fallback
      }
      throw new Error(errorMsg);
    }

    const json: ApiResponse<T> = await response.json();
    return json.data;
  }

  // Auth
  public async login(email: string, password: string): Promise<UserSession> {
    const data = await this.request<any>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return {
      token: data.token,
      user_id: data.user.user_id || data.user.id,
      email: data.user.email,
      role: data.user.role,
      assigned_worksite_id: data.user.assigned_worksite_id,
      name: data.user.full_name || data.user.name,
    };
  }

  // Health
  public async getHealth(): Promise<any> {
    return this.request<any>('/api/v1/health');
  }

  // Dashboard Overview
  public async getDashboardOverview(): Promise<any> {
    return this.request<any>('/api/v1/dashboard/overview');
  }

  // Analytics
  public async getAnalytics(): Promise<any> {
    return this.request<any>('/api/v1/analytics');
  }

  // Worksites
  public async getWorksites(): Promise<any[]> {
    return this.request<any[]>('/api/v1/worksites');
  }

  public async getWorksiteDetail(worksiteId: string): Promise<any> {
    return this.request<any>(`/api/v1/worksites/${worksiteId}/dashboard`);
  }

  // Risk
  public async evaluateRisk(worksiteId: string, params?: { scenario_id?: string }): Promise<any> {
    return this.request<any>(`/api/v1/risk/evaluate/${worksiteId}`, {
      method: 'POST',
      body: params ? JSON.stringify(params) : undefined,
    });
  }

  // Actions
  public async getActions(params?: { worksite_id?: string; status?: string }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.worksite_id && params.worksite_id !== 'ALL') {
      query.append('worksite_id', params.worksite_id);
    }
    if (params?.status) {
      query.append('status', params.status);
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<any[]>(`/api/v1/actions${qs}`);
  }

  public async getActionDetail(actionId: string): Promise<any> {
    return this.request<any>(`/api/v1/actions/${actionId}`);
  }

  public async acknowledgeAction(actionId: string): Promise<any> {
    return this.request<any>(`/api/v1/actions/${actionId}/acknowledge`, {
      method: 'PATCH',
    });
  }

  public async startAction(actionId: string): Promise<any> {
    return this.request<any>(`/api/v1/actions/${actionId}/start`, {
      method: 'PATCH',
    });
  }

  public async blockAction(actionId: string, blocker_reason: string): Promise<any> {
    return this.request<any>(`/api/v1/actions/${actionId}/block`, {
      method: 'PATCH',
      body: JSON.stringify({ blocker_reason }),
    });
  }

  public async completeAction(actionId: string, notes: string): Promise<any> {
    return this.request<any>(`/api/v1/actions/${actionId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
  }

  public async verifyAction(actionId: string, notes: string): Promise<any> {
    return this.request<any>(`/api/v1/actions/${actionId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
  }

  public async escalateAction(actionId: string, reason: string): Promise<any> {
    return this.request<any>(`/api/v1/actions/${actionId}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Escalations
  public async getEscalations(): Promise<any[]> {
    return this.request<any[]>('/api/v1/escalations');
  }

  public async resolveEscalation(escalationId: string, resolution_notes: string): Promise<any> {
    return this.request<any>(`/api/v1/escalations/${escalationId}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ resolution_notes }),
    });
  }

  public async simulateEscalation(params?: { worksite_id?: string; reason?: string }): Promise<any> {
    return this.request<any>('/api/v1/escalations/simulate', {
      method: 'POST',
      body: params ? JSON.stringify(params) : undefined,
    });
  }


  // Audit
  public async getAuditLogs(): Promise<any[]> {
    return this.request<any[]>('/api/v1/audit');
  }
}

export const api = new ApiClient();
