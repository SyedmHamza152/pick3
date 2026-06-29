'use client';

import React, { useState } from 'react';
import { api, fmtRiyal } from '@/utils/api';

type Props = {
  rate: number;
  onSuccess: () => void;
};

export default function RechargeForm({ rate, onSuccess }: Props) {
  const [amountPkr, setAmountPkr] = useState<string>('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [msgText, setMsgText] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showMsg, setShowMsg] = useState(false);

  const displayMessage = (text: string, success = false) => {
    setMsgText(text);
    setIsSuccess(success);
    setShowMsg(true);
  };

  const getConvertedPreview = () => {
    const n = Number(amountPkr);
    if (!n || n <= 0) return '';
    const sar = Math.round((n / rate) * 100) / 100;
    return `≈ ${fmtRiyal(sar)} on approval (Rate: 1 SAR = ${rate} PKR)`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowMsg(false);

    if (!screenshot) {
      displayMessage('Please upload screenshot');
      return;
    }

    if (screenshot.size > 5 * 1024 * 1024) {
      displayMessage('File must be under 5MB');
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

      displayMessage('Deposit submitted successfully', true);

      setAmountPkr('');
      setScreenshot(null);

      const input = document.getElementById('screenshotInput') as HTMLInputElement;
      if (input) input.value = '';

      onSuccess();
    } catch (err: any) {
      displayMessage(err.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* ALERT */}
      {showMsg && (
        <div className={`p-4 rounded-xl text-[13.5px] mb-4 border ${isSuccess
          ? 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)] text-[#6ee7b7]'
          : 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)] text-[#fca5a5]'
          }`}>
          {msgText}
        </div>
      )}

      {/* INPUTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">

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

          {/* SINGLE PREVIEW ONLY */}
          <p className="text-[#10b981] mt-2 text-[13px] font-medium min-h-[18px]">
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

      {/* BUTTON */}
      <button
        disabled={submitting}
        className="w-full h-[44px] rounded-[12px] font-semibold text-white bg-gradient-to-br from-[#a855f7] to-[#7c3aed]"
        type="submit"
      >
        {submitting ? 'Uploading...' : 'Submit for approval'}
      </button>

    </form>
  );
}