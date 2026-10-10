import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, ShieldCheck, Mail, User, KeyRound, ArrowRight, RotateCcw, AlertCircle, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.ts';
import type { UserRecord, WalletState } from '../shared/types.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserRecord | null;
  onLoginSuccess: (user: UserRecord, token: string, wallet: WalletState) => void;
  onLogout: () => void;
  onNavigate?: (path: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  onNavigate,
}) => {
  // Steps: 'email' -> 'otp'
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [senderEmail, setSenderEmail] = useState('noreply.bascart@gmail.com');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [countdown, setCountdown] = useState(300);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Timer for OTP expiration
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const isCurrentEmailAdmin = email.trim().toLowerCase() === 'noreply.bascart@gmail.com';

  const handleSendOtp = async (targetEmail?: string) => {
    const toEmail = (targetEmail || email).trim();
    if (!toEmail || !toEmail.includes('@')) {
      setError('Please provide a valid email address.');
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
      setInfoMsg(`Single-use verification code dispatched via email from ${res.sender}!`);
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
        full_name: fullName.trim() || undefined,
        marketing_consent: marketingConsent,
      });

      onLoginSuccess(res.user, res.token, res.wallet);
      onClose();
      // Reset state
      setStep('email');
      setOtpCode('');
      setDebugOtp(null);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelectEmail = (selectedEmail: string, suggestedName: string) => {
    setEmail(selectedEmail);
    setFullName(suggestedName);
    handleSendOtp(selectedEmail);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 border border-stone-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          /* Profile Mode */
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-800 font-bold text-xl">
              {currentUser.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-stone-900">{currentUser.full_name}</h3>
              <p className="text-xs text-stone-500 font-mono">{currentUser.email}</p>
            </div>
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-left space-y-2 text-stone-600">
              <div className="flex justify-between items-center">
                <span>Account Role:</span>
                <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                  currentUser.email.toLowerCase() === 'noreply.bascart@gmail.com' || currentUser.email.includes('admin')
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-emerald-100 text-emerald-900'
                }`}>
                  {currentUser.email.toLowerCase() === 'noreply.bascart@gmail.com' || currentUser.email.includes('admin')
                    ? 'Master Administrator'
                    : 'Customer Shopper'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Auth Provider:</span>
                <span className="font-semibold text-stone-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>OTP via {senderEmail}</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>User Record ID:</span>
                <span className="font-mono text-[11px] text-stone-400">{currentUser.user_id}</span>
              </div>
            </div>
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2.5 px-4 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          /* Login / Registration Flow */
          <div>
            {/* Sender Badge */}
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
              <KeyRound className="w-4 h-4" />
              <span>Email OTP Authentication</span>
            </div>

            <h3 className="text-2xl font-bold text-stone-900 mb-1">
              {step === 'email' ? 'Sign In to BasCart' : 'Verify Email Code'}
            </h3>
            
            <p className="text-xs text-stone-500 mb-5 leading-relaxed">
              {step === 'email' ? (
                <>
                  Secure single-use verification codes are delivered from{' '}
                  <strong className="text-stone-900 font-semibold">{senderEmail}</strong>.
                </>
              ) : (
                <>
                  Verification email sent from{' '}
                  <strong className="text-stone-900 font-semibold">{senderEmail}</strong> to{' '}
                  <strong className="text-stone-900 font-semibold">{email}</strong>.
                </>
              )}
            </p>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {infoMsg && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{infoMsg}</span>
              </div>
            )}

            {/* STEP 1: EMAIL ENTRY */}
            {step === 'email' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Email Address (Admin or Customer)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="email"
                      placeholder="e.g. noreply.bascart@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-stone-900"
                      required
                    />
                  </div>
                  {isCurrentEmailAdmin && (
                    <span className="block mt-1 text-[11px] font-semibold text-amber-700">
                      ⚡ Administrator Address: Unlocks all system and Google Sheets controls.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">
                    Full Name (Optional for New Shoppers)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="text"
                      placeholder="e.g. Satyam Mishra"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-stone-900"
                    />
                  </div>
                </div>

                {/* Terms and Consent */}
                <div className="space-y-2 pt-1 border-t border-stone-100 text-[11px] text-stone-600">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded border-stone-300 text-stone-900 focus:ring-0"
                    />
                    <span>
                      I understand BasCart is a simulated shopping experience with ₹50,000 in virtual BasCash (₹0 real cost).
                    </span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={loading || !termsAccepted || !email.trim()}
                  className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 disabled:bg-stone-300 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Dispatching OTP via Email...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send OTP from {senderEmail}</span>
                    </>
                  )}
                </button>

                {/* Quick 1-Click Access Shortcuts */}
                <div className="pt-4 border-t border-stone-100">
                  <span className="text-[11px] text-stone-400 block mb-2 font-medium">
                    1-Click Direct Testing Options:
                  </span>
                  <div className="space-y-2">
                    {/* Admin Access */}
                    <button
                      type="button"
                      onClick={() => handleQuickSelectEmail('noreply.bascart@gmail.com', 'BasCart Master Admin')}
                      className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 rounded-xl text-xs font-semibold text-left flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                        <div>
                          <div>Master Admin (noreply.bascart@gmail.com)</div>
                          <span className="text-[10px] text-amber-700 font-normal">Full admin access for all system & sheet changes</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-amber-800 font-bold shrink-0">Send OTP →</span>
                    </button>

                    {/* Customer Access */}
                    <button
                      type="button"
                      onClick={() => handleQuickSelectEmail('shopper.demo@bascart.com', 'Anya Sharma')}
                      className="w-full py-2.5 px-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 rounded-xl text-xs font-medium text-left flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-stone-500 shrink-0" />
                        <div>
                          <div>Customer Shopper (shopper.demo@bascart.com)</div>
                          <span className="text-[10px] text-stone-400 font-normal">Receive ₹50,000 virtual BasCash grant</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-stone-600 font-semibold shrink-0">Send OTP →</span>
                    </button>
                  </div>
                </div>

                {onNavigate && (
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigate('/login');
                      }}
                      className="hover:text-stone-900 underline"
                    >
                      Customer URL (/login)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigate('/admin/login');
                      }}
                      className="text-amber-800 hover:text-amber-950 font-medium underline"
                    >
                      Admin URL (/admin/login)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: OTP VERIFICATION */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {/* Debug Code Helper Banner for Seamless Testing */}
                {debugOtp && (
                  <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center justify-between">
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
                    <label className="text-[11px] font-medium text-stone-600">
                      Enter 6-Digit Code
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
                    className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 border border-stone-300 rounded-xl text-stone-900 focus:outline-stone-900 font-bold"
                    autoFocus
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 disabled:bg-stone-300 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Verifying Code...</span>
                  ) : (
                    <>
                      <span>Verify & Enter BasCart</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 text-[11px] text-stone-500">
                  <button
                    type="button"
                    onClick={() => handleSendOtp(email)}
                    disabled={loading || countdown > 240}
                    className="hover:text-stone-900 underline flex items-center gap-1 disabled:text-stone-300 disabled:no-underline"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resend Code</span>
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
        )}
      </div>
    </div>
  );
};
