'use client';

import React, { useState, useEffect } from 'react';
import { api, fmtRiyal } from '@/utils/api';

interface ReportMetrics {
  straight_total: number;
  rumble_total: number;
  overall_total: number;
  straight_count: number;
  rumble_count: number;
  total_count: number;
}

export default function ReportsView() {
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);

  const [msgText, setMsgText] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showMsg, setShowMsg] = useState<boolean>(false);

  const displayMessage = (text: string, success: boolean = false) => {
    setMsgText(text);
    setIsSuccess(success);
    setShowMsg(true);
  };

  const loadReports = async () => {
    setLoading(true);
    setShowMsg(false);
    try {
      let url = '/api/admin/reports';
      const params = new URLSearchParams();
      if (fromDate) params.append('date_from', fromDate);
      if (toDate) params.append('date_to', toDate);
      if (params.toString()) url += `?${params.toString()}`;

      const data = await api(url, { auth: true });
      setMetrics({
        straight_total: data.straight_total ?? 0,
        rumble_total: data.rumble_total ?? 0,
        overall_total: data.overall_total ?? 0,
        straight_count: data.straight_count ?? 0,
        rumble_count: data.rumble_count ?? 0,
        total_count: data.total_count ?? 0,
      });
    } catch (err: any) {
      displayMessage(err.message || 'Failed to aggregate lottery system logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const clearReportFilters = () => {
    setFromDate('');
    setToDate('');
  };

  return (
    <div className="bg-surface border border-borderCustom rounded-2xl p-6 mb-6 shadow-sm">
      <div className="mb-4">
        <h3 className="font-space text-xl font-bold text-textCustom">Lottery Play Reports</h3>
        <p className="text-mutedCustom text-sm mt-1">
          View total amounts and bet counts for Straight PT and Rumble lotteries. Amounts are based on actual deducted amounts (57% of wager after 43% cashback).
        </p>
      </div>

      {showMsg && (
        <div className={`p-4 rounded-xl text-[13.5px] font-medium mb-4 border transition-all ${
          isSuccess 
            ? 'bg-greenCustom/10 border-greenCustom/30 text-[#6ee7b7]' 
            : 'bg-redCustom/10 border-redCustom/30 text-[#fca5a5]'
        }`}>
          {msgText}
        </div>
      )}

      {/* ── FILTERING DATA TOOLBAR STRIP ── */}
      <div className="flex flex-wrap items-center gap-3 bg-surface2/40 p-4 border border-borderCustom rounded-xl mb-6">
        <label className="text-[13px] font-medium text-mutedCustom flex items-center gap-2 normal-case tracking-normal">
          From
          <input 
            id="reportFrom" 
            type="date" 
            className="bg-surface2 border border-borderCustom text-textCustom px-3 py-1.5 rounded-xl text-sm outline-none focus:border-primaryCustom max-w-[160px]"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </label>
        
        <label className="text-[13px] font-medium text-mutedCustom flex items-center gap-2 normal-case tracking-normal">
          To
          <input 
            id="reportTo" 
            type="date" 
            className="bg-surface2 border border-borderCustom text-textCustom px-3 py-1.5 rounded-xl text-sm outline-none focus:border-primaryCustom max-w-[160px]"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </label>
        
        <button 
          className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-br from-primaryCustom to-[#7c3aed] text-white cursor-pointer shadow-md disabled:opacity-50"
          onClick={loadReports}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
        
        <button 
          className="px-5 py-2.5 bg-surface2 text-textCustom font-semibold text-[13.5px] rounded-xl border border-borderCustom shadow-none hover:bg-surface3 transition-all cursor-pointer" 
          type="button" 
          onClick={clearReportFilters}
        >
          Clear dates
        </button>
      </div>

      {/* ── MAIN 2-COLUMN GRID WRAPPER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        
        {/* LEFT COLUMN: AMOUNT TOTALS SECTION */}
        <div>
          <h4 className="text-sm font-semibold text-textCustom m-0 mb-3">
            Amount Totals (SAR)
          </h4>
          {/* Internal 2-Column Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface2 border border-borderCustom rounded-xl p-4">
              <div className="text-[11px] font-bold text-mutedCustom uppercase tracking-widest mb-1">Straight PT Total</div>
              <div id="straightTotal" className="text-xl font-bold font-space text-textCustom">
                {metrics ? fmtRiyal(metrics.straight_total) : '—'}
              </div>
            </div>
            <div className="bg-surface2 border border-borderCustom rounded-xl p-4">
              <div className="text-[11px] font-bold text-mutedCustom uppercase tracking-widest mb-1">Rumble Total</div>
              <div id="rumbleTotal" className="text-xl font-bold font-space text-textCustom">
                {metrics ? fmtRiyal(metrics.rumble_total) : '—'}
              </div>
            </div>
            <div className="bg-surface2 border border-borderCustom rounded-xl p-4 border-l-4 border-greenCustom sm:col-span-2">
              <div className="text-[11px] font-bold text-mutedCustom uppercase tracking-widest mb-1">Overall Total</div>
              <div id="overallTotal" className="text-xl font-bold font-space text-greenCustom">
                {metrics ? fmtRiyal(metrics.overall_total) : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BET COUNTS SECTION */}
        <div>
          <h4 className="text-sm font-semibold text-textCustom m-0 mb-3">
            Bet Counts
          </h4>
          {/* Internal 2-Column Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface2 border border-borderCustom rounded-xl p-4">
              <div className="text-[11px] font-bold text-mutedCustom uppercase tracking-widest mb-1">Straight Bets</div>
              <div id="straightCount" className="text-xl font-bold font-space text-textCustom">
                {metrics ? `${metrics.straight_count} bets` : '—'}
              </div>
            </div>
            <div className="bg-surface2 border border-borderCustom rounded-xl p-4">
              <div className="text-[11px] font-bold text-mutedCustom uppercase tracking-widest mb-1">Rumble Bets</div>
              <div id="rumbleCount" className="text-xl font-bold font-space text-textCustom">
                {metrics ? `${metrics.rumble_count} bets` : '—'}
              </div>
            </div>
            <div className="bg-surface2 border border-borderCustom rounded-xl p-4 border-l-4 border-primaryCustom sm:col-span-2">
              <div className="text-[11px] font-bold text-mutedCustom uppercase tracking-widest mb-1">Total Bets</div>
              <div id="totalCount" className="text-xl font-bold font-space text-primaryCustom">
                {metrics ? `${metrics.total_count} entries` : '—'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
