'use client';

import React from 'react';
import { fmtPkr, fmtRiyal, fmtDate } from '@/utils/api';

interface DepositLog {
    deposit_id: number;
    amount_pkr: number;
    amount_riyal: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

type Props = {
    depositRows: DepositLog[];
};

export default function RechargeHistory({ depositRows }: Props) {
    return (
        <div className="pt-8 mt-4 border-t border-[#2a2a3a]/40">
          <h3 className="font-space text-lg font-bold text-[#f1f0ff] mb-4">
            My Deposits
          </h3>
          
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full border-collapse text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-[#2a2a3a]">
                  <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">ID</th>
                  <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">PKR</th>
                  <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">SAR (on approval)</th>
                  <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">Status</th>
                  <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">Date</th>
                </tr>
              </thead>
              <tbody id="depRows" className="divide-y divide-[#2a2a3a]/40">
                {depositRows.length > 0 ? (
                  depositRows.map((d) => (
                    <tr key={d.deposit_id} className="hover:bg-[#1e1e2a]/40 transition-colors">
                      <td className="py-3.5 text-[#f1f0ff] font-mono">#{d.deposit_id}</td>
                      <td className="py-3.5 text-[#f1f0ff] font-medium">{fmtPkr(d.amount_pkr)}</td>
                      <td className="py-3.5 text-[#10b981] font-bold">{fmtRiyal(d.amount_riyal)}</td>
                      <td className="py-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                          d.status === 'approved' 
                            ? 'bg-[#10b981]/15 text-[#10b981]' 
                            : d.status === 'rejected' 
                            ? 'bg-[#ef4444]/15 text-[#ef4444]' 
                            : 'bg-amber-500/15 text-amber-500'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-[#7b7a95] whitespace-nowrap">{fmtDate(d.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[#7b7a95] italic">
                      No deposit records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
    );
}