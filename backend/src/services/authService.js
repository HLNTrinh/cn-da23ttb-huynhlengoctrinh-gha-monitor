import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const sessionCookieName = 'gha_monitor_session';
const stateCookieName = 'gha_oauth_state';
const sessionLifetimeSeconds = 60 * 60 * 24 * 7;

export function getAuthConfiguration() {
  const authMode = process.env.AUTH_MODE ?? 'github';
  const missing = [];
  if (!process.env.GITHUB_OAUTH_CLIENT_ID) missing.push('GITHUB_OAUTH_CLIENT_ID');
  if (!process.env.GITHUB_OAUTH_CLIENT_SECRET) missing.push('GITHUB_OAUTH_CLIENT_SECRET');
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) missing.push('SESSION_SECRET (at least 32 characters)');
  if (!process.env.GITHUB_OAUTH_ALLOWED_USERS?.trim()) missing.push('GITHUB_OAUTH_ALLOWED_USERS');

  return {
    enabled: authMode === 'github',
    configured: authMode !== 'github' || missing.length === 0,
    missing: authMode === 'github' ? missing : []
  };
}

export function getOAuthRedirectUri() {
  return process.env.GITHUB_OAUTH_REDIRECT_URI
    ?? `http://localhost:${process.env.PORT ?? 4000}/api/auth/github/callback`;
}

export function getFrontendUrl() {
  return (process.env.CLIENT_URL ?? 'http://localhost:5173').split(',')[0].trim().replace(/\/+$/, '');
}

function cookieOptions(maxAge) {
  return [
    'Path=/api',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
    ...(process.env.NODE_ENV === 'production' ? ['Secure'] : [])
  ].join('; ');
}

function getCookie(req, name) {
  const cookieHeader = req.get('cookie') ?? '';
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === name) {
      try {
        return decodeURIComponent(part.slice(separator + 1).trim());
      } catch {
        return '';
      }
    }
  }
  return '';
}

function sign(value) {
  return createHmac('sha256', process.env.SESSION_SECRET).update(value).digest('base64url');
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function createOAuthState() {
  return randomBytes(32).toString('base64url');
}

export function setOAuthStateCookie(res, state) {
  res.append('Set-Cookie', `${stateCookieName}=${encodeURIComponent(state)}; ${cookieOptions(600)}`);
}

export function clearOAuthStateCookie(res) {
  res.append('Set-Cookie', `${stateCookieName}=; ${cookieOptions(0)}`);
}

export function verifyOAuthState(req, state) {
  const cookieState = getCookie(req, stateCookieName);
  return Boolean(cookieState && state && safeEqual(cookieState, state));
}

export function createSessionCookie(user) {
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    login: user.login,
    name: user.name,
    avatarUrl: user.avatarUrl,
    expiresAt: Math.floor(Date.now() / 1000) + sessionLifetimeSeconds
  })).toString('base64url');
  const value = `${payload}.${sign(payload)}`;
  return `${sessionCookieName}=${encodeURIComponent(value)}; ${cookieOptions(sessionLifetimeSeconds)}`;
}

export function clearSessionCookie(res) {
  res.append('Set-Cookie', `${sessionCookieName}=; ${cookieOptions(0)}`);
}

export function readSession(req) {
  const value = getCookie(req, sessionCookieName);
  const separator = value.lastIndexOf('.');
  if (separator < 1 || !process.env.SESSION_SECRET) return null;

  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  if (!safeEqual(signature, sign(payload))) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof session.expiresAt !== 'number' || session.expiresAt <= Math.floor(Date.now() / 1000)) return null;
    if (typeof session.login !== 'string' || typeof session.id !== 'number') return null;
    return session;
  } catch {
    return null;
  }
}

export function isAllowedGitHubUser(login) {
  const allowedUsers = (process.env.GITHUB_OAUTH_ALLOWED_USERS ?? '')
    .split(',')
    .map((user) => user.trim().toLowerCase())
    .filter(Boolean);
  return allowedUsers.includes(login.toLowerCase());
}
