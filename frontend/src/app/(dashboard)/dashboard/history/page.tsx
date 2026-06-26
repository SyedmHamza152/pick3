'use client';

import React, { useState, useEffect } from 'react';
import { api, fmtRiyal, fmtDate } from '@/utils/api';

interface HistoryTicket {
  ticket_id: number | string;
  numbers: string; // e.g. "3 - 7 - 2" or "372"
  ticket_type: 'straight' | 'rumble';
  amount_wagered: number;
  status: 'active' | 'won' | 'lost';
  created_at: string;
}

export default function HistoryPage() {
  const [tickets, setTickets] = useState<HistoryTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api('/api/tickets/mine', { auth: true });
        setTickets(data || []);
      } catch (err) {
        console.error('Failed to look up ticket history logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-fade-in">
      <div className="bg-[#17171f] border border-[#2a2a3a] rounded-2xl p-8 shadow-sm">
        
        {/* ── CARD HEADER ── */}
        <h2 className="font-space text-2xl font-bold text-[#f1f0ff] mb-6">
          My Lottery Play History
        </h2>

        {/* ── TICKETS RECORD DATA TABLE ── */}
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full border-collapse text-xs min-w-[600px]">
            <thead>
              <tr className="border-b border-[#2a2a3a]">
                <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">#</th>
                <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">Numbers</th>
                <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">Type</th>
                <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">Wager</th>
                <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">Status</th>
                <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">Date</th>
              </tr>
            </thead>
            <tbody id="historyRows" className="divide-y divide-[#2a2a3a]/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#7b7a95] animate-pulse">
                    Loading historical ticket entries...
                  </td>
                </tr>
              ) : tickets.length > 0 ? (
                tickets.map((t, idx) => (
                  <tr key={t.ticket_id || idx} className="hover:bg-[#1e1e2a]/40 transition-colors">
                    <td className="py-3.5 text-[#f1f0ff] font-mono">
                      #{t.ticket_id || idx + 1}
                    </td>
                    <td className="py-3.5 text-[#a855f7] font-bold tracking-widest text-sm">
                      {t.numbers}
                    </td>
                    <td className="py-3.5 text-[#f1f0ff]/80 capitalize">
                      {t.ticket_type}
                    </td>
                    <td className="py-3.5 text-[#f1f0ff] font-medium">
                      {fmtRiyal(t.amount_wagered)}
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                        t.status === 'won'
                          ? 'bg-[#10b981]/15 text-[#10b981]'
                          : t.status === 'lost'
                          ? 'bg-[#ef4444]/15 text-[#ef4444]'
                          : 'bg-amber-500/15 text-amber-500' // 'active'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-[#7b7a95] whitespace-nowrap">
                      {fmtDate(t.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#7b7a95] italic">
                    No play history records found.
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
