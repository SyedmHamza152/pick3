'use client';

import React, { useState, useEffect } from 'react';
import { api, fmtRiyal, fmtDate } from '@/utils/api';

interface Winner {
  winner_id: number;
  username: string;
  w1: number;
  w2: number;
  w3: number;
  ticket_type: string;
  prize_amount: number;
  announced_date: string;
}

export default function RecentWinners() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const data = await api('/api/tickets/winners', { auth: true });
        setWinners(data || []);
      } catch (err) {
        console.error('Failed to load winners:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWinners();
  }, []
);

  return (
    <div className="bg-surface border border-borderCustom rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-space text-xl font-bold text-textCustom">
          Recent Winners
        </h3>
        <span className="flex items-center gap-1.5 text-xs text-accentCustom bg-accentCustom/10 border border-accentCustom/20 px-2.5 py-1 rounded-md font-medium animate-pulse">
          ● Live Draw Data
        </span>
      </div>
      
      <div className="overflow-x-auto scrollbar-none">
        <table className="w-full border-collapse text-xs min-w-[420px]">
          <thead>
            <tr className="border-b border-borderCustom">
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">
                User
              </th>
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">
                Numbers
              </th>
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">
                Type
              </th>
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">
                Prize
              </th>
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borderCustom/40">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-textCustom/60">
                  Loading winners...
                </td>
              </tr>
            ) : winners.length > 0 ? (
              winners.map((winner) => (
                <tr key={winner.winner_id} className="hover:bg-surface2/50 transition-colors">
                  <td className="py-3 text-textCustom font-medium">
                    @{winner.username}
                  </td>
                  <td className="py-3 text-primaryCustom font-bold tracking-wider">
                    {winner.w1} - {winner.w2} - {winner.w3}
                  </td>
                  <td className="py-3 text-textCustom/80 capitalize">
                    {winner.ticket_type}
                  </td>
                  <td className="py-3 text-greenCustom font-semibold">
                    {fmtRiyal(winner.prize_amount)}
                  </td>
                  <td className="py-3 text-textCustom/60 whitespace-nowrap">
                    {fmtDate(winner.announced_date)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-6 text-center text-textCustom/60">
                  No winners yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
