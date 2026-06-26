'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api, getCurrency, fmtPkr, fmtRiyal, fmtDate } from '@/utils/api';

interface DepositLog {
  deposit_id: number;
  amount_pkr: number;
  amount_riyal: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function RechargePage() {
  const [amountPkr, setAmountPkr] = useState<string>('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [rate, setRate] = useState<number>(75); // Fallback conversion rate
  const [depositRows, setDepositRows] = useState<DepositLog[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Status message error/success hooks
  const [msgText, setMsgText] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showMsg, setShowMsg] = useState<boolean>(false);

  const displayMessage = (text: string, success: boolean = false) => {
    setMsgText(text);
    setIsSuccess(success);
    setShowMsg(true);
  };

  // 🔄 1. Load User's Past Deposits & Conversion Multipliers
  const loadPageData = useCallback(async () => {
    try {
      // Fetch system conversion rate configs
      const currencyConfig = await getCurrency();
      if (currencyConfig && currencyConfig.pkr_per_riyal) {
        setRate(currencyConfig.pkr_per_riyal);
      }

      // Fetch dynamic past deposit logs for logged in player
      const data = await api('/api/deposits/mine', { auth: true });
      setDepositRows(data || []);
    } catch {
      // Fallback silently if server is offline or sleeping
    }
  }, []);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  // 💰 2. Live Conversion Preview Calculator
  const getConvertedPreview = () => {
    const numericAmount = Number(amountPkr);
    if (!numericAmount || numericAmount <= 0) return '';
    const convertedSar = Math.round((numericAmount / rate) * 100) / 100;
    return `≈ ${fmtRiyal(convertedSar)} will be credited on approval (Rate: 1 SAR = ${rate} PKR)`;
  };

  // 📤 3. Form Submit Multi-Part Data Handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowMsg(false);

    if (!screenshot) {
      displayMessage('Please select and upload a receipt screenshot file.');
      return;
    }

    // Restrict file boundary sizes to 5MB maximum matching original HTML rules
    if (screenshot.size > 5 * 1024 * 1024) {
      displayMessage('File size exceeds 5MB limit. Please upload a smaller screenshot.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('amount', amountPkr);
      formData.append('screenshot', screenshot);

      await api('/api/deposits/', {
        method: 'POST',
        form: formData,
        auth: true
      });

      displayMessage('Deposit request submitted for validation successfully!', true);
      setAmountPkr('');
      setScreenshot(null);
      
      // Clear target file input element cleanly
      const fileInput = document.getElementById('screenshotInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      loadPageData(); // Refresh history table logs cleanly
    } catch (err: any) {
      displayMessage(err.message || 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-fade-in space-y-6">
      <div className="bg-[#17171f] border border-[#2a2a3a] rounded-2xl p-8 shadow-sm">
        
        {/* ── CARD HEADER ── */}
        <h2 className="font-space text-2xl font-bold text-[#f1f0ff] mb-2">
          Deposit Funds
        </h2>
        <p className="text-[#7b7a95] text-sm mb-6 leading-relaxed">
          Send via JazzCash on <span className="text-[#f59e0b] font-semibold">(03072000904)</span> in PKR (any amount), take a screenshot, then upload. After approval it converts to Riyal in your wallet.
        </p>

        {/* ── ALERTS BANNER ── */}
        {showMsg && (
          <div className={`p-4 rounded-xl text-[13.5px] font-medium mb-4 border transition-all ${
            isSuccess 
              ? 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)] text-[#6ee7b7]' 
              : 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)] text-[#fca5a5]'
          }`}>
            {msgText}
          </div>
        )}

        {/* ── DEPOSIT FORM REQUEST ── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-[#7b7a95] mb-2 uppercase tracking-[0.5px]">
                Amount (PKR)
              </label>
              <input 
                className="w-full bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] px-4 py-2.5 rounded-[12px] text-sm outline-none placeholder:text-[#7b7a95]/40 focus:border-[#a855f7]"
                type="number" 
                min="1" 
                step="0.01" 
                required 
                placeholder="e.g. 7500"
                value={amountPkr}
                onChange={(e) => setAmountPkr(e.target.value)}
              />
              <p id="depPreview" className="text-[#10b981] mt-2 text-[13px] font-medium min-h-[18px]">
                {getConvertedPreview()}
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#7b7a95] mb-2 uppercase tracking-[0.5px]">
                Screenshot (PNG/JPG, ≤ 5MB)
              </label>
              <input 
                id="screenshotInput"
                className="w-full bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] px-4 py-2 rounded-[12px] text-sm outline-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#a855f7]/20 file:text-[#a855f7] hover:file:bg-[#a855f7]/30 file:cursor-pointer cursor-pointer"
                type="file" 
                accept="image/png,image/jpeg,image/webp" 
                required
                onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              className="w-full h-[44px] inline-flex items-center justify-center rounded-[12px] text-[14px] font-semibold text-white cursor-pointer bg-gradient-to-br from-[#a855f7] to-[#7c3aed] transition-all border-none shadow-[0_4px_14px_rgba(168,85,247,0.3)] hover:shadow-[0_6px_18px_rgba(168,85,247,0.45)] hover:-translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Uploading processing...' : 'Submit for approval'}
            </button>
          </div>
        </form>

        {/* ── HISTORY DATA LOG TABLE ── */}
        <div className="pt-8 mt-4 border-t border-[#2a2a3a]/40">
          <h3 className="font-space text-lg font-bold text-[#f1f0ff] mb-4">
            My Deposits
          </h3>
          
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full border-collapse text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-[#2a2a3a]">
                  <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">ID</th>
                  <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">PKR</th>
                  <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">SAR (on approval)</th>
                  <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">Status</th>
                  <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">Date</th>
                </tr>
              </thead>
              <tbody id="depRows" className="divide-y divide-[#2a2a3a]/40">
                {depositRows.length > 0 ? (
                  depositRows.map((d) => (
                    <tr key={d.deposit_id} className="hover:bg-[#1e1e2a]/40 transition-colors">
                      <td className="py-3.5 text-[#f1f0ff] font-mono">#{d.deposit_id}</td>
                      <td className="py-3.5 text-[#f1f0ff] font-medium">{fmtPkr(d.amount_pkr)}</td>
                      <td className="py-3.5 text-[#10b981] font-bold">{fmtRiyal(d.amount_riyal)}</td>
                      <td className="py-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                          d.status === 'approved' 
                            ? 'bg-[#10b981]/15 text-[#10b981]' 
                            : d.status === 'rejected' 
                            ? 'bg-[#ef4444]/15 text-[#ef4444]' 
                            : 'bg-amber-500/15 text-amber-500'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-[#7b7a95] whitespace-nowrap">{fmtDate(d.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[#7b7a95] italic">
                      No deposit records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
