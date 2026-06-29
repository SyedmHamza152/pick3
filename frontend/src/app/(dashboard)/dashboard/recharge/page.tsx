'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api, getCurrency } from '@/utils/api';
import RechargeForm from '@/containers/dashboard/recharge/RechargeForm';
import RechargeHistory from '@/containers/dashboard/recharge/RechargeHistory';

interface DepositLog {
  deposit_id: number;
  amount_pkr: number;
  amount_riyal: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function RechargePage() {
  const [rate, setRate] = useState<number>(75);
  const [depositRows, setDepositRows] = useState<DepositLog[]>([]);

  const loadPageData = useCallback(async () => {
    try {
      const currencyConfig = await getCurrency();
      if (currencyConfig?.pkr_per_riyal) {
        setRate(currencyConfig.pkr_per_riyal);
      }

      const data = await api('/api/deposits/mine', { auth: true });
      setDepositRows(data || []);
    } catch {}
  }, []);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-fade-in space-y-6">
      <div className="bg-[#17171f] border border-[#2a2a3a] rounded-2xl p-8 shadow-sm">

        <h2 className="font-space text-2xl font-bold text-[#f1f0ff] mb-2">
          Deposit Funds
        </h2>

        <p className="text-[#7b7a95] text-sm mb-6 leading-relaxed">
          Send via JazzCash on <span className="text-[#f59e0b] font-semibold">(03072000904)</span> in PKR (any amount), take a screenshot, then upload. After approval it converts to Riyal in your wallet.
        </p>

        {/* FORM HANDLES EVERYTHING ITSELF */}
        <RechargeForm rate={rate} onSuccess={loadPageData} />

        {/* HISTORY ONLY */}
        <RechargeHistory depositRows={depositRows} />

      </div>
    </div>
  );
}