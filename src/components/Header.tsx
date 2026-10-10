import React from 'react';
import { ShoppingBag, Wallet, User as UserIcon, Shield, ShieldCheck, Sparkles, LogIn, UserPlus } from 'lucide-react';
import type { UserRecord, WalletState } from '../shared/types.ts';

interface HeaderProps {
  user: UserRecord | null;
  wallet: WalletState | null;
  cartCount: number;
  activeView: 'shop' | 'wallet' | 'orders' | 'admin' | 'impact' | 'customer_login' | 'admin_login' | 'signup';
  onNavigate: (path: string) => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  isAdmin: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  wallet,
  cartCount,
  activeView,
  onNavigate,
  onOpenCart,
  onOpenAuth,
  isAdmin,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Disclaimer Ticker */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 text-center tracking-wide font-normal flex items-center justify-center gap-2">
        <span>Simulated Shopping Experience</span>
        <span aria-hidden="true" className="text-stone-500">·</span>
        <span>Real Bank Payment: ₹0</span>
        <span aria-hidden="true" className="text-stone-500">·</span>
        <span className="text-amber-400 font-medium">₹50,000 Free BasCash on Sign-Up</span>
      </div>

      {/* Top Bar: Brand, Navigation, Action Hub */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onNavigate('/shop')}
          className="text-2xl font-bold tracking-tight text-stone-900 hover:text-stone-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 text-left"
        >
          <span>BasCart</span>
          <span className="text-[11px] font-medium tracking-wider uppercase text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
            Virtual
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            onClick={() => onNavigate('/shop')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'shop' ? 'text-stone-900 font-semibold underline underline-offset-4' : 'hover:text-stone-900'
            }`}
          >
            Storefront
          </button>

          {/* BasCash Wallet link is strictly visible AFTER login */}
          {user && (
            <button
              onClick={() => onNavigate('/wallet')}
              className={`transition-colors whitespace-nowrap shrink-0 ${
                activeView === 'wallet' ? 'text-stone-900 font-semibold underline underline-offset-4' : 'hover:text-stone-900'
              }`}
            >
              BasCash Wallet
            </button>
          )}

          <button
            onClick={() => onNavigate('/orders')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'orders' ? 'text-stone-900 font-semibold underline underline-offset-4' : 'hover:text-stone-900'
            }`}
          >
            Imaginary Orders
          </button>
          <button
            onClick={() => onNavigate('/impact')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'impact' ? 'text-stone-900 font-semibold underline underline-offset-4' : 'hover:text-stone-900'
            }`}
          >
            Money Saved
          </button>
        </nav>

        {/* Zone 3: Interactive Action Hub & Dedicated Login Links */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* BasCash Live Balance: STRICTLY visible only AFTER login */}
          {user && (
            <button
              onClick={() => onNavigate('/wallet')}
              title="View BasCash Virtual Balance"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors text-xs text-stone-800"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold tabular-nums text-stone-900">
                ₹{wallet ? wallet.balance.toLocaleString('en-IN') : '50,000'}
              </span>
              <span className="text-stone-500 hidden lg:inline">BasCash</span>
            </button>
          )}

          {/* Cart Drawer Trigger */}
          <button
            onClick={onOpenCart}
            aria-label="Open Shopping Cart"
            className="relative p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-stone-900 text-white text-[11px] font-semibold w-5 h-5 rounded-full flex items-center justify-center tabular-nums">
                {cartCount}
              </span>
            )}
          </button>

          {/* Admin Link / Portal Button */}
          {isAdmin ? (
            <button
              onClick={() => onNavigate('/admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                activeView === 'admin'
                  ? 'bg-amber-100 text-amber-950 border-amber-300'
                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Admin Portal</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('/admin/login')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                activeView === 'admin_login'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                  : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
              }`}
              title="Admin Login URL (/admin/login)"
            >
              <Shield className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Admin Login</span>
            </button>
          )}

          {/* Authentication Hub */}
          {user ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors text-xs font-medium"
              title="Account Profile & Settings"
            >
              <UserIcon className="w-4 h-4 text-stone-600" />
              <span className="hidden sm:inline truncate max-w-[100px]">
                {user.full_name}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              {/* Sign Up Option */}
              <button
                onClick={() => onNavigate('/signup')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm ${
                  activeView === 'signup'
                    ? 'bg-amber-500 text-stone-950 font-bold ring-2 ring-amber-300'
                    : 'bg-amber-400 text-stone-950 hover:bg-amber-300'
                }`}
                title="Sign Up with Name, Email & Phone (/signup)"
              >
                <Sparkles className="w-3.5 h-3.5 text-stone-900" />
                <span>Sign Up</span>
              </button>

              {/* Login Option */}
              <button
                onClick={() => onNavigate('/login')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeView === 'customer_login'
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                }`}
                title="Customer Login with Email OTP (/login)"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
