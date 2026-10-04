const RENDER_BACKEND_URL = 'https://signbridge-backend-k4k5.onrender.com';
const LOCAL_BACKEND_URL = 'http://localhost:8080';

const configuredUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
const isLocalEnv =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || import.meta.env.DEV);

// Determine initial priority: configured URL, or local backend in local dev, otherwise Render
let activeBackendUrl = configuredUrl || (isLocalEnv ? LOCAL_BACKEND_URL : RENDER_BACKEND_URL);

function getCandidateUrls(): string[] {
  const candidates: string[] = [];
  if (activeBackendUrl) candidates.push(activeBackendUrl);
  if (isLocalEnv) {
    if (!candidates.includes(LOCAL_BACKEND_URL)) candidates.push(LOCAL_BACKEND_URL);
    if (!candidates.includes(RENDER_BACKEND_URL)) candidates.push(RENDER_BACKEND_URL);
  } else {
    if (!candidates.includes(RENDER_BACKEND_URL)) candidates.push(RENDER_BACKEND_URL);
  }
  return candidates;
}

export async function apiRequest(
  path: string,
  method: string = 'GET',
  body?: any,
  accessToken?: string | null,
  timeoutMs: number = 45000
) {
  const candidates = getCandidateUrls();
  let lastError: any = null;

  for (let i = 0; i < candidates.length; i++) {
    const baseUrl = candidates[i];
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const options: RequestInit = {
      method,
      headers,
      signal: controller.signal,
    };

    // Cookie-authenticated routes require credentials inclusion
    if (path.startsWith('/api/auth/')) {
      options.credentials = 'include';
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${baseUrl}${path}`, options);
      clearTimeout(timeoutId);

      // On successful network connection, remember this baseUrl as working
      activeBackendUrl = baseUrl;

      if (response.status === 204) {
        return null;
      }

      const text = await response.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!response.ok) {
        const errorMsg =
          data?.message ||
          data?.error ||
          (response.status === 401
            ? (path.includes('/login') ? 'Invalid email or password.' : 'Your session has expired. Please sign in again.')
            : response.status === 403
            ? 'Access denied. You do not have permission for this action.'
            : `Request failed with status ${response.status}. Please check your connection.`);
        
        const apiErr: any = new Error(errorMsg);
        apiErr.status = response.status;
        apiErr.data = data;
        throw apiErr;
      }

      return data;
    } catch (err: any) {
      clearTimeout(timeoutId);

      // If it's an explicit API response error (status code >= 400), don't failover to next candidate — return the actual error
      if (err?.status) {
        throw err;
      }

      lastError = err;
      // If network failure / connection refused on this candidate, continue loop to try next candidate
      if (i < candidates.length - 1) {
        console.warn(`[SignBridge Auth] Failed to reach backend at ${baseUrl}, trying next candidate ${candidates[i + 1]}...`);
        continue;
      }
    }
  }

  // If all candidates failed:
  if (lastError?.name === 'AbortError') {
    throw new Error('Server took too long to respond. The cloud service may be waking up (free tier cold start) — please wait a moment and try again.');
  }
  if (lastError?.message === 'Failed to fetch' || lastError?.message?.includes('NetworkError') || lastError?.message?.includes('fetch failed')) {
    throw new Error('Cannot reach server. Please ensure the backend service is active or wait a few moments if waking from sleep.');
  }
  throw lastError || new Error('Cannot reach server.');
}

export async function requestForgotPasswordOtp(email: string): Promise<{ message: string }> {
  return await apiRequest('/api/auth/forgot-password', 'POST', { email });
}

export async function verifyForgotPasswordOtp(email: string, otp: string): Promise<{ valid: boolean; message: string }> {
  return await apiRequest('/api/auth/verify-otp', 'POST', { email, otp });
}

export async function resetPasswordWithOtp(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
  return await apiRequest('/api/auth/reset-password', 'POST', { email, otp, newPassword });
}
