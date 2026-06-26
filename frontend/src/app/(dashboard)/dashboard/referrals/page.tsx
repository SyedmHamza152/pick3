'use client';

import React, { useState, useEffect } from 'react';
import { api, fmtDate } from '@/utils/api';

interface ReferralUser {
  public_id: string;
  username: string;
  created_at: string;
  status: string; // e.g. "active", "pending"
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // No loading since no API call

  // Referrals feature not implemented in backend yet
  // Remove API call and show empty state

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-fade-in">
      <div className="bg-[#17171f] border border-[#2a2a3a] rounded-2xl p-8 shadow-sm">
        
        {/* ── CARD HEADER ── */}
        <h2 className="font-space text-2xl font-bold text-[#f1f0ff] mb-6">
          Referrals List
        </h2>

        {/* ── REFERRALS RECORD DATA TABLE ── */}
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full border-collapse text-xs min-w-[500px]">
            <thead>
              <tr className="border-b border-[#2a2a3a]">
                <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">User ID</th>
                <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">Username</th>
                <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">Joined</th>
                <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">Status</th>
              </tr>
            </thead>
            <tbody id="referralRows" className="divide-y divide-[#2a2a3a]/40">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#7b7a95] animate-pulse">
                    Loading referrals records log lists...
                  </td>
                </tr>
              ) : referrals.length > 0 ? (
                referrals.map((ref, idx) => (
                  <tr key={ref.public_id || idx} className="hover:bg-[#1e1e2a]/40 transition-colors">
                    <td className="py-3.5 text-[#a855f7] font-semibold font-mono">
                      {ref.public_id}
                    </td>
                    <td className="py-3.5 text-[#f1f0ff] font-medium">
                      @{ref.username}
                    </td>
                    <td className="py-3.5 text-[#7b7a95] whitespace-nowrap">
                      {fmtDate(ref.created_at)}
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                        ref.status?.toLowerCase() === 'active'
                          ? 'bg-[#10b981]/15 text-[#10b981]'
                          : 'bg-amber-500/15 text-amber-500'
                      }`}>
                        {ref.status || 'active'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#7b7a95] italic">
                    No referred users linked to this account yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
