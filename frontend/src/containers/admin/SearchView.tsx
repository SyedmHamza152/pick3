'use client';

import React, { useState } from 'react';
import { api, fmtDate, fmtRiyal } from '@/utils/api';

interface SearchWinnerItem {
  username?: string;
  user_id: number;
  phone?: string;
  numbers: string;
  prize_amount: number;
  created_at: string;
}

export default function SearchView() {
  // Filter state hooks matching your exact input elements
  const [searchN, setSearchN] = useState<string>('');
  const [searchFrom, setSearchFrom] = useState<string>('');
  const [searchTo, setSearchTo] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Result tables state tracking variables
  const [straightMatches, setStraightMatches] = useState<SearchWinnerItem[]>([]);
  const [rumbleMatches, setRumbleMatches] = useState<SearchWinnerItem[]>([]);

  // System notification message alert holders
  const [msgText, setMsgText] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showMsg, setShowMsg] = useState<boolean>(false);

  const displayMessage = (text: string, success: boolean = false) => {
    setMsgText(text);
    setIsSuccess(success);
    setShowMsg(true);
  };

  // 🔍 1. Execute Dynamic Query Search Logic
  const doSearch = async () => {
    if (!searchN.trim()) {
      displayMessage('Please enter a search number parameter first.');
      return;
    }

    setLoading(true);
    setShowMsg(false);
    try {
      const params = new URLSearchParams();
      params.append('number', searchN.trim());
      if (searchFrom) params.append('date_from', searchFrom);
      if (searchTo) params.append('date_to', searchTo);

      const data = await api(`/api/admin/winners/search?${params.toString()}`);
      
      // Separate straight and rumble records exactly from returned payload query
      setStraightMatches(data.straight || []);
      setRumbleMatches(data.rumble || []);
    } catch (err: any) {
      displayMessage(err.message || 'An error occurred during query execution.');
    } finally {
      setLoading(false);
    }
  };

  // 🧹 2. Clear Date Parameters Action
  const clearSearchFilters = () => {
    setSearchFrom('');
    setSearchTo('');
  };

  return (
    <div className="bg-[#17171f] border border-[#2a2a3a] rounded-[16px] p-8 max-w-[1200px] mx-auto shadow-md">
      <div className="mb-4">
        <h3 className="font-space text-[20px] font-bold text-[#f1f0ff] mb-1">Search winners</h3>
        <p className="text-[#7b7a95] text-[14px]">
          Enter a number. 3 digits → exact straight + rumble (any order). 1–2 digits → any winner containing those digits. Optionally filter by announcement date.
        </p>
      </div>

      {/* Dynamic Status Alert Banner */}
      {showMsg && (
        <div className={`p-4 rounded-xl text-[13.5px] font-medium mb-4 border transition-all ${
          isSuccess 
            ? 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)] text-[#6ee7b7]' 
            : 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)] text-[#fca5a5]'
        }`}>
          {msgText}
        </div>
      )}

      {/* ── FILTERING DATA TOOLBAR STRIP ── */}
      <div className="flex flex-wrap items-center gap-3 bg-[#1e1e2a] p-4 border border-[#2a2a3a] rounded-[12px] mb-6">
        <input 
          id="searchN" 
          className="bg-[#17171f] border border-[#2a2a3a] text-[#f1f0ff] px-4 py-2 rounded-xl text-sm outline-none focus:border-[#a855f7] max-w-[160px]" 
          placeholder="e.g. 456 or 4"
          value={searchN}
          onChange={(e) => setSearchN(e.target.value)}
        />
        
        <label className="text-[13px] font-medium text-[#7b7a95] flex items-center gap-2 normal-case tracking-normal">
          From
          <input 
            id="searchFrom" 
            type="date" 
            className="bg-[#17171f] border border-[#2a2a3a] text-[#f1f0ff] px-3 py-1.5 rounded-xl text-sm outline-none focus:border-[#a855f7] max-w-[160px]"
            value={searchFrom}
            onChange={(e) => setSearchFrom(e.target.value)}
          />
        </label>
        
        <label className="text-[13px] font-medium text-[#7b7a95] flex items-center gap-2 normal-case tracking-normal">
          To
          <input 
            id="searchTo" 
            type="date" 
            className="bg-[#17171f] border border-[#2a2a3a] text-[#f1f0ff] px-3 py-1.5 rounded-xl text-sm outline-none focus:border-[#a855f7] max-w-[160px]"
            value={searchTo}
            onChange={(e) => setSearchTo(e.target.value)}
          />
        </label>
        
        <button 
          className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-br from-[#a855f7] to-[#7c3aed] text-white cursor-pointer shadow-md disabled:opacity-50 h-[38px]"
          onClick={doSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        
        <button 
          className="px-5 py-2 bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] font-semibold text-xs rounded-xl cursor-pointer hover:bg-[#242433] transition-colors whitespace-nowrap h-[38px]"
          type="button" 
          onClick={clearSearchFilters}
        >
          Clear dates
        </button>
      </div>

      {/* ── STRAIGHT MATCHES LOG GRID TABLE ── */}
      <div className="mt-5">
        <h4 className="text-[14px] font-bold text-[#f1f0ff] mb-2.5">Straight matches</h4>
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full border-collapse text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-[#2a2a3a]">
                <th className="text-left pb-3 text-[11.5px] font-semibold uppercase tracking-wider text-[#7b7a95]">User</th>
                <th className="text-left pb-3 text-[11.5px] font-semibold uppercase tracking-wider text-[#7b7a95]">Phone</th>
                <th className="text-left pb-3 text-[11.5px] font-semibold uppercase tracking-wider text-[#7b7a95]">Numbers</th>
                <th className="text-left pb-3 text-[11.5px] font-semibold uppercase tracking-wider text-[#7b7a95]">Prize</th>
                <th className="text-left pb-3 text-[11.5px] font-semibold uppercase tracking-wider text-[#7b7a95]">Date</th>
              </tr>
            </thead>
            <tbody id="srStraight" className="divide-y divide-[#2a2a3a]/40">
              {straightMatches.length > 0 ? (
                straightMatches.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#1e1e2a]/50 transition-colors">
                    <td className="py-4 text-[#f1f0ff]">@{item.username || item.user_id}</td>
                    <td className="py-4 text-[#7b7a95]">{item.phone || '—'}</td>
                    <td className="py-4 text-[#a855f7] font-bold tracking-wider">{item.numbers}</td>
                    <td className="py-4 text-[#10b981] font-bold">{fmtRiyal(item.prize_amount)}</td>
                    <td className="py-4 text-[#7b7a95] whitespace-nowrap">{fmtDate(item.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-[#7b7a95] italic">No straight matches returned.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── RUMBLE MATCHES LOG GRID TABLE ── */}
      <div className="mt-6">
        <h4 className="text-[14px] font-bold text-[#f1f0ff] mb-2.5">Rumble matches</h4>
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full border-collapse text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-[#2a2a3a]">
                <th className="text-left pb-3 text-[11.5px] font-semibold uppercase tracking-wider text-[#7b7a95]">User</th>
                <th className="text-left pb-3 text-[11.5px] font-semibold uppercase tracking-wider text-[#7b7a95]">Phone</th>
                <th className="text-left pb-3 text-[11.5px] font-semibold uppercase tracking-wider text-[#7b7a95]">Numbers</th>
                <th className="text-left pb-3 text-[11.5px] font-semibold uppercase tracking-wider text-[#7b7a95]">Prize</th>
                <th className="text-left pb-3 text-[11.5px] font-semibold uppercase tracking-wider text-[#7b7a95]">Date</th>
              </tr>
            </thead>
            <tbody id="srRumble" className="divide-y divide-[#2a2a3a]/40">
              {rumbleMatches.length > 0 ? (
                rumbleMatches.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#1e1e2a]/50 transition-colors">
                    <td className="py-4 text-[#f1f0ff]">@{item.username || item.user_id}</td>
                    <td className="py-4 text-[#7b7a95]">{item.phone || '—'}</td>
                    <td className="py-4 text-[#a855f7] font-bold tracking-wider">{item.numbers}</td>
                    <td className="py-4 text-[#10b981] font-bold">{fmtRiyal(item.prize_amount)}</td>
                    <td className="py-4 text-[#7b7a95] whitespace-nowrap">{fmtDate(item.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-[#7b7a95] italic">No rumble matches returned.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
