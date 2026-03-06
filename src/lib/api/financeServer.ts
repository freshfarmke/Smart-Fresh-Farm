import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { canManageFinance } from '../auth';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

function createSupabaseServer(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options as any);
        });
      },
    },
  });
  return { supabase, response } as const;
}

export async function requireFinance(req: NextRequest) {
  const { supabase } = createSupabaseServer(req);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) };
  }

  const allowed = await canManageFinance(user.id);
  if (!allowed) {
    return { error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) };
  }

  return { user, supabase };
}
