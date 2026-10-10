import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mail, KeyRound, ArrowRight, RotateCcw, AlertCircle, Send, Check, Shield, ArrowLeft, Database, Sparkles } from 'lucide-react';
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
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('noreply.bascart@gmail.com');
  const [otpCode, setOtpCode] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [senderEmail, setSenderEmail] = useState('noreply.bascart@gmail.com');
  const [countdown, setCountdown] = useState(300);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOtp = async (targetEmail?: string) => {
    const toEmail = (targetEmail || email).trim();
    if (!toEmail || !toEmail.includes('@')) {
      setError('Please provide a valid administrative email.');
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMsg(null);

    try {
      const res = await api.sendOtp(toEmail);
      setEmail(toEmail);
      setSenderEmail(res.sender || 'noreply.bascart@gmail.com');
      setDebugOtp(res.debug_code);
      setStep('otp');
      setCountdown(300);
      setOtpCode('');
      setInfoMsg(`Administrator OTP dispatched via email from ${res.sender}!`);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch administrator verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setError('Please enter the complete 6-digit administrator code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.verifyOtp({
        email: email.trim(),
        otp: otpCode.trim(),
        full_name: 'BasCart Master Admin',
      });

      onLoginSuccess(res.user, res.token, res.wallet);
      // Navigate directly into the Admin Portal
      onNavigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Administrator verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-stone-900/5">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-amber-200/80 shadow-2xl relative overflow-hidden">
        {/* Subtle accent bar */}
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
            <span>Operations & Management</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-stone-900">
            {step === 'email' ? 'Administrator Login' : 'Verify Admin Credentials'}
          </h2>

          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
            {step === 'email' ? (
              <>
                Authorized administrator verification via single-use OTP dispatched from{' '}
                <strong className="text-stone-900 font-semibold">{senderEmail}</strong>.
              </>
            ) : (
              <>
                Administrator verification code sent from{' '}
                <strong className="text-stone-900 font-semibold">{senderEmail}</strong> to{' '}
                <strong className="text-stone-900 font-semibold">{email}</strong>.
              </>
            )}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {infoMsg && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Check className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* STEP 1: Admin Email Entry */}
        {step === 'email' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Authorized Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="noreply.bascart@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-xl text-xs focus:outline-amber-600 font-medium"
                  required
                />
              </div>
              <span className="block mt-1.5 text-[11px] text-amber-800 font-medium">
                ⚡ Master Admin: grants control over Google Sheets sync, catalog editing, & audit logs.
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleSendOtp()}
              disabled={loading || !email.trim()}
              className="w-full py-3 bg-amber-800 text-white rounded-xl text-xs font-semibold hover:bg-amber-900 disabled:bg-stone-300 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Dispatching Admin OTP...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Admin OTP from {senderEmail}</span>
                </>
              )}
            </button>

            {/* 1-Click Master Admin Access */}
            <div className="pt-4 border-t border-stone-100">
              <span className="text-[11px] text-stone-400 block mb-2 font-medium">
                Standard Master Admin Setup:
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmail('noreply.bascart@gmail.com');
                  handleSendOtp('noreply.bascart@gmail.com');
                }}
                className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 rounded-xl text-xs font-semibold text-left flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <div className="text-amber-950 font-bold">Master Admin (noreply.bascart@gmail.com)</div>
                    <span className="text-[10px] text-amber-700 font-normal">Direct unlock for Google Sheets sync & store ops</span>
                  </div>
                </div>
                <span className="text-[11px] text-amber-900 font-bold shrink-0">Send OTP →</span>
              </button>
            </div>

            {/* Switch to Customer Login URL */}
            <div className="pt-4 border-t border-stone-100 text-center">
              <p className="text-xs text-stone-500">
                Looking for customer shopping?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('/login')}
                  className="text-stone-900 hover:text-stone-700 font-semibold underline underline-offset-2"
                >
                  Go to Customer Login (/login) →
                </button>
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Admin OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {debugOtp && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                    Dispatched from {senderEmail}
                  </span>
                  <span className="font-mono text-base font-bold text-amber-950 tracking-widest">
                    {debugOtp}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpCode(debugOtp)}
                  className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 rounded-md text-[11px] font-bold text-amber-900 transition-colors"
                >
                  Auto-Fill Code
                </button>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-stone-700">
                  Enter 6-Digit Admin Code
                </label>
                <span className="text-[11px] text-stone-400 font-mono">
                  Expires in {formatTimer(countdown)}
                </span>
              </div>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 border border-amber-300 rounded-xl text-stone-900 focus:outline-amber-600 font-bold"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full py-3 bg-amber-800 text-white rounded-xl text-xs font-semibold hover:bg-amber-900 disabled:bg-stone-300 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Verifying Administrator Code...</span>
              ) : (
                <>
                  <span>Verify & Open Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-2 text-[11px] text-stone-500">
              <button
                type="button"
                onClick={() => handleSendOtp(email)}
                disabled={loading || countdown > 240}
                className="hover:text-amber-900 underline flex items-center gap-1 disabled:text-stone-300 disabled:no-underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Resend Admin Code</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setOtpCode('');
                  setError(null);
                }}
                className="hover:text-stone-900 underline"
              >
                Change Email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
