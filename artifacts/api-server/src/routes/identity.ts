import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

export const identityRouter = Router();

identityRouter.get('/auth/me', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization ?? '');
  if (!match) {
    res.status(401).json({ error: 'Autenticação necessária.' });
    return;
  }
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    res.status(503).json({ error: 'Autenticação ainda não configurada.' });
    return;
  }
  // Request-scoped identity: never use a service key or a shared authenticated client.
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${match[1]}` } },
  });
  try {
    const { data: { user }, error } = await client.auth.getUser(match[1]);
    if (error || !user || user.is_anonymous) {
      res.status(error && error.status && error.status >= 500 ? 503 : 401)
        .json({ error: 'Não foi possível validar sua sessão. Entre novamente.' });
      return;
    }
    const [memberships, platform] = await Promise.all([
      client.from('institution_memberships')
        .select('id,status,institution_id,institutions(id,name,status),membership_roles(role)')
        .eq('user_id', user.id),
      client.from('platform_administrators').select('user_id').eq('user_id', user.id).is('revoked_at', null),
    ]);
    if (memberships.error || platform.error) {
      res.status(503).json({ error: 'Não foi possível consultar seus vínculos. Tente novamente.' });
      return;
    }
    res.json({ user: { id: user.id, email: user.email }, memberships: memberships.data,
      isPlatformAdministrator: platform.data.length > 0 });
  } catch {
    res.status(503).json({ error: 'Serviço de autenticação indisponível. Tente novamente.' });
  }
});
