'use client';

import React, { useState, useEffect } from 'react';
import { api, fmtRiyal, fmtDate } from '@/utils/api';

interface Ticket {
  ticket_id: number;
  n1: number;
  n2: number;
  n3: number;
  ticket_type: string;
  amount_wagered: number;
  status: string;
  created_at: string;
}

export default function MyTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await api('/api/tickets/mine', { auth: true });
        setTickets(data || []);
      } catch (err) {
        console.error('Failed to load tickets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div className="bg-surface border border-borderCustom rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-space text-xl font-bold text-textCustom">
          My Tickets
        </h3>
        <span className="text-xs bg-surface2 px-2.5 py-1 rounded-md text-textCustom/80 border border-borderCustom">
          Active Entries
        </span>
      </div>
      
      <div className="overflow-x-auto scrollbar-none">
        <table className="w-full border-collapse text-xs min-w-[420px]">
          <thead>
            <tr className="border-b border-borderCustom">
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">
                #
              </th>
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">
                Numbers
              </th>
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">
                Type
              </th>
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">
                Wager
              </th>
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">
                Status
              </th>
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borderCustom/40">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-textCustom/60">
                  Loading tickets...
                </td>
              </tr>
            ) : tickets.length > 0 ? (
              tickets.map((ticket) => (
                <tr key={ticket.ticket_id} className="hover:bg-surface2/50 transition-colors">
                  <td className="py-3 text-textCustom">
                    #{ticket.ticket_id}
                  </td>
                  <td className="py-3 text-textCustom font-bold tracking-wider">
                    {ticket.n1} - {ticket.n2} - {ticket.n3}
                  </td>
                  <td className="py-3 text-textCustom/80 capitalize">
                    {ticket.ticket_type}
                  </td>
                  <td className="py-3 text-textCustom">
                    {fmtRiyal(ticket.amount_wagered)}
                  </td>
                  <td className="py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                      ticket.status === 'won' 
                        ? 'bg-greenCustom/15 text-greenCustom' 
                        : ticket.status === 'lost'
                        ? 'bg-redCustom/15 text-redCustom'
                        : 'bg-amber-500/15 text-amber-500'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-3 text-textCustom/60 whitespace-nowrap">
                    {fmtDate(ticket.created_at)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-6 text-center text-textCustom/60">
                  No tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
