'use client';

import React, { useState, useEffect } from 'react';
import { api, fmtRiyal } from '@/utils/api';

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0.00);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await api('/api/deposits/balance', { auth: true });
        if (data && data.account_balance !== undefined) {
          setBalance(data.account_balance);
        }
      } catch (err) {
        console.error('Failed to load wallet balance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-fade-in">
      <div className="bg-[#17171f] border border-[#2a2a3a] rounded-2xl p-8 shadow-sm">
        
        {/* ── CARD HEADER ── */}
        <h2 className="font-space text-2xl font-bold text-[#f1f0ff] mb-2">
          My Wallet
        </h2>
        
        {/* ── BALANCE DISPLAY ── */}
        <div className="mt-6 p-6 bg-[#1e1e2a]/50 border border-[#2a2a3a] rounded-xl max-w-md">
          <span className="text-[11px] font-bold text-[#7b7a95] uppercase tracking-wider block mb-1">
            Your current balance
          </span>
          <div className="text-3xl font-bold font-space text-[#10b981]">
            {loading ? (
              <span className="text-sm text-[#7b7a95] font-normal animate-pulse">Loading balance...</span>
            ) : (
              fmtRiyal(balance)
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
