'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api, fmtPkr, fmtRiyal, fmtDate, API_BASE, auth } from '@/utils/api';

interface DepositItem {
  deposit_id: number;
  user_id: number;
  username?: string;
  public_id?: string;
  amount_pkr: number;
  amount_riyal: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function DepositsView() {
  const [filter, setFilter] = useState<string>('pending');
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Status message display states
  const [msgText, setMsgText] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showMsg, setShowMsg] = useState<boolean>(false);

  const displayMessage = (text: string, success: boolean = false) => {
    setMsgText(text);
    setIsSuccess(success);
    setShowMsg(true);
  };

  // Image blobs cache to safely fetch screenshots with credentials header
  const [imageBlobs, setImageBlobs] = useState<Record<number, string>>({});

  const loadDeposits = useCallback(async () => {
    setLoading(true);
    setShowMsg(false);
    try {
      const rows = await api(`/api/admin/deposits?status=${filter}`);
      setDeposits(rows || []);

      // Fetch screenshots as blobs to attach bearer auth header token securely
      if (rows && rows.length > 0) {
        rows.forEach(async (d: DepositItem) => {
          try {
            const imgUrl = `${API_BASE}/api/admin/deposits/${d.deposit_id}/screenshot`;
            const res = await fetch(imgUrl, {
              headers: { Authorization: `Bearer ${auth.token}` }
            });
            if (res.ok) {
              const blob = await res.blob();
              const objectUrl = URL.createObjectURL(blob);
              setImageBlobs(prev => ({ ...prev, [d.deposit_id]: objectUrl }));
            }
          } catch {
            // Silently skip if image fails to download or auth is broken
          }
        });
      }
    } catch (err: any) {
      displayMessage(err.message || 'Failed to aggregate deposit logs.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadDeposits();
  }, [loadDeposits]);

  const handleApprove = async (id: number) => {
    setShowMsg(false);
    try {
      await api(`/api/admin/deposits/${id}/approve`, { method: 'POST' });
      displayMessage(`Deposit #${id} approved successfully!`, true);
      loadDeposits();
    } catch (err: any) {
      displayMessage(err.message);
    }
  };

  const handleReject = async (id: number) => {
    setShowMsg(false);
    try {
      await api(`/api/admin/deposits/${id}/reject`, { method: 'POST' });
      displayMessage(`Deposit #${id} has been rejected.`, true);
      loadDeposits();
    } catch (err: any) {
      displayMessage(err.message);
    }
  };

  const handleDeleteScreenshot = async (id: number) => {
    if (!window.confirm(`Delete screenshot file for deposit #${id}?`)) return;
    setShowMsg(false);
    try {
      const r = await api(`/api/admin/uploads/deposit/${id}`, { method: 'DELETE' });
      displayMessage(r.file_deleted ? 'Screenshot file removed.' : 'File was already missing from server.', true);
      loadDeposits();
    } catch (err: any) {
      displayMessage(err.message);
    }
  };

  return (
    <div className="bg-surface border border-borderCustom rounded-2xl p-6 mb-6 shadow-sm">
      <div className="mb-4">
        <h3 className="font-space text-xl font-bold text-textCustom">Pending deposits</h3>
      </div>

      {/* Dynamic Status Notification Alert Box */}
      {showMsg && (
        <div className={`p-4 rounded-xl text-[13.5px] font-medium mb-4 border transition-all ${isSuccess
            ? 'bg-greenCustom/10 border-greenCustom/30 text-[#6ee7b7]'
            : 'bg-redCustom/10 border-redCustom/30 text-[#fca5a5]'
          }`}>
          {msgText}
        </div>
      )}

      {/* ── CONTROL FILTERING TOOLBAR ── */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-surface2/40 p-4 border border-borderCustom rounded-xl">
        <select
          id="depFilter"
          className="bg-surface2 border border-borderCustom text-textCustom px-4 py-2 rounded-xl text-sm outline-none focus:border-primaryCustom cursor-pointer w-full sm:w-[200px]"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>

        <button
          className="px-5 py-2.5 bg-surface3 text-textCustom font-semibold text-[13.5px] rounded-xl border border-borderCustom cursor-pointer hover:bg-surface2 transition-all disabled:opacity-50"
          onClick={loadDeposits}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

            {/* ── HIGH UTILITY RESPONSIVE CARD DASHBOARD GRID (Replaces rigid table format entirely) ── */}
      <div className="w-full">
        {deposits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {deposits.map((d) => (
              <div 
                key={d.deposit_id} 
                className="bg-surface2 border border-borderCustom/60 hover:border-primaryCustom/40 rounded-2xl p-5 shadow-sm transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                {/* 1. Card Header: Transaction Identification & Status Badge */}
                <div className="flex items-center justify-between border-b border-borderCustom/30 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-textCustom/40 uppercase tracking-wider block">ID</span>
                    <span className="text-textCustom font-mono font-bold text-sm bg-surface3 px-2 py-0.5 rounded-lg border border-borderCustom/40">
                      #{d.deposit_id}
                    </span>
                  </div>
                  
                  <span className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                    d.status === 'approved' 
                      ? 'bg-greenCustom/15 text-greenCustom' 
                      : d.status === 'rejected' 
                      ? 'bg-redCustom/15 text-redCustom' 
                      : 'bg-amber-500/15 text-amber-500'
                  }`}>
                    {d.status}
                  </span>
                </div>

                {/* 2. Main Content Layout Split Area */}
                <div className="grid grid-cols-3 gap-3 items-center py-1">
                  
                  {/* User Profile Info Segment */}
                  <div className="col-span-2 space-y-1">
                    <span className="text-textCustom/40 text-[10px] block uppercase font-bold tracking-wider">User Account</span>
                    <span className="text-textCustom font-bold block truncate text-[14px]">
                      {d.public_id || '—'}
                    </span>
                    <span className="text-textCustom/50 text-xs block truncate">
                      @{d.username || d.user_id}
                    </span>
                  </div>

                  {/* Screenshot Image Preview Segment */}
                  <div className="flex justify-end">
                    {imageBlobs[d.deposit_id] ? (
                      <a href={imageBlobs[d.deposit_id]} target="_blank" rel="noreferrer" title="Click to view full screen screenshot receipt">
                        <img 
                          className="w-[56px] h-[56px] object-cover rounded-xl border border-borderCustom hover:border-primaryCustom hover:scale-105 active:scale-95 transition-all shadow-inner shadow-black/10" 
                          src={imageBlobs[d.deposit_id]} 
                          alt="Receipt thumbnail"
                        />
                      </a>
                    ) : (
                      <div className="w-[56px] h-[56px] bg-surface3 border border-dashed border-borderCustom rounded-xl flex flex-col items-center justify-center text-[9px] font-semibold text-textCustom/30 tracking-tight leading-none text-center p-1">
                        🖼️<span className="mt-1">No Pic</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Operational Ledger Value Parameters Strip */}
                <div className="grid grid-cols-2 gap-4 bg-surface3/40 border border-borderCustom/40 px-4 py-3 rounded-xl text-xs">
                  <div>
                    <span className="text-textCustom/40 text-[10px] block uppercase font-bold tracking-wider mb-0.5">PKR Amount</span>
                    <span className="text-textCustom font-semibold text-sm">{fmtPkr(d.amount_pkr)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-textCustom/40 text-[10px] block uppercase font-bold tracking-wider mb-0.5">SAR Credit</span>
                    <span className="text-greenCustom font-bold text-sm">{fmtRiyal(d.amount_riyal)}</span>
                  </div>
                </div>

                {/* 4. Timestamp Logging & Action Elements Row */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-3 border-t border-borderCustom/30 text-xs">
                  <div className="text-left w-full sm:w-auto">
                    <span className="text-textCustom/40 text-[9px] block uppercase font-bold tracking-wider">Date Logged</span>
                    <span className="text-textCustom/60 font-medium text-[11px]">{fmtDate(d.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                    {d.status === 'pending' && (
                      <>
                        <button 
                          type="button"
                          className="px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer text-white bg-gradient-to-br from-greenCustom to-[#059669] hover:shadow-[0_4px_12px_rgba(16,185,129,0.25)] border-none active:scale-95 transition-all"
                          onClick={() => handleApprove(d.deposit_id)}
                        >
                          Approve
                        </button>
                        <button 
                          type="button"
                          className="px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer text-white bg-gradient-to-br from-redCustom to-[#dc2626] hover:shadow-[0_4px_12px_rgba(239,68,68,0.25)] border-none active:scale-95 transition-all"
                          onClick={() => handleReject(d.deposit_id)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button 
                      type="button"
                      className="p-2 bg-surface3 border border-borderCustom hover:border-redCustom/40 hover:text-redCustom text-textCustom/70 rounded-xl transition-all cursor-pointer"
                      onClick={() => handleDeleteScreenshot(d.deposit_id)}
                      title="Delete screenshot file from server storage"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 bg-surface2/30 border border-dashed border-borderCustom rounded-2xl text-center text-mutedCustom text-sm font-medium italic">
            No deposits logs found matching the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}
