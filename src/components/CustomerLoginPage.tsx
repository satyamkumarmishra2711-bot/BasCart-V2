import React, { useState, useEffect } from 'react';
import { Mail, KeyRound, ArrowRight, RotateCcw, AlertCircle, Send, Check, ShoppingBag, Sparkles, Shield, ArrowLeft, UserPlus } from 'lucide-react';
import { api } from '../services/api.ts';
import type { UserRecord, WalletState } from '../shared/types.ts';

interface CustomerLoginPageProps {
  onLoginSuccess: (user: UserRecord, token: string, wallet: WalletState) => void;
  onNavigate: (path: string) => void;
}

export const CustomerLoginPage: React.FC<CustomerLoginPageProps> = ({
  onLoginSuccess,
  onNavigate,
}) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [senderEmail, setSenderEmail] = useState('noreply.bascart@gmail.com');
  const [resendTimer, setResendTimer] = useState(0);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (targetEmail?: string) => {
    const emailToUse = (targetEmail || email).trim();
    if (!emailToUse || !emailToUse.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMsg(null);

    try {
      const res = await api.sendOtp(emailToUse);
      setSenderEmail(res.sender || 'noreply.bascart@gmail.com');
      setDebugOtp(res.debug_code);
      setResendTimer(60);
      setStep('otp');
      setOtpCode('');

      if (res.email_sent) {
        setInfoMsg(`Single-use verification code sent to ${emailToUse} from ${res.sender}. Check your inbox and spam folder.`);
      } else {
        setInfoMsg(
          `Verification code generated for ${emailToUse}. (SMTP status: ${res.email_delivery_error || 'Live email requires Gmail App Password in Admin Portal'})`
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.verifyOtp({
        email: email.trim(),
        otp: otpCode.trim(),
        marketing_consent: true,
      });

      onLoginSuccess(res.user, res.token, res.wallet);
      onNavigate('/shop');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-xl">
        {/* Navigation & Header */}
        <div>
          <button
            onClick={() => onNavigate('/shop')}
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Storefront</span>
          </button>

          <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <ShoppingBag className="w-4 h-4" />
            <span>Customer Shopper Portal</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-stone-900">
            {step === 'email' ? 'Customer Sign In' : 'Verify Email OTP'}
          </h2>

          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
            {step === 'email' ? (
              <>
                Sign in with <strong className="text-stone-900 font-semibold">Email OTP only</strong>. Dispatched from{' '}
                <strong className="text-stone-900 font-semibold">{senderEmail}</strong>.
              </>
            ) : (
              <>
                Verification code dispatched from{' '}
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
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
            <Check className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* STEP 1: Customer Email Entry (Email Only) */}
        {step === 'email' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Your Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="email"
                  placeholder="e.g. satyamkumarmishra2711@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-xl text-xs focus:outline-stone-900"
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSendOtp()}
              disabled={loading || !email.trim() || !email.includes('@')}
              className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 disabled:bg-stone-300 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Dispatching Email OTP...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Login OTP</span>
                </>
              )}
            </button>

            {/* Link to Sign Up */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>New to BasCart?</span>
              <button
                type="button"
                onClick={() => onNavigate('/signup')}
                className="text-amber-800 hover:text-amber-900 font-semibold underline underline-offset-2 flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create an Account (Sign Up) →</span>
              </button>
            </div>

            {/* Quick Demo Customer */}
            <div className="pt-3 border-t border-stone-100">
              <span className="text-[11px] text-stone-400 block mb-2 font-medium">
                Quick Demo Customer Access:
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmail('shopper.demo@bascart.com');
                  handleSendOtp('shopper.demo@bascart.com');
                }}
                className="w-full py-2.5 px-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 rounded-xl text-xs font-medium text-left flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-stone-500 shrink-0" />
                  <div>
                    <div className="font-semibold text-stone-900">shopper.demo@bascart.com</div>
                    <span className="text-[10px] text-stone-400 font-normal">Pre-configured demo shopper</span>
                  </div>
                </div>
                <span className="text-[11px] text-stone-700 font-semibold shrink-0">Send OTP →</span>
              </button>
            </div>

            {/* Switch to Admin Login URL */}
            <div className="pt-3 border-t border-stone-100 text-center">
              <p className="text-xs text-stone-500">
                Store administrator?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('/admin/login')}
                  className="text-amber-800 hover:text-amber-900 font-semibold underline underline-offset-2"
                >
                  Admin Login (/admin/login) →
                </button>
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Customer OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {debugOtp && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-950 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                    Dispatched from {senderEmail}
                  </span>
                  <span className="font-mono text-base font-bold text-emerald-950 tracking-widest">
                    {debugOtp}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpCode(debugOtp)}
                  className="px-2.5 py-1 bg-emerald-200 hover:bg-emerald-300 rounded-md text-[11px] font-bold text-emerald-900 transition-colors"
                >
                  Auto-Fill Code
                </button>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-stone-700">
                  Enter 6-Digit Code
                </label>
                {resendTimer > 0 ? (
                  <span className="text-[11px] text-stone-400">
                    Resend in {resendTimer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={loading}
                    className="text-[11px] text-stone-900 font-semibold underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Resend Code
                  </button>
                )}
              </div>

              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-xl text-center text-lg tracking-widest font-mono font-bold focus:outline-stone-900"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 disabled:bg-stone-300 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Verify OTP & Log In</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('email');
                setError(null);
              }}
              className="w-full py-2 text-stone-500 hover:text-stone-900 text-xs font-medium transition-colors"
            >
              ← Change Email Address
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
