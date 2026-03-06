import { NextRequest, NextResponse } from 'next/server';
import { requireFinanceRole, formatErrorResponse } from '@/lib/api/roleHelpers';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * query params:
 * - start, end (date) - optional date range
 * - days (number) - optional number of days to look back from today
 * - metric (revenue|expenses|profit|stock_loss|loss) - defaults to profit
 */
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
    let start = url.searchParams.get('start');
    let end = url.searchParams.get('end');
    const daysParam = url.searchParams.get('days');
    const metric = url.searchParams.get('metric') || 'profit';

    // Calculate date range from days parameter if provided
    if (daysParam && !start && !end) {
      const days = parseInt(daysParam, 10);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      start = startDate.toISOString().split('T')[0];
      end = endDate.toISOString().split('T')[0];
    }

    let query = supabase.from('v_finance_summary').select(`day, total_expenses, total_collections, total_stock_loss, net_profit`);
    if (start) query = query.gte('day', start);
    if (end) query = query.lte('day', end);
    query = query.order('day', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;

    const chartData = (data || []).map((row: any) => {
      let value = 0;
      switch (metric) {
        case 'revenue':
          value = Number(row.total_collections);
          break;
        case 'expenses':
          value = Number(row.total_expenses);
          break;
        case 'loss':
        case 'stock_loss':
          value = Number(row.total_stock_loss);
          break;
        case 'profit':
        default:
          value = Number(row.net_profit);
          break;
      }
      return { day: row.day, value };
    });

    return NextResponse.json({ success: true, data: chartData });
  } catch (err) {
    console.error('reports GET error', err);
    const errorResponse = formatErrorResponse(err);
    const status = err instanceof Error && err.message.includes('Forbidden') ? 403 : 401;
    return NextResponse.json(errorResponse, { status });
  }
}
