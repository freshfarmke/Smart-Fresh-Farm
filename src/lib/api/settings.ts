/**
 * Settings API helpers for production operations
 */
import { supabase } from '@/lib/supabase/client';
import type { ApiResponse } from '@/types/database';

export async function getAllProductionSettings(): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase.from('production_operations_settings').select('*');
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, error: { message: 'Failed to load settings', details: err instanceof Error ? { error: err.message } : undefined } };
  }
}

export async function upsertProductionSetting(key: string, value: any): Promise<ApiResponse<any>> {
  try {
    const payload = { key, value };
    const { data, error } = await supabase
      .from('production_operations_settings')
      .upsert(payload, { onConflict: 'key' })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: { message: 'Failed to save setting', details: err instanceof Error ? { error: err.message } : undefined } };
  }
}
