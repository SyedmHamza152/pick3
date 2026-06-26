'use client';

import React from 'react';

export default function OffersPage() {
  return (
    <div className="w-full max-w-[1600px] mx-auto animate-fade-in">
      <div className="bg-[#17171f] border border-[#2a2a3a] rounded-2xl p-8 shadow-sm">
        
        {/* ── COMING SOON / EMPTY STATE DISPLAY BOX ── */}
        <div className="bg-[#1e1e2a]/50 border border-dashed border-[#2a2a3a] rounded-xl p-8 text-center max-w-xl mx-auto my-4">
          <h3 className="font-space text-xl font-bold text-[#a855f7] mb-3 flex items-center justify-center gap-2">
            🎁 No Active Offers
          </h3>
          
          <p className="text-sm text-[#7b7a95] leading-relaxed">
            Check back soon for bonuses and promotions!
          </p>
        </div>

      </div>
    </div>
  );
}
