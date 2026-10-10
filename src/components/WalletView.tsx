import { Wallet, TrendingUp, ShieldCheck, ArrowDownLeft, ArrowUpRight, Sparkles, RefreshCw, Lock, UserPlus, LogIn } from 'lucide-react';
import type { UserRecord, WalletState } from '../shared/types.ts';

interface WalletViewProps {
  user: UserRecord | null;
  wallet: WalletState | null;
  onRefresh: () => void;
  onStartShopping: () => void;
  onNavigate?: (path: string) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ user, wallet, onRefresh, onStartShopping, onNavigate }) => {
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-stone-700 border border-stone-200">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 mb-2">BasCash Balance Locked</h2>
        <p className="text-stone-600 text-sm mb-8 leading-relaxed max-w-md mx-auto">
          BasCash virtual currency and transaction ledgers are only accessible after logging in.
          Sign up with your Name, Email, and Phone to claim your free ₹50,000 welcome grant!
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onNavigate && (
            <>
              <button
                onClick={() => onNavigate('/signup')}
                className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-stone-950" />
                <span>Sign Up with Name, Email & Phone</span>
              </button>
              <button
                onClick={() => onNavigate('/login')}
                className="w-full sm:w-auto px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In with Email OTP</span>
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const balance = wallet?.balance ?? 50000;
  const saved = wallet?.total_saved ?? 0;
  const transactions = wallet?.transactions ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Slogan */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
            <span>Virtual Currency</span>
            <span aria-hidden="true">·</span>
            <span>Auditable Ledger</span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            BasCash Wallet & Financial Peace
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Every rupee spent here is a rupee protected in your actual bank account.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="self-start sm:self-auto px-3.5 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-medium text-stone-700 flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Balance</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Available BasCash */}
        <div className="p-6 rounded-2xl bg-stone-900 text-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-400 text-xs mb-3">
              <span>Available Virtual Balance</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-white">
              ₹{balance.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-stone-800 text-xs text-stone-400 flex items-center justify-between">
            <span>Starting Grant</span>
            <span className="text-stone-300 font-semibold tabular-nums">₹50,000.00</span>
          </div>
        </div>

        {/* Card 2: Cumulative Real Money Saved */}
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-emerald-800 text-xs mb-3 font-medium">
              <span>Cumulative Real Money Saved</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-emerald-700">
              ₹{saved.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-emerald-200/80 text-xs text-emerald-800">
            <span>100% of imaginary checkout value saved in real life.</span>
          </div>
        </div>

        {/* Card 3: Security & Architecture */}
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-500 text-xs mb-3">
              <span>Ledger Guarantees</span>
              <ShieldCheck className="w-4 h-4 text-stone-700" />
            </div>
            <h4 className="text-base font-bold text-stone-900 mb-1">
              Serialized & Idempotent
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              Protected against race conditions and double-spending across server operations.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
            <button
              onClick={onStartShopping}
              className="text-xs font-semibold text-stone-900 hover:underline flex items-center gap-1"
            >
              <span>Spend BasCash now</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Auditable Ledger Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900">Transaction History</h3>
            <p className="text-xs text-stone-500">
              Auditable log of every credit, order debit, and adjustment
            </p>
          </div>
          <span className="text-xs font-mono text-stone-500 tabular-nums">
            {transactions.length} record(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Balance After</th>
                <th className="py-3 px-4">Reference Key</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.transaction_id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-stone-500 font-mono">
                      {new Date(tx.created_at).toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {tx.transaction_type === 'signup_credit' && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Welcome Grant</span>
                        </span>
                      )}
                      {tx.transaction_type === 'order_debit' && (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                          <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
                          <span>Order Debit</span>
                        </span>
                      )}
                      {tx.transaction_type === 'refund_credit' && (
                        <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
                          <ArrowDownLeft className="w-3.5 h-3.5 text-blue-600" />
                          <span>Refund Credit</span>
                        </span>
                      )}
                      {tx.transaction_type === 'admin_adjustment' && (
                        <span className="text-stone-700 font-medium">Admin Adjustment</span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-stone-800">
                      {tx.description}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold tabular-nums whitespace-nowrap ${
                        tx.transaction_type === 'order_debit'
                          ? 'text-stone-900'
                          : 'text-emerald-600'
                      }`}
                    >
                      {tx.transaction_type === 'order_debit' ? '-' : '+'}₹
                      {tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums whitespace-nowrap text-stone-900">
                      ₹{tx.balance_after.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-stone-400 font-mono text-[10px] whitespace-nowrap">
                      {tx.idempotency_key}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
