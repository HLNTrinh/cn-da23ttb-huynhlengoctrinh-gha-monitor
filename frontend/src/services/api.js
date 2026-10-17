const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (import.meta.env.VITE_API_KEY) headers.Authorization = `Bearer ${import.meta.env.VITE_API_KEY}`;
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers, credentials: 'include' });
  const body = await response.json();
  if (!response.ok || !body.success) throw new Error(body.message ?? `Request failed (${response.status})`);
  return body.data;
}
