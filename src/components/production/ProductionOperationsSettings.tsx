"use client";
import { useEffect, useState } from 'react';
import { getAllProductionSettings, upsertProductionSetting } from '@/lib/api/settings';

const defaultKeys = {
  enable_auto_transfer: true,
  default_dispatch_timeout_days: 3,
  notification_email: '',
  operational_mode: 'normal',
};

export default function ProductionOperationsSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<any>({ ...defaultKeys });

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = await getAllProductionSettings();
      if (!mounted) return;
      if (res.success) {
        const map: Record<string, any> = { ...defaultKeys };
        (res.data || []).forEach((row:any) => {
          try {
            map[row.key] = row.value;
          } catch (e) {
            map[row.key] = row.value;
          }
        });
        setValues(map);
      }
      setLoading(false);
    })();

    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const entries = Object.entries(values);
      for (const [key, value] of entries) {
        await upsertProductionSetting(key, value);
      }
      alert('Settings saved');
    } catch (err) {
      console.error('Failed to save settings', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Production Operations Settings</h2>
      {loading ? <p className="text-sm text-gray-500">Loading…</p> : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Enable Auto Transfer</p>
              <p className="text-xs text-gray-500">Automatically transfer stock from production to shop</p>
            </div>
            <input type="checkbox" checked={Boolean(values.enable_auto_transfer)} onChange={(e) => setValues({...values, enable_auto_transfer: e.target.checked})} />
          </div>

          <div>
            <label className="block text-sm font-medium">Default Dispatch Timeout (days)</label>
            <input type="number" min={0} value={Number(values.default_dispatch_timeout_days)} onChange={(e) => setValues({...values, default_dispatch_timeout_days: Number(e.target.value)})} className="mt-1 px-3 py-2 border rounded w-48" />
          </div>

          <div>
            <label className="block text-sm font-medium">Notification Email</label>
            <input type="email" value={values.notification_email || ''} onChange={(e) => setValues({...values, notification_email: e.target.value})} className="mt-1 px-3 py-2 border rounded w-72" />
          </div>

          <div>
            <label className="block text-sm font-medium">Operational Mode</label>
            <select value={values.operational_mode} onChange={(e) => setValues({...values, operational_mode: e.target.value})} className="mt-1 px-3 py-2 border rounded w-48">
              <option value="normal">Normal</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="pt-4">
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800">{saving ? 'Saving…' : 'Save Settings'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
