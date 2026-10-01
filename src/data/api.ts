const API_BASE = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/+$/, '');
const TOKEN_KEY = 'smart-school-api-token';

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
  section?: string | null;
  department?: { name: string } | null;
}

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getApiToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api${path}`, { ...init, headers });
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Backend unavailable.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data.error || `Request failed (${response.status}).`, response.status);
  return data as T;
}

export const apiGet = <T>(path: string) => apiRequest<T>(path);
export const apiPost = <T>(path: string, body: unknown) => apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) });
export const apiPut = <T>(path: string, body: unknown) => apiRequest<T>(path, { method: 'PUT', body: JSON.stringify(body) });
export const apiPatch = <T>(path: string, body: unknown) => apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(body) });

export function apiBaseUrl(): string {
  return API_BASE;
}

export function getApiToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY) || window.sessionStorage.getItem(TOKEN_KEY);
}

export function storeApiToken(token: string | null, rememberMe = false): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
  if (token) {
    (rememberMe ? window.localStorage : window.sessionStorage).setItem(TOKEN_KEY, token);
  }
}

export async function apiLogin(email: string, password: string): Promise<{ token: string; user: ApiUser }> {
  return apiRequest<{ token: string; user: ApiUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function uploadReportImage(dataUrl: string, token: string): Promise<string> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const form = new FormData();
  const extension = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
  form.append('image', blob, `report-evidence.${extension}`);
  const upload = await fetch(`${API_BASE}/api/uploads`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const result = await upload.json().catch(() => ({}));
  if (!upload.ok) throw new ApiError(result.error || 'Image upload failed.', upload.status);
  return `${API_BASE}${result.url}`;
}

export async function createApiReport(token: string, report: Record<string, unknown>, isFoodComplaint = false): Promise<{ issue: Record<string, unknown> }> {
  const response = await fetch(`${API_BASE}/api/${isFoodComplaint ? 'food-complaints' : 'reports'}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(result.error || 'Report could not be saved to the server.', response.status);
  return result;
}

export async function apiRegister(data: { name: string; email: string; password: string; phoneNumber?: string }): Promise<{ token: string; user: ApiUser }> {
  return apiPost<{ token: string; user: ApiUser }>('/auth/register', data);
}