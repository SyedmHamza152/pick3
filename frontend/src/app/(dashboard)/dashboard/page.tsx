'use client';

import React, { useState, useEffect } from 'react';
import GetStarted from '@/containers/dashboard/GetStarted';
import MyTickets from '@/containers/dashboard/MyTickets';
import RecentWinners from '@/containers/dashboard/RecentWinners';
import { api, fmtRiyal, auth } from '@/utils/api';

interface DashboardProps {
  activeTab?: string;
}

export default function Dashboard({ activeTab = 'dashboard' }: DashboardProps) {
  const [balance, setBalance] = useState<number>(0.00);
  const [username, setUsername] = useState<string>('username');
  const [publicId, setPublicId] = useState<string>('');

  useEffect(() => {
    // Load user data from auth
    if (auth.user) {
      setUsername(auth.user.username || 'username');
      setPublicId(auth.user.public_id || '');
      setBalance(auth.user.account_balance || 0);
    }
  }, []);

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      
      {/* ── 1. MAIN OVERVIEW LOBBY VIEW ── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="bg-[#17171f] border border-[#2a2a3a] rounded-2xl p-6 shadow-sm">
            <h2 className="font-space text-2xl font-bold text-white mb-1">Account Overview</h2>
            <p className="text-white/60 text-sm mb-4">Welcome back to your live dashboard monitor</p>
            <div className="text-[30px] font-bold font-space text-[#10b981] mb-4">
              {fmtRiyal(balance)}
            </div>
            <div className="border-t border-[#2a2a3a]/60 pt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/40 block mb-1">Your ID</label>
              <div className="text-lg font-semibold text-[#f1f0ff]">{publicId || `@${username}`}</div>
            </div>
          </div>
          <GetStarted />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MyTickets />
            <RecentWinners />
          </div>
        </div>
      )}

      {/* ── 2. WALLET CONTAINER PLACEHOLDER ── */}
      {activeTab === 'wallet' && (
        <div className="bg-[#17171f] border border-[#2a2a3a] rounded-2xl p-6">
          <h3 className="font-space text-xl font-bold text-white">My Wallet Ledger</h3>
          <p className="text-sm text-[#7b7a95] mt-1">Wallet information card parameters go here safely.</p>
        </div>
      )}

      {/* ── 3. RECHARGE CONTAINER PLACEHOLDER ── */}
      {activeTab === 'recharge' && (
        <div className="bg-[#17171f] border border-[#2a2a3a] rounded-2xl p-6">
          <h3 className="font-space text-xl font-bold text-white">Recharge Balance</h3>
          <p className="text-sm text-[#7b7a95] mt-1">Deposit gateway options go here safely.</p>
        </div>
      )}

      {/* ── 4. WITHDRAW CONTAINER PLACEHOLDER ── */}
      {activeTab === 'withdraw' && (
        <div className="bg-[#17171f] border border-[#2a2a3a] rounded-2xl p-6">
          <h3 className="font-space text-xl font-bold text-white">Request Cashout</h3>
          <p className="text-sm text-[#7b7a95] mt-1">Withdraw payment parameters go here safely.</p>
        </div>
      )}

      {/* ── 5. PLAY GAMES LOBBY PLACEHOLDER ── */}
      {activeTab === 'play' && (
        <div className="bg-[#17171f] border border-[#2a2a3a] rounded-2xl p-6">
          <h3 className="font-space text-xl font-bold text-white">Play Games</h3>
          <p className="text-sm text-[#7b7a95] mt-1">Active draw ticket purchase forms go here safely.</p>
        </div>
      )}

    </div>
  );
}
