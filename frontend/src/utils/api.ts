const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
console.log('[SignBridge Debug] API_URL resolved to:', API_URL);

export async function apiRequest(
  path: string,
  method: string = 'GET',
  body?: any,
  accessToken?: string | null
) {
  console.log('[SignBridge Debug] apiRequest:', method, `${API_URL}${path}`);
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  // Cookie-authenticated routes require credentials inclusion
  if (path.startsWith('/api/auth/refresh') || path.startsWith('/api/auth/logout')) {
    options.credentials = 'include';
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${path}`, options);

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw data || { message: 'An unexpected request error occurred.' };
  }

  return data;
}
