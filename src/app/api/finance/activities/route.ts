import { NextRequest, NextResponse } from 'next/server';
import { requireFinanceRole, formatErrorResponse } from '@/lib/api/roleHelpers';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { FinanceActivity } from '@/types/database';

/**
 * Returns combined list of recent finance activities (collections, expenses, losses)
 * query params: limit, page
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
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const offset = (page - 1) * pageSize;

    const [{ data: expData, error: expErr },
           { data: collData, error: collErr },
           { data: lossData, error: lossErr }] = await Promise.all([
      supabase.from('expenses').select('id, expense_date, category, description, amount, recorded_by'),
      supabase.from('route_collections').select('id, collection_date, amount_collected, collected_by, dispatch_id'),
      supabase.from('stock_losses').select('id, loss_date, reason, quantity, product_id, recorded_by'),
    ]);
    
    if (expErr || collErr || lossErr) {
      throw expErr || collErr || lossErr;
    }

    const combined: FinanceActivity[] = [];
    
    if (expData) {
      combined.push(...expData.map(exp => ({
        type: 'expense' as const,
        id: exp.id?.toString() || '',
        amount: exp.amount || 0,
        category: exp.category || '',
        description: exp.description || '',
        created_at: exp.expense_date || '',
        recorded_by: exp.recorded_by || undefined,
      })));
    }
    
    if (collData) {
      combined.push(...collData.map(coll => ({
        type: 'collection' as const,
        id: coll.id?.toString() || '',
        amount: coll.amount_collected || 0,
        dispatch_id: coll.dispatch_id?.toString() || '',
        created_at: coll.collection_date || '',
        collected_by: coll.collected_by || undefined,
      })));
    }
    
    if (lossData) {
      combined.push(...lossData.map(loss => ({
        type: 'stock_loss' as const,
        id: loss.id?.toString() || '',
        quantity: loss.quantity || 0,
        product_id: loss.product_id?.toString() || '',
        reason: loss.reason || '',
        created_at: loss.loss_date || '',
        recorded_by: loss.recorded_by || undefined,
      })));
    }

    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const paged = combined.slice(offset, offset + pageSize);
    
    return NextResponse.json({ success: true, data: paged });
  } catch (err) {
    console.error('activities GET error', err);
    const errorResponse = formatErrorResponse(err);
    const status = err instanceof Error && err.message.includes('Forbidden') ? 403 : 401;
    return NextResponse.json(errorResponse, { status });
  }
}
