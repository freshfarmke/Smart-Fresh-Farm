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
  Shield,
  Lock,
  Key,
  LogOut,
  ArrowLeft,
  Menu,
  Eye,
  EyeOff,
  Clock,
  Smartphone,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { FinanceSidebar } from '@/components/layout';

const FinanceSettings: React.FC = () => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { prefs, setPrefs } = usePreferences();
  const [profile, setProfile] = useState({ 
    id: '', 
    user_id: '',
    fullName: '', 
    email: '', 
    phone: '',
    role: 'Finance Manager', 
    avatar: 'SJ' 
  });
  const [preferences, setPreferences] = useState(prefs);
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/finance/profile');
        if (!res.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await res.json();
        if (data.data) {
          const prof = data.data;
          setProfile({
            id: prof.id,
            user_id: prof.user_id,
            fullName: prof.name || '',
            email: prof.email || '',
            phone: prof.phone || '',
            role: 'Finance Manager', // Always lock to Finance Manager
            avatar: (prof.name || '').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
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
        avatar: profile.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      }));
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!password.current) {
      toast.error('Current password is required');
      return;
    }

    if (!password.new || password.new.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (password.new !== password.confirm) {
      toast.error('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/finance/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: password.current,
          newPassword: password.new,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to change password');
      }

      toast.success('Password changed successfully');
      setPassword({ current: '', new: '', confirm: '' });
      setShowPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
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
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-full" suppressHydrationWarning>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0">
            <FinanceSidebar currentPath="/finance/settings" />
          </div>
        </div>
      )}

      <div className="lg:pl-0">
        <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 lg:px-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl"><Menu className="w-5 h-5" /></button>
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Finance Settings</h1>
                <p className="text-sm text-gray-500 mt-0.5">Manage profile, preferences and security</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-4 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b">
              <div className="flex items-center space-x-3"><div className="p-2 bg-primary-100 rounded-xl"><User className="w-5 h-5 text-primary-600" /></div><h2 className="text-lg font-semibold text-gray-900">User Profile</h2></div>
            </div>
            <div className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg" suppressHydrationWarning>{profile.avatar}</div>
                    <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"><Camera className="w-5 h-5 text-gray-600" /></button>
                  </div>
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">Change Photo</button>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Full Name</label>
                      <input 
                        value={profile.fullName} 
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} 
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" 
                        placeholder="Enter your full name"
                        disabled={loadingProfile}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Phone Number</label>
                      <input 
                        value={profile.phone} 
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })} 
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" 
                        placeholder="Enter your phone number"
                        disabled={loadingProfile}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Email Address</label>
                      <input 
                        value={profile.email} 
                        disabled 
                        className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-xl text-gray-500 cursor-not-allowed" 
                        title="Email cannot be changed from settings page"
                      />
                      <p className="text-xs text-gray-500">Email is managed through your account settings</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Role</label>
                      <input 
                        value={profile.role} 
                        disabled 
                        className="w-full px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-xl text-gray-500 cursor-not-allowed" 
                        title="Role is managed by administrators"
                      />
                      <p className="text-xs text-gray-500">Only administrators can change roles</p>
                    </div>
                  </div>
                  <div className="flex justify-end pt-3">
                    <button 
                      onClick={handleUpdateProfile}
                      disabled={saving || loadingProfile}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Save className="w-5 h-5" />
                      <span>{saving ? 'Saving...' : 'Update Profile'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b"><div className="flex items-center space-x-3"><div className="p-2 bg-primary-100 rounded-xl"><Globe className="w-5 h-5 text-primary-600" /></div><h2 className="text-lg font-semibold text-gray-900">System Preferences</h2></div></div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Default Currency</label><div className="relative"><select value={preferences.currency} onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none">{currencies.map(c => (<option key={c} value={c}>{c}</option>))}</select><ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /></div></div>
                <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Date Format</label><div className="relative"><select value={preferences.dateFormat} onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none">{dateFormats.map(d => (<option key={d} value={d}>{d}</option>))}</select><ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /></div></div>
                <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Time Zone</label><div className="relative"><select value={preferences.timeZone} onChange={(e) => setPreferences({ ...preferences, timeZone: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none">{timeZones.map(t => (<option key={t} value={t}>{t}</option>))}</select><ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /></div></div>
                <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Theme</label><div className="relative"><select value={preferences.theme} onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none">{themes.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}</select><ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /></div></div>
              </div>

              <div className="mt-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <div className="flex items-center space-x-3"><div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center"><Sun className="w-7 h-7 text-white" /></div><div><p className="text-sm font-medium text-gray-900">Current theme: Bakery Warm</p><p className="text-xs text-gray-500 mt-1">A warm, inviting bakery setting with brown and cream tones</p></div></div>
              </div>

              <div className="flex justify-end pt-3 mt-3 border-t"><button onClick={async () => {
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
              }} disabled={saving} className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"><Save className="w-5 h-5" /><span>{saving ? 'Saving…' : 'Save Preferences'}</span></button></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b"><div className="flex items-center space-x-3"><div className="p-2 bg-primary-100 rounded-xl"><Shield className="w-5 h-5 text-primary-600" /></div><h2 className="text-lg font-semibold text-gray-900">Security</h2></div></div>
              <div className="p-4 space-y-3">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2"><Lock className="w-4 h-4" /><span>Change Password</span></h3>
                  <div className="space-y-3">
                    <div className="relative"><input type={showPassword ? 'text' : 'password'} placeholder="Current Password" value={password.current} onChange={(e) => setPassword({ ...password, current: e.target.value })} disabled={saving} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50" /><button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">{showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}</button></div>
                    <div className="relative"><input type={showNewPassword ? 'text' : 'password'} placeholder="New Password" value={password.new} onChange={(e) => setPassword({ ...password, new: e.target.value })} disabled={saving} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50" /><button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">{showNewPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}</button></div>
                    <div className="relative"><input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm New Password" value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} disabled={saving} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50" /><button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">{showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}</button></div>
                  </div>
                  <button 
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Lock className="w-5 h-5" />
                    <span>{saving ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b"><div className="flex items-center space-x-3"><div className="p-2 bg-primary-100 rounded-xl"><Key className="w-5 h-5 text-primary-600" /></div><h2 className="text-lg font-semibold text-gray-900">Account Actions</h2></div></div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"><div className="flex items-center space-x-3"><Clock className="w-5 h-5 text-gray-400" /><div><p className="text-sm font-medium text-gray-700">Last Login</p><p className="text-xs text-gray-500">Today at 9:32 AM</p></div></div><span className="text-xs bg-success-100 text-success-700 px-2 py-1 rounded-full">Active</span></div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"><div className="flex items-center space-x-3"><Smartphone className="w-5 h-5 text-gray-400" /><div><p className="text-sm font-medium text-gray-700">Two-Factor Authentication</p><p className="text-xs text-gray-500">{twoFactorEnabled ? 'Enabled' : 'Not enabled'}</p></div></div><button onClick={() => setTwoFactorEnabled(!twoFactorEnabled)} className={clsx('px-3 py-1.5 text-sm font-medium rounded-lg transition-colors', twoFactorEnabled ? 'bg-success-100 text-success-700 hover:bg-success-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}>{twoFactorEnabled ? 'Disable' : 'Enable'}</button></div>

                <button onClick={() => {}} className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"><LogOut className="w-5 h-5" /><span>Sign Out of All Devices</span></button>

                <div className="mt-4 pt-3 border-t border-gray-200"><p className="text-xs text-gray-400 mb-2">Danger Zone</p><button className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">Delete Account</button></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FinanceSettings;
