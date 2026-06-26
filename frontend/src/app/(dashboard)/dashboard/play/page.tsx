'use client';

import React, { useState, useEffect } from 'react';
import { api, fmtRiyal, getCurrency } from '@/utils/api';

export default function PlayPage() {
  // Game Selection states
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [selectedGame, setSelectedGame] = useState<string>(''); // '3up' or empty

  // Form input states
  const [n1, setN1] = useState<string>('');
  const [n2, setN2] = useState<string>('');
  const [n3, setN3] = useState<string>('');
  const [ticketType, setTicketType] = useState<string>('straight');
  const [wager, setWager] = useState<string>('');
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

  // 💰 Live Cashback Deduction Calculator hint display
  const getWagerHint = () => {
    const numWager = Number(wager);
    if (!numWager || numWager <= 0) return '';
    const actualDeduction = numWager * 0.57; // 43% instant cashback return rule
    return `🎁 43% Instant Cashback: Only ${fmtRiyal(actualDeduction)} will be deducted from your account.`;
  };

  const handlePlaceBet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowMsg(false);

    if (n1 === '' || n2 === '' || n3 === '') {
      displayMessage('Please pick all three digits for your game selection entry.');
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        n1: Number(n1),
        n2: Number(n2),
        n3: Number(n3),
        ticket_type: ticketType,
        amount_wagered: Number(wager),
      };

      await api('/api/tickets/', {
        method: 'POST',
        body,
        auth: true
      });

      displayMessage('Bet placed successfully! Good luck!', true);
      
      // Clear inputs
      setN1('');
      setN2('');
      setN3('');
      setWager('');
    } catch (err: any) {
      displayMessage(err.message || 'Failed to place bet. Please verify balance entries.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-fade-in">
      <div className="bg-[#17171f] border border-[#2a2a3a] rounded-2xl p-8 shadow-sm">
        
        {/* ── CARD HEADER ── */}
        <h2 className="font-space text-2xl font-bold text-[#f1f0ff] mb-2">
          Play Games
        </h2>
        <p className="text-[#7b7a95] text-sm mb-6">
          Select a game from the dropdown below to start playing.
        </p>

        {/* ── DYNAMIC CUSTOM DROPDOWN MECHANICS ── */}
        <div className="relative max-w-md z-30">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] px-4 py-3 rounded-xl text-sm font-medium cursor-pointer hover:bg-[#242433] transition-colors"
          >
            <span>{selectedGame === '3up' ? '🎯 3UP Lottery' : 'Select a Game'}</span>
            <span className={`text-xs transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-[105%] left-0 right-0 bg-[#1e1e2a] border border-[#2a2a3a] rounded-xl shadow-xl overflow-hidden animate-fade-down">
              <button
                type="button"
                onClick={() => {
                  setSelectedGame('3up');
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-4 p-4 hover:bg-[#242433] transition-colors text-left cursor-pointer bg-transparent border-none"
              >
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="font-semibold text-[#f1f0ff] text-sm">3UP Lottery</div>
                  <div className="text-xs text-[#7b7a95] mt-0.5">Pick 3 numbers - Win big prizes!</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* ── ALERTS BANNER ── */}
        {showMsg && (
          <div className={`p-4 rounded-xl text-[13.5px] font-medium my-4 border transition-all ${
            isSuccess 
              ? 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)] text-[#6ee7b7]' 
              : 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)] text-[#fca5a5]'
          }`}>
            {msgText}
          </div>
        )}

        {/* ── GAME PLAY ENTRY PLAYGROUND AREA ── */}
        {selectedGame === '3up' && (
          <div className="mt-8 pt-6 border-t border-[#2a2a3a]/40 animate-fade-in">
            <form onSubmit={handlePlaceBet} className="space-y-6">
              <div>
                <h3 className="font-space text-xl font-bold text-[#f1f0ff] mb-1">3UP Lottery</h3>
                <p className="text-[#7b7a95] text-xs">Pick 3 numbers (0-9) and choose your bet type</p>
              </div>

              {/* 3 Number Picker Input Fields Block Row */}
              <div>
                <label className="block text-[11px] font-bold text-[#7b7a95] mb-2 uppercase tracking-[0.5px]">
                  Pick 3 numbers
                </label>
                <div className="flex gap-4 max-w-xs">
                  <input
                    className="w-full bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] py-3 rounded-xl text-center text-xl font-bold outline-none focus:border-[#a855f7]"
                    type="number" min="0" max="9" required
                    value={n1} onChange={(e) => setN1(e.target.value)}
                  />
                  <input
                    className="w-full bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] py-3 rounded-xl text-center text-xl font-bold outline-none focus:border-[#a855f7]"
                    type="number" min="0" max="9" required
                    value={n2} onChange={(e) => setN2(e.target.value)}
                  />
                  <input
                    className="w-full bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] py-3 rounded-xl text-center text-xl font-bold outline-none focus:border-[#a855f7]"
                    type="number" min="0" max="9" required
                    value={n3} onChange={(e) => setN3(e.target.value)}
                  />
                </div>
              </div>

              {/* Configurations Fields Split Columns Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-[#7b7a95] mb-2 uppercase tracking-[0.5px]">
                    Bet Type
                  </label>
                  <select
                    className="w-full h-[44px] bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] px-4 rounded-xl text-sm outline-none cursor-pointer appearance-none"
                    value={ticketType}
                    onChange={(e) => setTicketType(e.target.value)}
                  >
                    <option value="straight">Straight (exact order) - 400x payout</option>
                    <option value="rumble">Rumble (any order) - 80x payout</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#7b7a95] mb-2 uppercase tracking-[0.5px]">
                    Wager (SAR)
                  </label>
                  <input
                    className="w-full bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] px-4 py-2.5 rounded-xl text-sm outline-none focus:border-[#a855f7]"
                    type="number" min="0.01" step="0.01" required placeholder="e.g. 1"
                    value={wager}
                    onChange={(e) => setWager(e.target.value)}
                  />
                  <p id="wagerHint2" className="text-[#10b981] mt-2 text-xs font-medium min-h-[16px]">
                    {getWagerHint()}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  className="w-full h-[44px] inline-flex items-center justify-center rounded-xl text-sm font-semibold text-white cursor-pointer bg-gradient-to-br from-[#a855f7] to-[#7c3aed] border-none shadow-[0_4px_14px_rgba(168,85,247,0.3)] hover:shadow-[0_6px_18px_rgba(168,85,247,0.45)] hover:-translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none transition-all"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Placing wager item...' : 'Place Bet'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
