import React, { useState } from 'react';
import { X, HelpCircle, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.ts';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await api.createSupportTicket({ subject, message });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSubject('');
        setMessage('');
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 border border-stone-200">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
          <HelpCircle className="w-4 h-4" />
          <span>Customer Experience Support</span>
        </div>

        <h3 className="text-xl font-bold text-stone-900 mb-2">Simulated Support Desk</h3>
        <p className="text-xs text-stone-500 mb-6">
          Have questions about your BasCash balance, imaginary deliveries, or Google Sheets sync? Send us a ticket.
        </p>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-base font-bold text-stone-900">Ticket Submitted</h4>
            <p className="text-xs text-stone-500">
              Your inquiry has been stored in Google Sheets (SupportTickets table). An administrator will respond shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">Inquiry Subject</label>
              <input
                type="text"
                placeholder="e.g. Question about my ₹50,000 grant"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-stone-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1">Message Details</label>
              <textarea
                rows={4}
                placeholder="Describe your inquiry..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-stone-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 disabled:bg-stone-300 transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Submitting to Sheets...' : 'Dispatch Ticket'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
