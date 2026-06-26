'use client';

import React, { useState, useEffect } from 'react';
import { api, getCurrency, CurrencyConfig } from '@/utils/api';

export default function AnnounceView() {
  // Input fields state hooks matching your three distinct slots and types
  const [w1, setW1] = useState<string>('');
  const [w2, setW2] = useState<string>('');
  const [w3, setW3] = useState<string>('');
  const [ticketType, setTicketType] = useState<string>('straight');
  const [prizeAmount, setPrizeAmount] = useState<string>('');

  // Cached system currency multipliers mapping state
  const [currency, setCurrency] = useState<CurrencyConfig | null>(null);

  // Error and Success banner visibility state trackers
  const [msgText, setMsgText] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showMsg, setShowMsg] = useState<boolean>(false);

  const displayMessage = (text: string, success: boolean = false) => {
    setMsgText(text);
    setIsSuccess(success);
    setShowMsg(true);
  };

  // Fetch real database currency variables on layout mounting loop sequence
  useEffect(() => {
    getCurrency().then(c => setCurrency(c)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowMsg(false);

    // Enforce basic validation layers inside the code block context
    if (w1 === '' || w2 === '' || w3 === '') {
      displayMessage('Please fill in all three digits for winning combinations.');
      return;
    }

    try {
      const body: any = {
        w1: Number(w1),
        w2: Number(w2),
        w3: Number(w3),
        ticket_type: ticketType,
      };

      if (prizeAmount.trim()) {
        body.prize_amount = Number(prizeAmount);
      }

      const response = await api('/api/admin/winners', {
        method: 'POST',
        body,
        auth: true
      });

      const winnerCount = response.winners?.length || 0;
      if (winnerCount > 0) {
        displayMessage(`Winners announced! Found ${winnerCount} winner(s) for ${w1}${w2}${w3} (${ticketType}). Prizes distributed successfully!`, true);
      } else {
        displayMessage(`No winners found for ${w1}${w2}${w3} (${ticketType}). All tickets marked as lost.`, true);
      }
      
      // Clear numbers inputs cleanly after successful distribution
      setW1('');
      setW2('');
      setW3('');
      setPrizeAmount('');
    } catch (err: any) {
      displayMessage(err.message || 'An operational framework error occurred.');
    }
  };

  return (
    <div className="bg-[#17171f] border border-[#2a2a3a] rounded-[16px] p-8 mx-auto max-w-6xl shadow-md">
      <div className="grid grid-cols-1  gap-6 items-start">
        
        {/* Main Card Content Wrapper Box */}
        <div className="bg-[#17171f]">
          <h3 className="font-sans text-[20px] font-bold text-[#f1f0ff] mb-1">
            Announce winning numbers
          </h3>
          <div className="h-2"></div>

          {/* ── STATUS ALERT BOX ── */}
          {showMsg && (
            <div className={`p-4 rounded-xl text-[13.5px] font-medium mb-4 border transition-all duration-150 ${
              isSuccess 
                ? 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)] text-[#6ee7b7]' 
                : 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)] text-[#fca5a5]'
            }`}>
              {msgText}
            </div>
          )}

          <form onSubmit={handleSubmit} id="winForm" className="space-y-4">
            {/* Three digit layout entry slots */}
            <div>
              <label className="block text-[12px] font-bold text-[#7b7a95] mb-2 uppercase tracking-[0.5px]">
                Winning numbers (0–9 each)
              </label>
              <div className="flex gap-3">
                <input 
                  className="w-full bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] py-3 px-2 rounded-[12px] text-center text-2xl font-bold outline-none focus:border-[#a855f7]"
                  name="w1" type="number" min="0" max="9" required
                  value={w1} onChange={(e) => setW1(e.target.value)}
                />
                <input 
                  className="w-full bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] py-3 px-2 rounded-[12px] text-center text-2xl font-bold outline-none focus:border-[#a855f7]"
                  name="w2" type="number" min="0" max="9" required
                  value={w2} onChange={(e) => setW2(e.target.value)}
                />
                <input 
                  className="w-full bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] py-3 px-2 rounded-[12px] text-center text-2xl font-bold outline-none focus:border-[#a855f7]"
                  name="w3" type="number" min="0" max="9" required
                  value={w3} onChange={(e) => setW3(e.target.value)}
                />
              </div>
            </div>

            {/* Split Options Row Columns Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#7b7a95] mb-2 uppercase tracking-[0.5px]">
                  Ticket type
                </label>
                <select 
                  className="w-full h-[46px] bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] px-4 rounded-[12px] text-[15px] outline-none cursor-pointer appearance-none"
                  name="ticket_type"
                  value={ticketType}
                  onChange={(e) => setTicketType(e.target.value)}
                >
                  <option value="straight">Straight</option>
                  <option value="rumble">Rumble</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#7b7a95] mb-2 uppercase tracking-[0.5px]">
                  Prize override (SAR, optional)
                </label>
                <input 
                  className="w-full bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] px-4 py-3 rounded-[12px] text-[15px] outline-none placeholder:text-[#7b7a95]/40 focus:border-[#a855f7]"
                  name="prize_amount" type="number" min="0.01" step="0.01" 
                  placeholder="Auto: 400× straight / 80× rumble"
                  value={prizeAmount}
                  onChange={(e) => setPrizeAmount(e.target.value)}
                />
                <p className="text-[#7b7a95] mt-1.5 text-[0.85rem] font-normal leading-normal" id="prizeHint">
                  {currency ? (
                    `Leave prize blank to auto-pay each winner: ${currency.straight_prize_multiplier}× wager (straight) or ${currency.rumble_prize_multiplier}× (rumble). Deposits credit at 1 SAR = ${currency.pkr_per_riyal} PKR.`
                  ) : (
                    'Loading multipliers configuration hint data...'
                  )}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button 
                className="w-full h-[46px] inline-flex items-center justify-center rounded-[12px] text-[14.5px] font-bold text-white cursor-pointer bg-gradient-to-br from-[#a855f7] to-[#7c3aed] transition-all border-none shadow-[0_4px_14px_rgba(168,85,247,0.3)] hover:shadow-[0_6px_18px_rgba(168,85,247,0.45)] hover:-translate-y-[1px]"
                type="submit"
              >
                Mark winners
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
