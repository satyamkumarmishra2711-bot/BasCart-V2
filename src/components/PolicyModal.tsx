import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policyType: 'terms' | 'privacy';
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, onClose, policyType }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl p-6 sm:p-8 border border-stone-200 max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
          <FileText className="w-4 h-4" />
          <span>Legal & Transparency Disclosures</span>
        </div>

        <h3 className="text-xl font-bold text-stone-900 mb-4">
          {policyType === 'terms' ? 'Terms of Use & Simulation Agreement' : 'Privacy Notice & Data Processing'}
        </h3>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs text-stone-600 leading-relaxed">
          {policyType === 'terms' ? (
            <>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 font-medium">
                <strong>CRITICAL NOTICE:</strong> BasCart is strictly a simulated retail entertainment and impulse-management application. Virtual BasCash currency has no legal or monetary value, cannot be redeemed for fiat or cryptocurrency, and cannot be refunded. No actual physical items are delivered.
              </div>

              <h4 className="font-bold text-stone-900 text-sm">1. Nature of the Service</h4>
              <p>
                BasCart provides an interactive, simulated shopping environment designed to provide the psychological satisfaction of browsing luxury catalogs and checking out items without incurring real-world financial expense. Real payment charged is permanently ₹0.00.
              </p>

              <h4 className="font-bold text-stone-900 text-sm">2. BasCash Grant & Wallets</h4>
              <p>
                Every eligible verified user account receives a one-time welcome grant of ₹50,000 in virtual BasCash. This credit is tracked in an auditable transaction ledger (BasCashTransactions worksheet) stored in Google Sheets. Users may not transfer BasCash to external wallets.
              </p>

              <h4 className="font-bold text-stone-900 text-sm">3. Order Fulfillment & Delivery</h4>
              <p>
                All orders placed on BasCart are imaginary orders. Physical shipping carriers are not dispatched. Order tracking statuses represent behavioral milestones (e.g., guilt neutralized, bank account untouched).
              </p>
            </>
          ) : (
            <>
              <h4 className="font-bold text-stone-900 text-sm">1. Information We Collect</h4>
              <p>
                We collect your email address, simulated cart selections, wishlist preferences, and activity timestamps to operate the simulated retail engine. Sensitive payment card numbers and banking credentials are never collected or processed.
              </p>

              <h4 className="font-bold text-stone-900 text-sm">2. Google Sheets Data Architecture</h4>
              <p>
                Application state is maintained in a dedicated Google Sheets production database managed by a secure server-side Google Cloud Service Account. No private service account credentials or tokens are ever exposed to client-side scripts.
              </p>

              <h4 className="font-bold text-stone-900 text-sm">3. Consent & Communication Preferences</h4>
              <p>
                Consent to these terms is logged in the ConsentRecords worksheet (version v1.0-2026). Optional marketing communications may be updated or withdrawn at any time in your profile preferences.
              </p>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-stone-200 mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            I Understand & Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
