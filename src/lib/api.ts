// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  },
  TURFS: `${API_BASE_URL}/api/turfs`,
  PLAYERS: `${API_BASE_URL}/api/players`,
  BOOKINGS: `${API_BASE_URL}/api/bookings`,
} as const;

// Common fetch wrapper with proper headers
export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  // Debug logging only in development
  if (import.meta.env.DEV) {
    console.log('🚀 API Request:', { url: fullUrl, method: options.method || 'GET' });
  }
  
  const response = await fetch(fullUrl, { ...options, headers });
  
  if (import.meta.env.DEV) {
    console.log('📡 API Response:', { url: fullUrl, status: response.status });
  }
  
  return response;
};

// Typed API helpers
export const api = {
  get: <T>(url: string) => apiFetch(url).then(res => res.json() as Promise<{ success: boolean; data: T; message?: string }>),
  
  post: <T>(url: string, data: unknown) => 
    apiFetch(url, { method: 'POST', body: JSON.stringify(data) })
      .then(res => res.json() as Promise<{ success: boolean; data: T; message?: string }>),
  
  put: <T>(url: string, data: unknown) => 
    apiFetch(url, { method: 'PUT', body: JSON.stringify(data) })
      .then(res => res.json() as Promise<{ success: boolean; data: T; message?: string }>),
  
  delete: <T>(url: string) => 
    apiFetch(url, { method: 'DELETE' })
      .then(res => res.json() as Promise<{ success: boolean; data: T; message?: string }>),
};