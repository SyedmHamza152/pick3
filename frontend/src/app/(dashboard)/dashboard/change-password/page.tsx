'use client';

import React from 'react';

export default function ChangePasswordPage() {
  return (
    <div className="w-full max-w-[1600px] mx-auto animate-fade-in">
      <div className="bg-[#17171f] border border-[#2a2a3a] rounded-2xl p-8 shadow-sm max-w-2xl">
        
        {/* ── CARD HEADER ── */}
        <h2 className="font-space text-2xl font-bold text-[#f1f0ff] mb-2">
          Change Password
        </h2>
        <p className="text-[#7b7a95] text-sm leading-relaxed">
          Password change form goes here — wire to your existing endpoint/IDs.
        </p>

      </div>
    </div>
  );
}
