import { Router } from 'express';
import logger from '../utils/logger.js';
import {
  clearOAuthStateCookie,
  clearSessionCookie,
  createOAuthState,
  createSessionCookie,
  getAuthConfiguration,
  getFrontendUrl,
  getOAuthRedirectUri,
  isAllowedGitHubUser,
  readSession,
  setOAuthStateCookie,
  verifyOAuthState
} from '../services/authService.js';

const router = Router();

router.get('/me', (req, res) => {
  const configuration = getAuthConfiguration();
  const user = configuration.enabled && configuration.configured ? readSession(req) : null;
  res.json({
    success: true,
    data: {
      ...configuration,
      authenticated: !configuration.enabled || Boolean(user),
      user: user ? {
        id: user.id,
        login: user.login,
        name: user.name,
        avatarUrl: user.avatarUrl
      } : null
    }
  });
});

router.get('/github', (req, res) => {
  const configuration = getAuthConfiguration();
  if (!configuration.enabled || !configuration.configured) {
    return res.redirect(`${getFrontendUrl()}/login?error=oauth_not_configured`);
  }

  const state = createOAuthState();
  setOAuthStateCookie(res, state);
  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', process.env.GITHUB_OAUTH_CLIENT_ID);
  authorizeUrl.searchParams.set('redirect_uri', getOAuthRedirectUri());
  authorizeUrl.searchParams.set('scope', 'read:user');
  authorizeUrl.searchParams.set('state', state);
  return res.redirect(authorizeUrl.toString());
});

router.get('/github/callback', async (req, res) => {
  clearOAuthStateCookie(res);
  const frontendUrl = getFrontendUrl();
  const { code, state, error } = req.query;
  if (error) return res.redirect(`${frontendUrl}/login?error=access_denied`);
  if (typeof code !== 'string' || typeof state !== 'string' || !verifyOAuthState(req, state)) {
    return res.redirect(`${frontendUrl}/login?error=invalid_oauth_state`);
  }

  const configuration = getAuthConfiguration();
  if (!configuration.enabled || !configuration.configured) {
    return res.redirect(`${frontendUrl}/login?error=oauth_not_configured`);
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
        client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
        code,
        redirect_uri: getOAuthRedirectUri()
      }).toString()
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || typeof tokenData.access_token !== 'string') {
      return res.redirect(`${frontendUrl}/login?error=oauth_exchange_failed`);
    }

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${tokenData.access_token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    const githubUser = await userResponse.json();
    if (!userResponse.ok || typeof githubUser.login !== 'string' || typeof githubUser.id !== 'number') {
      return res.redirect(`${frontendUrl}/login?error=github_profile_failed`);
    }
    if (!isAllowedGitHubUser(githubUser.login)) {
      return res.redirect(`${frontendUrl}/login?error=not_allowed`);
    }

    res.append('Set-Cookie', createSessionCookie({
      id: githubUser.id,
      login: githubUser.login,
      name: githubUser.name ?? '',
      avatarUrl: githubUser.avatar_url ?? ''
    }));
    return res.redirect(frontendUrl);
  } catch (cause) {
    logger.warn('GitHub OAuth callback could not reach GitHub', cause.message);
    return res.redirect(`${frontendUrl}/login?error=oauth_connection_failed`);
  }
});

router.post('/logout', (req, res) => {
  clearSessionCookie(res);
  return res.json({ success: true, data: { loggedOut: true } });
});

export default router;
