'use client';

import React, { useState, useEffect } from 'react';
import { api, fmtRiyal, fmtDate } from '@/utils/api';

interface TransactionItem {
  deposit_id: number;
  amount_pkr: number;
  amount_riyal: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await api('/api/deposits/mine', { auth: true });
        setTransactions(data || []);
      } catch (err) {
        console.error('Failed to load transaction logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-fade-in">
      <div className="bg-[#17171f] border border-[#2a2a3a] rounded-2xl p-8 shadow-sm">
        
        {/* ── CARD HEADER ── */}
        <h2 className="font-space text-2xl font-bold text-[#f1f0ff] mb-6">
          Transaction Summary
        </h2>

        {/* ── TRANSACTIONS RECORD TABLE ── */}
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full border-collapse text-xs min-w-[500px]">
            <thead>
              <tr className="border-b border-[#2a2a3a]">
                <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">ID</th>
                <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">Type</th>
                <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">Amount</th>
                <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">Status</th>
                <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7b7a95]">Date</th>
              </tr>
            </thead>
            <tbody id="txnRows" className="divide-y divide-[#2a2a3a]/40">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#7b7a95] animate-pulse">
                    Loading account ledger records...
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((tx, idx) => {
                  return (
                    <tr key={tx.deposit_id || idx} className="hover:bg-[#1e1e2a]/40 transition-colors">
                      <td className="py-3.5 text-[#f1f0ff] font-mono">
                        #{tx.deposit_id || idx + 1}
                      </td>
                      <td className="py-3.5 text-[#f1f0ff] font-medium capitalize">
                        Deposit
                      </td>
                      <td className="py-3.5 font-bold text-[#10b981]">
                        + {fmtRiyal(tx.amount_riyal)}
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                          tx.status === 'approved'
                            ? 'bg-[#10b981]/15 text-[#10b981]'
                            : tx.status === 'rejected'
                            ? 'bg-[#ef4444]/15 text-[#ef4444]'
                            : 'bg-amber-500/15 text-amber-500' // 'pending'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-[#7b7a95] whitespace-nowrap">
                        {fmtDate(tx.created_at)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#7b7a95] italic">
                    No transaction entries found.
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
