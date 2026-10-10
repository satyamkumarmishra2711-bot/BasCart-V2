import React, { useState } from 'react';
import { Mail, User, Phone, Sparkles, Send, Check, AlertCircle, ArrowRight, ShieldCheck, KeyRound, RotateCcw } from 'lucide-react';
import { api } from '../services/api.ts';
import type { UserRecord, WalletState } from '../shared/types.ts';

interface SignUpSectionProps {
  onLoginSuccess: (user: UserRecord, token: string, wallet: WalletState) => void;
  onNavigate: (path: string) => void;
  isStandalonePage?: boolean;
}

export const SignUpSection: React.FC<SignUpSectionProps> = ({
  onLoginSuccess,
  onNavigate,
  isStandalonePage = false,
}) => {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [senderEmail, setSenderEmail] = useState('noreply.bascart@gmail.com');
  const [resendTimer, setResendTimer] = useState(0);
  const [emailSentStatus, setEmailSentStatus] = useState<boolean | null>(null);

  // Timer countdown
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setError('Please enter a valid phone number (at least 8 digits).');
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMsg(null);

    try {
      const res = await api.sendOtp(email.trim());
      setSenderEmail(res.sender || 'noreply.bascart@gmail.com');
      setDebugOtp(res.debug_code);
      setEmailSentStatus(res.email_sent ?? false);
      setResendTimer(60);
      setStep('otp');
      setOtpCode('');

      if (res.email_sent) {
        setInfoMsg(`Verification code sent to ${email.trim()} from ${res.sender}. Please check your inbox and spam folder.`);
      } else {
        setInfoMsg(
          `Verification code generated for ${email.trim()}. (SMTP setup note: ${res.email_delivery_error || 'Live email requires Gmail App Password in Admin Portal'})`
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
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.verifyOtp({
        email: email.trim(),
        otp: otpCode.trim(),
        full_name: fullName.trim(),
        phone: phone.trim(),
        marketing_consent: true,
      });

      onLoginSuccess(res.user, res.token, res.wallet);
      onNavigate('/shop');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerClasses = isStandalonePage
    ? 'min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-stone-50'
    : 'w-full py-10 px-4 sm:px-6 lg:px-8 bg-stone-100/70 border-y border-stone-200 my-8';

  const cardClasses = isStandalonePage
    ? 'max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-xl'
    : 'max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm';

  return (
    <div className={containerClasses} id="signup-section">
      <div className={cardClasses}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Join BasCart · Free ₹50,000 BasCash Grant</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-stone-900">
            {step === 'form' ? 'Create Your Account' : 'Verify Your Email'}
          </h2>

          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
            {step === 'form' ? (
              <>
                Sign up with your <strong className="text-stone-800">Name, Email, and Phone</strong>. 
                Receive instant <strong className="text-stone-900 font-semibold">₹50,000 in virtual BasCash</strong> upon verification!
              </>
            ) : (
              <>
                Enter the 6-digit verification code sent from{' '}
                <strong className="text-stone-900">{senderEmail}</strong> to{' '}
                <strong className="text-stone-900">{email}</strong>.
              </>
            )}
          </p>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {infoMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
            <Check className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* STEP 1: Registration Form (Name, Email, Phone) */}
        {step === 'form' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Satyam Kumar Mishra"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-xl text-xs focus:outline-stone-900"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. satyamkumarmishra2711@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-xl text-xs focus:outline-stone-900"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-xl text-xs focus:outline-stone-900"
                  />
                </div>
              </div>
            </div>

            <div className="text-[11px] text-stone-500 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>We verify your email via a 6-digit one-time passcode. No password needed.</span>
            </div>

            <button
              type="submit"
              disabled={loading || !fullName.trim() || !email.trim() || !phone.trim()}
              className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 disabled:bg-stone-300 transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Dispatching Verification OTP...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send OTP & Claim ₹50,000 BasCash</span>
                </>
              )}
            </button>

            {/* Quick Link to Login */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>Already have an account?</span>
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="text-stone-900 font-semibold underline underline-offset-2 hover:text-stone-700"
              >
                Log In with Email OTP →
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {/* Fallback code display so testing is never blocked if SMTP password is not set */}
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
                  Enter 6-Digit Email OTP
                </label>
                {resendTimer > 0 ? (
                  <span className="text-[11px] text-stone-400">
                    Resend code in {resendTimer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={loading}
                    className="text-[11px] text-stone-900 font-semibold underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Resend OTP
                  </button>
                )}
              </div>

              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-xl text-center text-base tracking-widest font-mono font-bold focus:outline-stone-900"
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
                <span>Verifying Code...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Verify Code & Unlock ₹50,000 BasCash</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('form');
                setError(null);
              }}
              className="w-full py-2 text-stone-500 hover:text-stone-900 text-xs font-medium transition-colors"
            >
              ← Edit Name, Email, or Phone
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
