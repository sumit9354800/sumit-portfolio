export const ADMIN_TOKEN_KEY = 'sumit_admin_token';

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string): void {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch {
    // localStorage might be unavailable in restricted contexts
  }
}

export function clearAdminToken(): void {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAdminToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  headers.set('Cache-Control', 'no-cache, no-store');

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Ensure cookies are sent if available
  };

  const res = await fetch(url, fetchOptions);

  if (res.status === 401) {
    // Notify application that session expired if necessary
    window.dispatchEvent(new CustomEvent('admin:unauthorized'));
  }

  return res;
}
