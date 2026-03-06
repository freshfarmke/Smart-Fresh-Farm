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
    const category = url.searchParams.get('category');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50', 10);

    let query = supabase.from('expenses').select('*');
    if (start) query = query.gte('expense_date', start);
    if (end) query = query.lte('expense_date', end);
    if (category) query = query.eq('category', category);

    const offset = (page - 1) * pageSize;
    query = query.order('expense_date', { ascending: false }).range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [], count });
  } catch (err) {
    console.error('expenses GET error', err);
    const errorResponse = formatErrorResponse(err);
    const status = err instanceof Error && err.message.includes('Forbidden') ? 403 : 401;
    return NextResponse.json(errorResponse, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireFinanceRole();
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

    const body = await request.json();
    const { description, amount, category, expense_date, notes } = body;

    if (!category || !amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    // try to use user's friendly name from metadata; fall back to email
    const recordedBy =
      (user.user_metadata && (user.user_metadata as any).name) ||
      user.email ||
      user.id;

    const { data, error } = await supabase
      .from('expenses')
      .insert([
        {
          description,
          amount,
          category,
          expense_date,
          notes: notes || null,
          recorded_by: recordedBy,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('expenses POST error', err);
    const errorResponse = formatErrorResponse(err);
    const status = err instanceof Error && err.message.includes('Forbidden') ? 403 : 401;
    return NextResponse.json(errorResponse, { status });
  }
}

export async function DELETE(request: NextRequest) {
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
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('expenses DELETE error', err);
    const errorResponse = formatErrorResponse(err);
    const status = err instanceof Error && err.message.includes('Forbidden') ? 403 : 401;
    return NextResponse.json(errorResponse, { status });
  }
}
