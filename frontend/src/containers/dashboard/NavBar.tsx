'use client';

import React, { useState, useEffect } from 'react';

interface NavBarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  username?: string; 
}

export default function NavBar({ isMobileOpen, setIsMobileOpen, username: propUsername }: NavBarProps) {
  // 🟢 State tracker to hold the dynamic username session
  const [displayUsername, setDisplayUsername] = useState<string>('Username');

  // 🟢 Check local session cache stores directly inside the component
  useEffect(() => {
    // If the parent passed a valid name, use it immediately
    if (propUsername && propUsername !== 'Username') {
      setDisplayUsername(propUsername);
      return;
    }

    // Otherwise, safely look up local storage keys directly on the client side
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user_info') || localStorage.getItem('lottery_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          // Checks both potential backend key objects (.username or .user_id)
          setDisplayUsername(parsed.username || parsed.user_id || 'Player');
        } catch (e) {
          console.error('Failed to parse user session cache:', e);
        }
      }
    }
  }, [propUsername]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <nav className="fixed top-0 lg:left-[240px] left-0 right-0 h-[60px] bg-[#17171f] border-b border-[#2a2a3a] flex items-center justify-between lg:justify-end px-7 z-40">
      
      {/* Mobile Sidebar Hamburger Trigger */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden block text-white p-2 hover:bg-[#1e1e2a] rounded-lg transition-colors cursor-pointer"
        type="button"
        aria-label="Toggle Side Drawer"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <div className="flex items-center gap-3">
        {/* 🟢 FIXED: Outputs displayUsername which checks both props and localStorage safely */}
        <div className="bg-[#1e1e2a] border border-[#2a2a3a] px-3.5 py-1.5 rounded-full text-xs font-semibold truncate max-w-[180px]">
          👤 {displayUsername}
        </div>
        <button
          onClick={handleLogout}
          className="bg-transparent border border-[#2a2a3a] text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-[#1e1e2a] transition-colors cursor-pointer"
          type="button"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
