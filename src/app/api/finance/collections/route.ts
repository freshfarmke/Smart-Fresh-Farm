import { NextRequest, NextResponse } from 'next/server';
import { requireFinanceRole, formatErrorResponse } from '@/lib/api/roleHelpers';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
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

    const url = request.nextUrl;
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');
    const dispatch = url.searchParams.get('dispatch_id');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50', 10);

    let query = supabase.from('route_collections').select('*');
    if (start) query = query.gte('collection_date', start);
    if (end) query = query.lte('collection_date', end);
    if (dispatch) query = query.eq('dispatch_id', dispatch);

    const offset = (page - 1) * pageSize;
    query = query.order('collection_date', { ascending: false }).range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [], count });
  } catch (err) {
    console.error('collections GET error', err);
    const errorResponse = formatErrorResponse(err);
    const status = err instanceof Error && err.message.includes('Forbidden') ? 403 : 401;
    return NextResponse.json(errorResponse, { status });
  }
}
