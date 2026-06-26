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
        <div className={`p-4 rounded-xl text-[13.5px] font-medium mb-4 border transition-all ${
          isSuccess 
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

      {/* ── DATA LOG TABLE ── */}
      <div className="overflow-x-auto scrollbar-none">
        <table className="w-full border-collapse text-xs min-w-[720px]">
          <thead className=''>
            <tr className="border-b border-borderCustom pt-5">
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">ID</th>
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">User</th>
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">PKR</th>
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">SAR credit</th>
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">Screenshot</th>
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">Status</th>
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">Date</th>
              <th className="text-left pb-3 text-[11px] font-semibold uppercase tracking-wider text-textCustom/60">Action</th>
            </tr>
          </thead>
          <tbody id="depRows" className="divide-y divide-borderCustom/40">
            {deposits.length > 0 ? (
              deposits.map((d) => (
                <tr key={d.deposit_id} className="hover:bg-surface2/50 transition-colors">
                  <td className="py-4 text-textCustom font-mono">#{d.deposit_id}</td>
                  <td className="py-4 text-textCustom">
                    <span className="font-semibold block">{d.public_id || ''}</span>
                    <span className="text-textCustom/40">@{d.username || d.user_id}</span>
                  </td>
                  <td className="py-4 text-textCustom font-medium">{fmtPkr(d.amount_pkr)}</td>
                  <td className="py-4 text-greenCustom font-bold">{fmtRiyal(d.amount_riyal)}</td>
                  <td className="py-4">
                    {imageBlobs[d.deposit_id] ? (
                      <a href={imageBlobs[d.deposit_id]} target="_blank" rel="noreferrer">
                        <img 
                          className="w-[52px] h-[52px] object-cover rounded-lg border border-borderCustom hover:border-primaryCustom transition-all" 
                          src={imageBlobs[d.deposit_id]} 
                          alt="Receipt thumbnail"
                        />
                      </a>
                    ) : (
                      <div className="w-[52px] h-[52px] bg-surface3 border border-borderCustom rounded-lg flex items-center justify-center text-[10px] text-textCustom/30">
                        No Pic
                      </div>
                    )}
                  </td>
                  <td className="py-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                      d.status === 'approved' 
                        ? 'bg-greenCustom/15 text-greenCustom' 
                        : d.status === 'rejected' 
                        ? 'bg-redCustom/15 text-redCustom' 
                        : 'bg-amber-500/15 text-amber-500'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-4 text-textCustom/60 whitespace-nowrap">{fmtDate(d.created_at)}</td>
                  <td className="py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {d.status === 'pending' && (
                        <>
                          <button 
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer text-white bg-gradient-to-br from-greenCustom to-[#059669] hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
                            onClick={() => handleApprove(d.deposit_id)}
                          >
                            Approve
                          </button>
                          <button 
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer text-white bg-gradient-to-br from-redCustom to-[#dc2626] hover:shadow-[0_4px_12px_rgba(239,68,68,0.3)]"
                            onClick={() => handleReject(d.deposit_id)}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button 
                        className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-surface3 border border-borderCustom text-textCustom hover:bg-surface2 cursor-pointer transition-all"
                        onClick={() => handleDeleteScreenshot(d.deposit_id)}
                        title="Delete screenshot file from server storage"
                      >
                        Del pic
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-mutedCustom text-sm italic">
                  Nothing here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
