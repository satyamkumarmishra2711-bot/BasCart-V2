import React from 'react';
import { ShieldCheck, Heart, Github, Lock, User } from 'lucide-react';
import { getStoredLogo } from '../services/api.ts';

interface FooterProps {
  onOpenPolicy: (type: 'terms' | 'privacy') => void;
  onOpenSupport: () => void;
  onNavigate: (path: string) => void;
  isAdmin: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPolicy,
  onOpenSupport,
  onNavigate,
  isAdmin,
}) => {
  const [logo, setLogo] = React.useState<string | null>(() => getStoredLogo());

  React.useEffect(() => {
    const handleLogoUpdate = () => {
      setLogo(getStoredLogo());
    };
    window.addEventListener('bascart_logo_updated', handleLogoUpdate);
    return () => window.removeEventListener('bascart_logo_updated', handleLogoUpdate);
  }, []);

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Slogan */}
          <div className="md:col-span-2 space-y-3">
            {logo ? (
              <img
                src={logo}
                alt="BasCart Logo"
                className="h-8 max-h-8 max-w-[160px] object-contain rounded"
              />
            ) : (
              <span className="text-xl font-bold tracking-tight text-white block">
                BasCart
              </span>
            )}
            <p className="text-stone-400 max-w-sm text-xs leading-relaxed">
              “Your cart is full. Your wallet isn't.” Indulge your shopping impulse, experience the thrill of checking out, and track how much real money you saved.
            </p>
            <div className="pt-2 text-stone-500 text-[11px]">
              Engineered with Google Sheets Data Architecture, Next.js / Express server routes, and Vercel GitHub CI/CD compatibility.
            </div>
          </div>

          {/* Quick Access & Direct Login URLs */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Account & Portals
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <button
                  onClick={() => onNavigate('/login')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  <span>Customer Login (/login)</span>
                </button>
              </li>
              {isAdmin && (
                <li>
                  <button
                    onClick={() => onNavigate('/admin')}
                    className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 font-semibold"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Admin Operations Console (/admin)</span>
                  </button>
                </li>
              )}
              <li className="pt-1">
                <button onClick={onOpenSupport} className="hover:text-white transition-colors">
                  Customer Support Desk
                </button>
              </li>
            </ul>
          </div>

          {/* Policy & Legal Disclosure */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Legal Disclosure
            </h4>
            <ul className="space-y-1.5 text-stone-400 mb-3">
              <li>
                <button onClick={() => onOpenPolicy('terms')} className="hover:text-white transition-colors">
                  Simulation Terms of Use
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('privacy')} className="hover:text-white transition-colors">
                  Privacy Notice & Consents
                </button>
              </li>
            </ul>
            <p className="text-stone-400 text-[11px] leading-relaxed">
              BasCart is a simulated shopping experience. BasCash has no real-world monetary value. No credit cards or real payments are ever charged (₹0).
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <div>
            © {new Date().getFullYear()} BasCart Inc. All simulated transactions preserved in Google Sheets.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/login')}
              className="hover:text-stone-300 transition-colors"
            >
              Customer Portal
            </button>
            <span>·</span>
            <span>₹0 Real Cost Guaranteed</span>
            <span>·</span>
            <button
              onClick={() => onNavigate('/admin/login')}
              className="text-stone-600 hover:text-stone-400 transition-colors"
              title="Restricted Administrative Access"
            >
              Owner Only
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
