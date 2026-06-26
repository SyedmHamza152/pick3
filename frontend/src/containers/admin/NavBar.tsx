'use client';

import React from 'react';
import { logout } from '@/utils/api';

interface NavBarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  username?: string;
}

export default function NavBar({ isMobileOpen, setIsMobileOpen, username = 'Admin' }: NavBarProps) {
  return (
    /* Changed layer class token to z-30 to clear up layout overlaps */
    <nav className="fixed top-0 left-0 right-0 h-[60px] bg-[#17171f] border-b border-[#2a2a3a] flex items-center justify-between px-6 z-30">

      {/* Left side boundary panel wrapper */}
      <div className="flex items-center justify-end gap-3">
        {/* Mobile Hamburger menu trigger button */}
        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden flex gap-2 text-white p-2 hover:bg-[#1e1e2a] rounded-lg transition-colors cursor-pointer"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>

          <div className=" font-space text-base font-bold tracking-tight text-[#f1f0ff]">
            <span className=" text-[#a855f7] font-semibold">Admin Center</span>
          </div>
        </button>

        {/* Responsive Brand Header Text (Hidden completely on hyper-narrow screen resolutions) */}
      </div>

      {/* Right side status parameters panel wrapper */}
      <div className="flex items-center gap-3">
        {/* <div className="bg-[#1e1e2a] border border-[#2a2a3a] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#f59e0b] whitespace-nowrap">
          🛡️ @{username}
        </div> */}
        <div className="hidden lg:flex font-space text-base font-bold tracking-tight text-[#f1f0ff]">
          <span className=" text-[#a855f7] font-semibold">Admin Center</span>
        </div>

        <button
          type="button"
          onClick={logout}
          className="bg-transparent border border-[#2a2a3a] text-[#f1f0ff] px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap transition-all duration-150 hover:bg-[#1e1e2a]"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
