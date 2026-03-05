"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAllProductionSettings, upsertProductionSetting } from './api/settings';

export type Preferences = {
  currency: string;
  dateFormat: string;
  timeZone: string;
  theme: string;
  [key: string]: any;
};

const defaultPrefs: Preferences = {
  currency: 'KES (Ksh)',
  dateFormat: 'MM/DD/YYYY',
  timeZone: 'UTC',
  theme: 'bakery-warm',
};

interface PrefContextValue {
  prefs: Preferences;
  setPrefs: (p: Preferences) => void;
  refresh: () => Promise<void>;
}

const PreferencesContext = createContext<PrefContextValue>({
  prefs: defaultPrefs,
  setPrefs: () => {},
  refresh: async () => {},
});

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState<Preferences>(defaultPrefs);

  const load = async () => {
    const res = await getAllProductionSettings();
    if (res.success) {
      const map: Preferences = { ...defaultPrefs };
      (res.data || []).forEach((row: any) => {
        try {
          map[row.key] = row.value;
        } catch {
          map[row.key] = row.value;
        }
      });
      setPrefs(map);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const refresh = async () => {
    await load();
  };

  return (
    <PreferencesContext.Provider value={{ prefs, setPrefs, refresh }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export function usePreferences() {
  return useContext(PreferencesContext);
}

export async function savePreferences(p: Preferences) {
  const entries = Object.entries(p);
  for (const [key, value] of entries) {
    await upsertProductionSetting(key, value);
  }
}

export function parseCurrencyCode(str: string): string {
  const m = String(str).match(/^([A-Z]{3})/);
  return m ? m[1] : 'USD';
}
