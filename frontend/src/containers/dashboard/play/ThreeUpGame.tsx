'use client';

import React, { useRef, useState } from 'react';
import { api, fmtRiyal } from '@/utils/api';

export default function ThreeUpGame() {
  const n2Ref = useRef<HTMLInputElement>(null);
  const n3Ref = useRef<HTMLInputElement>(null);

  const [n1, setN1] = useState('');
  const [n2, setN2] = useState('');
  const [n3, setN3] = useState('');

  // ✅ CHANGED: single → multiple selection
  const [ticketTypes, setTicketTypes] = useState<string[]>(['straight']);

  const [wager, setWager] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [msgText, setMsgText] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showMsg, setShowMsg] = useState(false);

  const displayMessage = (text: string, success = false) => {
    setMsgText(text);
    setIsSuccess(success);
    setShowMsg(true);
  };

  const getWagerHint = () => {
    const numWager = Number(wager);
    if (!numWager || numWager <= 0) return '';
    const actualDeduction = numWager * 0.57;
    return `🎁 43% Instant Cashback: Only ${fmtRiyal(actualDeduction)} will be deducted from your account.`;
  };

  const handlePlaceBet = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowMsg(false);

    if (!n1 || !n2 || !n3) {
      displayMessage('Please pick all three digits for your game selection entry.');
      return;
    }

    // ✅ NEW VALIDATION
    if (ticketTypes.length === 0) {
      displayMessage('Please select at least one lottery type.');
      return;
    }

    setSubmitting(true);

    try {
      // ✅ CHANGED: loop for multiple types
      await Promise.all(
        ticketTypes.map((type) =>
          api('/api/tickets/', {
            method: 'POST',
            body: {
              n1: Number(n1),
              n2: Number(n2),
              n3: Number(n3),
              ticket_type: type,
              amount_wagered: Number(wager),
            },
            auth: true,
          })
        )
      );

      displayMessage('Bet placed successfully! Good luck!', true);

      setN1('');
      setN2('');
      setN3('');
      setWager('');
      setTicketTypes(['straight']); // reset default
    } catch (err: any) {
      displayMessage(err.message || 'Failed to place bet.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-[#2a2a3a]/40 animate-fade-in">
      <form onSubmit={handlePlaceBet} className="space-y-6">

        <h3 className="font-space text-xl font-bold text-[#f1f0ff] mb-1">
          3UP Lottery
        </h3>

        <p className="text-[#7b7a95] text-xs">
          Pick 3 numbers (0-9) and choose your Lottery type
        </p>

        {/* ALERT */}
        {showMsg && (
          <div className={`p-4 rounded-xl text-[13.5px] font-medium border ${isSuccess
            ? 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)] text-[#6ee7b7]'
            : 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)] text-[#fca5a5]'
          }`}>
            {msgText}
          </div>
        )}

        {/* INPUTS */}
        <div>
          <label className="block text-[11px] font-bold text-[#7b7a95] mb-2 uppercase tracking-[0.5px]">
            Pick 3 numbers
          </label>

          <div className="flex gap-4 max-w-xs">

            <input
              className="w-full bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] py-3 rounded-xl text-center text-xl font-bold outline-none focus:border-[#a855f7]"
              type="number"
              min="0"
              max="9"
              value={n1}
              onChange={({ target }) => {
                const v = target.value.slice(0, 1);
                setN1(v);
                if (v) setTimeout(() => n2Ref.current?.focus(), 0);
              }}
            />

            <input
              ref={n2Ref}
              className="w-full bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] py-3 rounded-xl text-center text-xl font-bold outline-none focus:border-[#a855f7]"
              type="number"
              min="0"
              max="9"
              value={n2}
              onChange={({ target }) => {
                const v = target.value.slice(0, 1);
                setN2(v);
                if (v) setTimeout(() => n3Ref.current?.focus(), 0);
              }}
            />

            <input
              ref={n3Ref}
              className="w-full bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] py-3 rounded-xl text-center text-xl font-bold outline-none focus:border-[#a855f7]"
              type="number"
              min="0"
              max="9"
              value={n3}
              onChange={({ target }) => setN3(target.value.slice(0, 1))}
            />

          </div>
        </div>

        {/* CONFIG */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ✅ CHANGED: checkbox UI instead of select */}
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-[#7b7a95] uppercase tracking-[0.5px]">
              Lottery Type
            </label>

            <label className="flex items-center gap-2 text-[#f1f0ff] text-sm">
              <input
                type="checkbox"
                checked={ticketTypes.includes('straight')}
                onChange={(e) => {
                  setTicketTypes((prev) =>
                    e.target.checked
                      ? [...prev, 'straight']
                      : prev.filter((t) => t !== 'straight')
                  );
                }}
              />
              Straight (exact order) - 400x payout
            </label>

            <label className="flex items-center gap-2 text-[#f1f0ff] text-sm">
              <input
                type="checkbox"
                checked={ticketTypes.includes('rumble')}
                onChange={(e) => {
                  setTicketTypes((prev) =>
                    e.target.checked
                      ? [...prev, 'rumble']
                      : prev.filter((t) => t !== 'rumble')
                  );
                }}
              />
              Rumble (any order) - 80x payout
            </label>
          </div>

          <div>
            <input
              className="w-full bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] px-4 py-2.5 rounded-xl text-sm outline-none"
              type="number"
              placeholder="e.g. 1"
              value={wager}
              onChange={(e) => setWager(e.target.value)}
            />

            <p className="text-[#10b981] mt-2 text-xs font-medium min-h-[16px]">
              {getWagerHint()}
            </p>
          </div>

        </div>

        <button
          className="w-full h-[44px] rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-[#a855f7] to-[#7c3aed]"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Placing wager...' : 'Place Lottery'}
        </button>

      </form>
    </div>
  );
}