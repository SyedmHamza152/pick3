'use client';

import React, { useState } from 'react';
import { api, fmtRiyal } from '@/utils/api';

export default function WalletView() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addAmount, setAddAmount] = useState<string>('');
  const [deductAmount, setDeductAmount] = useState<string>('');

  const [userData, setUserData] = useState<{
    memberId: string;
    username: string;
    phone: string;
    balance: number | string;
  } | null>(null);

  const [msgText, setMsgText] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showMsg, setShowMsg] = useState<boolean>(false);

  const displayMessage = (text: string, success: boolean = false) => {
    setMsgText(text);
    setIsSuccess(success);
    setShowMsg(true);
  };

  const handleLookupUser = async () => {
    setShowMsg(false);
    if (!searchQuery.trim()) {
      displayMessage('Please enter a user or member ID to search');
      return;
    }
    try {
      const data = await api(`/api/admin/balance/lookup?user_id=${encodeURIComponent(searchQuery.trim())}`, { auth: true });
      setUserData({
        memberId: data.public_id || '—',
        username: data.username || '—',
        phone: data.phone || '—',
        balance: data.account_balance !== undefined ? fmtRiyal(data.account_balance) : '—'
      });
    } catch (err: any) {
      setUserData(null);
      displayMessage(err.message || 'User not found');
    }
  };

  const handleApproveAdd = async () => {
    setShowMsg(false);
    if (!addAmount || Number(addAmount) <= 0) {
      displayMessage('Please enter a valid positive amount');
      return;
    }
    try {
      const memberIdToUse = userData ? userData.memberId : searchQuery.trim();
      await api(`/api/admin/balance/add`, {
        method: 'POST',
        body: { user_id: memberIdToUse, amount: Number(addAmount) },
        auth: true
      });
      displayMessage('Balance approved and added successfully!', true);
      setAddAmount('');
      if (userData) handleLookupUser();
    } catch (err: any) {
      displayMessage(err.message);
    }
  };

  const handleDeductBalance = async () => {
    setShowMsg(false);
    if (!deductAmount || Number(deductAmount) <= 0) {
      displayMessage('Please enter a valid positive amount');
      return;
    }
    try {
      const memberIdToUse = userData ? userData.memberId : searchQuery.trim();
      await api(`/api/admin/balance/deduct`, {
        method: 'POST',
        body: { user_id: memberIdToUse, amount: Number(deductAmount) },
        auth: true
      });
      displayMessage('Balance deducted from wallet successfully!', true);
      setDeductAmount('');
      if (userData) handleLookupUser();
    } catch (err: any) {
      displayMessage(err.message);
    }
  };

  return (
    <div className="bg-[#17171f] border border-[#2a2a3a] rounded-[16px] p-8 max-w-6xl mx-auto shadow-md">

      {/* ── CARD HEADER TITLE ── */}
      <div className="mb-6">
        <h3 className="font-sans text-[20px] font-bold text-[#f1f0ff] mb-1">Adjust wallet balance</h3>
        <p className="text-[#7b7a95] text-[14px]">
          Enter a member ID (e.g. LOT000042), numeric user id, or username. Look up the user, then add or deduct SAR from their wallet.
        </p>
      </div>

      {/* Dynamic Status Alert Message Box */}
      {showMsg && (
        <div className={`p-3 rounded-xl text-xs font-medium mb-4 border ${isSuccess ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#6ee7b7]' : 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#fca5a5]'
          }`}>
          {msgText}
        </div>
      )}

      {/* ── USER CHECK LOOKUP FIELD ── */}
      <div className="flex gap-4 items-end mb-6">
        <div className="w-[45%]">
          <label className="block text-[12px] font-bold text-[#7b7a95] mb-2 uppercase tracking-[0.5px]">
            USER ID / MEMBER ID
          </label>
                    <input
            id="balUserId"
            className="w-full bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] px-4 py-3 rounded-[12px] text-[15px] outline-none placeholder:text-[#7b7a95]/40 focus:border-[#a855f7]"
            placeholder="LOT000042"
            value={searchQuery || 'LOT'} // Fallback defaults to 'LOT' so it's visible instantly
            onChange={(e) => {
              let inputVal = e.target.value;

              // 1. Force the string to always start with 'LOT' (case-insensitive conversion)
              if (!inputVal.toUpperCase().startsWith('LOT')) {
                // If they try to clear or overwrite it, append their input to 'LOT'
                const cleanDigits = inputVal.replace(/[^0-9]/g, ''); // Extract numbers only
                inputVal = `LOT${cleanDigits}`;
              } else {
                // 2. If it starts with 'LOT', ensure anything typed after it is strictly numbers
                const prefix = inputVal.substring(0, 3).toUpperCase(); // Keep 'LOT' safe
                const remainder = inputVal.substring(3).replace(/[^0-9]/g, ''); // Clear non-digits
                inputVal = `${prefix}${remainder}`;
              }

              // 3. Update the state variable with the forced 'LOT' structure
              setSearchQuery(inputVal);
            }}
          />

        </div>
      </div>
      <button
        className="px-4 py-2 bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] font-semibold text-[13px] rounded-lg cursor-pointer hover:border-[#a855f7] transition-colors "
        type="button"
        onClick={handleLookupUser}
      >
        Look up user
      </button>

      {/* ── USER DETAILS DISPLAY ── */}
      {userData && (
        <div className="mt-6 p-4 bg-[#1e1e2a] border border-[#2a2a3a] rounded-xl">
          <h4 className="text-[14px] font-bold text-[#f1f0ff] mb-3">User Details</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#7b7a95] block mb-1">Member ID</span>
              <span className="text-[#f1f0ff] font-mono">{userData.memberId}</span>
            </div>
            <div>
              <span className="text-[#7b7a95] block mb-1">Username</span>
              <span className="text-[#f1f0ff]">{userData.username}</span>
            </div>
            <div>
              <span className="text-[#7b7a95] block mb-1">Phone</span>
              <span className="text-[#f1f0ff]">{userData.phone}</span>
            </div>
            <div>
              <span className="text-[#7b7a95] block mb-1">Current Balance</span>
              <span className="text-[#10b981] font-bold">{userData.balance}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── OPERATION FIELDS GRID LAYOUT (Solid Colors with exact height specs) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-3">

        {/* ADD CONTAINER BLOCK */}
        <div className="flex flex-col space-y-2">
          <h4 className="text-[16px] font-bold text-[#f1f0ff] m-0">Add balance</h4>
          <label className="block text-[12px] font-bold text-[#7b7a95] uppercase tracking-[0.5px]">AMOUNT (SAR)</label>
          <input
            id="balAddAmount"
            className="w-full bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] px-4 py-3 rounded-[12px] text-[15px] outline-none placeholder:text-[#7b7a95]/40 focus:border-[#10b981]"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g. 100"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
          />
          <div className="pt-2">
            <button
              className="w-full h-11.5 inline-flex items-center justify-center rounded-xl text-[14.5px] font-bold text-white cursor-pointer bg-[#10b981] hover:bg-[#059669] transition-colors border-none "
              type="button"
              onClick={handleApproveAdd}
            >
              Approve &amp; add to wallet
            </button>
          </div>
        </div>

        {/* DEDUCT CONTAINER BLOCK */}
        <div className="flex flex-col space-y-2">
          <h4 className="text-[16px] font-bold text-[#f1f0ff] m-0">Deduct balance</h4>
          <label className="block text-[12px] font-bold text-[#7b7a95] uppercase tracking-[0.5px]">AMOUNT (SAR)</label>
          <input
            id="balDeductAmount"
            className="w-full bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] px-4 py-3 rounded-[12px] text-[15px] outline-none placeholder:text-[#7b7a95]/40 focus:border-[#ef4444]"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g. 50"
            value={deductAmount}
            onChange={(e) => setDeductAmount(e.target.value)}
          />
          <div className="pt-2">
            <button
              className="w-full h-[46px] inline-flex items-center justify-center rounded-[12px] text-[14.5px] font-bold text-white cursor-pointer bg-[#ef4444] hover:bg-[#dc2626] transition-colors border-none shadow-[0_4px_14px_rgba(239,68,68,0.2)]"
              type="button"
              onClick={handleDeductBalance}
            >
              Deduct from wallet
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
