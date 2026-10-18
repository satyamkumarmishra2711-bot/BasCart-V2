import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { api } from '../services/api.ts';
import type { UserRecord, WalletState } from '../shared/types.ts';

interface AdminLoginPageProps {
  onLoginSuccess: (user: UserRecord, token: string, wallet: WalletState) => void;
  onNavigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigate,
}) => {
  const [email, setEmail] = useState('noreply.bascart@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the administrator password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.adminLoginWithPassword(email.trim(), password.trim());
      onLoginSuccess(res.user, res.token, res.wallet);
      onNavigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Administrator authentication failed. Please check the password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-stone-900/5">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-amber-200/80 shadow-2xl relative overflow-hidden">
        {/* Subtle accent top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-500 to-stone-900" />

        {/* Navigation & Header */}
        <div>
          <button
            onClick={() => onNavigate('/shop')}
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Storefront</span>
          </button>

          <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Restricted Access Portal</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-stone-900">
            Administrator Login
          </h2>

          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
            Authorized management access for catalog curation, inventory sync, and system audit logs. Login requires the master password.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* Password Login Form (No OTP) */}
        <form onSubmit={handleAdminPasswordLogin} className="space-y-5">
          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="noreply.bascart@gmail.com"
                className="w-full pl-10 pr-3.5 py-2.5 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-600 font-medium bg-stone-50/50"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-700">
                Administrator Password
              </label>
              <span className="text-[11px] text-stone-400 font-medium">
                Password protected
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full pl-10 pr-10 py-2.5 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-600 font-mono"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Quick Credential Helper Banner */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Master admin key: <strong className="font-mono font-bold">World@2026at123</strong></span>
            </div>
            <button
              type="button"
              onClick={() => setPassword('World@2026at123')}
              className="text-[10px] font-bold text-amber-800 bg-amber-200/70 hover:bg-amber-200 px-2 py-0.5 rounded transition-colors"
            >
              Fill Key
            </button>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold disabled:bg-stone-300 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating Administrator...</span>
            ) : (
              <>
                <span>Access Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Link to customer login */}
          <div className="pt-4 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500">
              Not an administrator?{' '}
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="text-stone-900 hover:text-stone-700 font-semibold underline underline-offset-2"
              >
                Customer Login with OTP (/login) →
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
