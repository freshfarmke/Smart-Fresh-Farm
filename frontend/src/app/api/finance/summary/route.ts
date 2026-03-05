import { NextResponse, NextRequest } from 'next/server';
import { requireFinanceRole, formatErrorResponse } from '@/lib/api/roleHelpers';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(_request: NextRequest) {
  try {
    await requireFinanceRole();
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const { data, error } = await supabase
      .from('v_finance_summary')
      .select('*')
      .order('day', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('summary error', err);
    const errorResponse = formatErrorResponse(err);
    const status = err instanceof Error && err.message.includes('Forbidden') ? 403 : 401;
    return NextResponse.json(errorResponse, { status });
  }
}
