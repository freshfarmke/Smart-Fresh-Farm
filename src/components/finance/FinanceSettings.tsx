"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { usePreferences, savePreferences } from '@/lib/preferences';
import {
  User,
  ChevronDown,
  Camera,
  Save,
  Globe,
  Sun,
  LogOut,
  ArrowLeft,
  Menu,
  Leaf,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { FinanceSidebar } from '@/components/layout';

const FinanceSettings: React.FC = () => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { prefs, setPrefs } = usePreferences();
  const [profile, setProfile] = useState({ 
    id: '', 
    user_id: '',
    fullName: '', 
    email: '', 
    phone: '',
    role: 'Finance Manager', 
    avatar: 'SF' 
  });
  const [preferences, setPreferences] = useState(prefs);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/finance/profile');
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        if (data.data) {
          const prof = data.data;
          setProfile({
            id: prof.id,
            user_id: prof.user_id,
            fullName: prof.name || '',
            email: prof.email || '',
            phone: prof.phone || '',
            role: 'Finance Manager',
            avatar: (prof.name || 'SF').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    setPreferences(prefs);
  }, [prefs]);

  const handleUpdateProfile = async () => {
    if (!profile.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/finance/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.fullName,
          phone: profile.phone || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      toast.success('Profile updated successfully');
      setProfile(prev => ({
        ...prev,
        avatar: profile.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
      }));
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const currencies = ['USD ($)', 'EUR (€)', 'GBP (£)', 'KES (KSh)', 'CAD ($)', 'AUD ($)'];
  const dateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
  const timeZones = ['Eastern Time (ET)', 'Central Time (CT)', 'Mountain Time (MT)', 'Pacific Time (PT)', 'UTC', 'GMT'];
  const themes = [
    { id: 'bakery-warm', name: 'Bakery Warm', primary: '#8B5E3C', secondary: '#F3F1E8' },
    { id: 'modern-light', name: 'Modern Light', primary: '#2563EB', secondary: '#F9FAFB' },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen" suppressHydrationWarning>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64">
            <FinanceSidebar currentPath="/finance/settings" />
          </div>
        </div>
      )}

      <div className="flex flex-col h-screen">
        {/* Header with Fresh Farm Branding */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              <div className="flex items-center gap-3 sm:gap-4">
                <button 
                  onClick={() => setSidebarOpen(true)} 
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fresh Farm</h1>
                    <p className="text-xs sm:text-sm text-gray-500 leading-none">Settings & Profile</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => router.back()} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="space-y-6 sm:space-y-8">
              
              {/* User Profile Section */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">User Profile</h2>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                          {profile.avatar}
                        </div>
                        <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-lg border border-gray-300 shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
                          <Camera className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                        Change Photo
                      </button>
                    </div>

                    {/* Profile Fields */}
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Full Name</label>
                          <input 
                            value={profile.fullName} 
                            onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} 
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Enter your full name"
                            disabled={loadingProfile}
                          />
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Phone Number</label>
                          <input 
                            value={profile.phone} 
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })} 
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Enter your phone number"
                            disabled={loadingProfile}
                          />
                        </div>

                        {/* Email (Read-only) */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Email Address</label>
                          <input 
                            value={profile.email} 
                            disabled 
                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                          />
                          <p className="text-xs text-gray-500">Managed via account settings</p>
                        </div>

                        {/* Role (Read-only) */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Role</label>
                          <input 
                            value={profile.role} 
                            disabled 
                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                          />
                          <p className="text-xs text-gray-500">Managed by administrators</p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button 
                          onClick={handleUpdateProfile}
                          disabled={saving || loadingProfile}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                        >
                          <Save className="w-5 h-5" />
                          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Preferences Section */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-green-100 rounded-lg">
                      <Globe className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">System Preferences</h2>
                  </div>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  {/* Preference Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Currency */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Default Currency</label>
                      <div className="relative">
                        <select 
                          value={preferences.currency} 
                          onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })} 
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        >
                          {currencies.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Date Format */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Date Format</label>
                      <div className="relative">
                        <select 
                          value={preferences.dateFormat} 
                          onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })} 
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        >
                          {dateFormats.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Time Zone */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Time Zone</label>
                      <div className="relative">
                        <select 
                          value={preferences.timeZone} 
                          onChange={(e) => setPreferences({ ...preferences, timeZone: e.target.value })} 
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        >
                          {timeZones.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Theme */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Theme</label>
                      <div className="relative">
                        <select 
                          value={preferences.theme} 
                          onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })} 
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        >
                          {themes.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Theme Preview */}
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                          <Sun className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">Current: Bakery Warm</p>
                        <p className="text-xs text-gray-600 mt-1">Warm and inviting bakery design</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button 
                      onClick={async () => {
                        setSaving(true);
                        try {
                          await savePreferences(preferences);
                          setPrefs(preferences);
                          toast.success('Preferences saved');
                        } catch (err) {
                          console.error('Failed to save preferences', err);
                          toast.error('Failed to save preferences');
                        } finally {
                          setSaving(false);
                        }
                      }}
                      disabled={saving}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg hover:from-green-700 hover:to-emerald-800 transition-all duration-200 font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                    >
                      <Save className="w-5 h-5" />
                      <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Actions Section */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Account Actions</h2>
                </div>

                <div className="p-4 sm:p-6">
                  <button 
                    onClick={() => {}}
                    className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Password Management</p>
                    <p className="text-sm text-gray-600">To change your password, please visit your Supabase account settings or contact your administrator.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FinanceSettings;
