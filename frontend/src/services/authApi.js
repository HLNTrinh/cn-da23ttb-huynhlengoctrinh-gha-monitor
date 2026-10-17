const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  const body = await response.json();
  if (!response.ok || !body.success) throw new Error(body.message ?? `Request failed (${response.status})`);
  return body.data;
}

export const getAuthSession = () => request('/auth/me');
export const logout = () => request('/auth/logout', { method: 'POST' });
export const startGitHubLogin = () => window.location.assign(`${baseUrl}/auth/github`);
