/**
 * Centralized API Client for NGTC ERP
 */

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '') : '') + '/api/v1';

export class ApiError extends Error {
  public status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}, retries = 1): Promise<T> {
  const token = localStorage.getItem('ngtc_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 400));
      return request<T>(endpoint, options, retries - 1);
    }
    throw new ApiError(netErr.message || 'Unable to reach ERP server backend', 0);
  }

  if (response.status === 401 && !endpoint.includes('/auth/login')) {
    localStorage.removeItem('ngtc_token');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data.message || `Request failed with status ${response.status}`, response.status);
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  // System
  getSystemStatus: () =>
    request<{ database: any; time: string; nodeEnv: string }>('/system/status'),

  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ token: string; user: any; permissions: string[] }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  switchDemo: (roleCode: string) =>
    request<{ token: string; user: any; permissions: string[] }>('/auth/switch-demo', {
      method: 'POST',
      body: JSON.stringify({ roleCode }),
    }),

  getMe: () =>
    request<{ user: any; permissions: string[] }>('/auth/me'),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Dashboard
  getDashboardSummary: () =>
    request<any>('/dashboard/summary'),

  // Notifications
  getNotifications: (params?: { severity?: string; unreadOnly?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.severity) query.append('severity', params.severity);
    if (params?.unreadOnly) query.append('unreadOnly', 'true');
    return request<{ items: any[]; unreadCount: number }>(`/notifications?${query.toString()}`);
  },

  markNotificationRead: (id: string) =>
    request(`/notifications/${id}/read`, { method: 'PUT' }),

  markAllNotificationsRead: () =>
    request('/notifications/read-all', { method: 'PUT' }),

  // Audit Logs
  getAuditLogs: (params?: { module?: string; search?: string; limit?: number; skip?: number }) => {
    const query = new URLSearchParams();
    if (params?.module) query.append('module', params.module);
    if (params?.search) query.append('search', params.search);
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.skip) query.append('skip', String(params.skip));
    return request<{ items: any[]; total: number }>(`/audit-logs?${query.toString()}`);
  },

  // Users
  getUsers: () =>
    request<{ users: any[]; roles: any[]; branches: any[] }>('/users'),

  createUser: (data: any) =>
    request('/users', { method: 'POST', body: JSON.stringify(data) }),

  updateUser: (id: string, data: any) =>
    request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Vehicles
  getVehicles: (params?: { status?: string; vehicleType?: string; branchId?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.vehicleType) query.append('vehicleType', params.vehicleType);
    if (params?.branchId) query.append('branchId', params.branchId);
    if (params?.search) query.append('search', params.search);
    return request<{ items: any[]; total: number; branches: any[] }>(`/vehicles?${query.toString()}`);
  },

  createVehicle: (data: any) =>
    request('/vehicles', { method: 'POST', body: JSON.stringify(data) }),

  updateVehicle: (id: string, data: any) =>
    request(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Drivers
  getDrivers: (params?: { status?: string; search?: string; branchId?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.branchId) query.append('branchId', params.branchId);
    if (params?.search) query.append('search', params.search);
    return request<{ items: any[]; total: number }>(`/drivers?${query.toString()}`);
  },

  createDriver: (data: any) =>
    request('/drivers', { method: 'POST', body: JSON.stringify(data) }),

  // Contracts
  getContracts: (params?: { status?: string; contractType?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.contractType) query.append('contractType', params.contractType);
    if (params?.search) query.append('search', params.search);
    return request<{ items: any[]; total: number }>(`/contracts?${query.toString()}`);
  },

  createContract: (data: any) =>
    request('/contracts', { method: 'POST', body: JSON.stringify(data) }),

  // Trips
  getTrips: (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    return request<{ items: any[]; total: number }>(`/trips?${query.toString()}`);
  },

  updateTripStatus: (id: string, data: any) =>
    request(`/trips/${id}/status`, { method: 'POST', body: JSON.stringify(data) }),

  // Search
  searchGlobal: (query: string) =>
    request<{ vehicles: any[]; drivers: any[]; contracts: any[]; trips: any[]; invoices: any[] }>(
      `/search?q=${encodeURIComponent(query)}`
    ),

  // Seed Reset
  resetDatabase: () =>
    request('/seed/reset', { method: 'POST' }),
};
