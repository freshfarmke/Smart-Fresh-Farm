import express from 'express';
import { supabaseAdmin } from '../supabaseAdmin.js';

const router = express.Router();

// POST /admin/create-user
// Body: { email, password, role }
// Protect: only callers with an active session whose role === 'admin' may call
router.post('/create-user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing authorization token' });

    // Verify caller session and get user
    const { data: callerData, error: callerError } = await supabaseAdmin.auth.getUser(token);
    if (callerError) return res.status(401).json({ error: 'Invalid token' });
    const caller = callerData?.user;
    if (!caller) return res.status(401).json({ error: 'Invalid user' });

    // Ensure caller has admin role in public.users
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('user_id', caller.id)
      .single();

    if (profileError) return res.status(403).json({ error: 'Unable to fetch caller profile' });
    if (profile?.role !== 'admin') return res.status(403).json({ error: 'Admin role required' });

    const { email, password, role } = req.body || {};
    if (!email || !password || !role) return res.status(400).json({ error: 'email, password and role are required' });

    // Create user via Supabase Admin API
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) return res.status(500).json({ error: createError.message });

    const createdUser = createData?.user ?? createData;
    if (!createdUser?.id) return res.status(500).json({ error: 'Failed to create user' });

    // Insert into public.users table
    const { error: insertError } = await supabaseAdmin.from('users').insert({
      user_id: createdUser.id,
      email,
      role,
    });

    if (insertError) return res.status(500).json({ error: insertError.message });

    return res.json({ message: 'User created', user_id: createdUser.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' });
  }
});

export default router;
