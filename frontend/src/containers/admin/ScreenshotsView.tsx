'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';

interface UploadStats {
  count: number;
  total_bytes: number;
}

export default function ScreenshotsView() {
  const [stats, setStats] = useState<string>('Loading…');
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

  // 📊 1. Refresh Upload Server Storage Stats Logic
  const refreshUploadStats = async () => {
    setLoading(true);
    try {
      const s: UploadStats = await api('/api/admin/uploads/stats');
      const mb = (s.total_bytes / (1024 * 1024)).toFixed(2);
      setStats(`${s.count} file(s) · ${mb} MB on disk`);
    } catch {
      setStats('Could not load stats');
    } finally {
      setLoading(false);
    }
  };

  // Run stats calculation once when component mounts
  useEffect(() => {
    refreshUploadStats();
  }, []);

  // 🧹 2. Clear All Screenshot Media Files From Server Storage
  const handleClearAllUploads = async () => {
    if (!window.confirm('Delete ALL deposit screenshot files from the server? Deposit records in the database are not removed.')) return;
    setShowMsg(false);
    try {
      const r = await api('/api/admin/uploads/clear-all', { method: 'POST' });
      displayMessage(`Cleared ${r.deleted} uploaded picture(s).`, true);
      refreshUploadStats();
    } catch (err: any) {
      displayMessage(err.message || 'An error occurred while wiping storage files.');
    }
  };

  return (
    <div className="bg-surface border border-borderCustom rounded-2xl p-6 shadow-sm max-w-6xl">
      {/* ── CARD HEADER TITLE ── */}
      <div className="mb-4">
        <h3 className="font-space text-xl font-bold text-textCustom mb-1">
          Deposit screenshots (local files)
        </h3>
        <p className="text-mutedCustom text-sm leading-relaxed">
          Images are stored on this server in <code className="bg-surface2 px-1.5 py-0.5 rounded text-redCustom">backend/uploads/</code>. Deposit records in Neon are kept; deleting files only removes the image files.
        </p>
      </div>

      {/* ── STATUS NOTIFICATION ALERT BOX ── */}
      {showMsg && (
        <div className={`p-4 rounded-xl text-[13.5px] font-medium mb-4 border transition-all ${
          isSuccess 
            ? 'bg-greenCustom/10 border-greenCustom/30 text-[#6ee7b7]' 
            : 'bg-redCustom/10 border-redCustom/30 text-[#fca5a5]'
        }`}>
          {msgText}
        </div>
      )}

      {/* ── ACTION INPUT TOOLBAR ── */}
      <div className="flex flex-wrap items-center gap-3 mt-4">
        {/* Pill Badge Metric display box */}
        <span className="bg-surface2 border border-borderCustom px-3.5 py-1.5 rounded-full text-xs font-semibold text-accentCustom whitespace-nowrap">
          📊 {stats}
        </span>
        
        {/* Ghost styled layout refresh button parameters */}
        <button 
          className="px-4 py-2 bg-surface2 text-textCustom border border-borderCustom rounded-xl text-xs font-semibold cursor-pointer transition-all hover:bg-surface3 whitespace-nowrap disabled:opacity-50"
          type="button" 
          onClick={refreshUploadStats}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh count'}
        </button>
        
        {/* Bad styled layout clear button parameters */}
        <button 
          className="px-4 py-2 bg-linear-to-br from-redCustom to-[#dc2626] text-white font-semibold text-xs rounded-xl cursor-pointer hover:shadow-lg transition-all whitespace-nowrap border-none"
          type="button" 
          onClick={handleClearAllUploads}
        >
          Clear all uploaded pictures
        </button>
      </div>
    </div>
  );
}
