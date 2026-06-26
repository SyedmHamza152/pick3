'use client';

import React from 'react';

export default function WithdrawPage() {
  return (
    <div className="w-full max-w-[1600px] mx-auto animate-fade-in">
      <div className="bg-[#17171f] border border-[#2a2a3a] rounded-2xl p-8 shadow-sm">
        
        {/* ── CARD HEADER ── */}
        <h2 className="font-space text-2xl font-bold text-[#f1f0ff] mb-6 border-b border-[#2a2a3a]/60 pb-3">
          Withdraw
        </h2>

        {/* ── COMING SOON DISPLAY BOX ── */}
        <div className="bg-[#1e1e2a]/50 border border-dashed border-[#2a2a3a] rounded-xl p-8 text-center max-w-xl mx-auto my-4">
          <h3 className="font-space text-xl font-bold text-[#f59e0b] mb-3 flex items-center justify-center gap-2">
            🚧 Coming Soon
          </h3>
          
          <p className="text-sm text-[#7b7a95] mb-4 leading-relaxed">
            Withdrawal functionality is currently under development.
          </p>
          
          <p className="text-xs text-[#7b7a95]">
            For assistance, please visit our{' '}
            <a 
              href="/dashboard/help" 
              className="text-[#a855f7] font-semibold no-underline hover:underline transition-all"
            >
              Help section
            </a>.
          </p>
        </div>

      </div>
    </div>
  );
}
