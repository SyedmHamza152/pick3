'use client';

import React, { useState } from 'react';

// ── IMPORT YOUR CORE LAYOUT PIECES ──
import NavBar from '@/containers/admin/NavBar';
import SideBar from '@/containers/admin/SideBar';

// ── IMPORT ALL SUB-VIEW CONTAINERS ──
import UsersView from '@/containers/admin/UserView';
import WalletView from '@/containers/admin/WalletView';
import DepositsView from '@/containers/admin/DepositsView';
import ReportsView from '@/containers/admin/ReportsView';
import ScreenshotsView from '@/containers/admin/ScreenshotsView';
import AnnounceView from '@/containers/admin/AnnounceView';
import SearchView from '@/containers/admin/SearchView';

export default function AdminDashboard() {
  // Central state variables manage all navigation and responsive drawers cleanly
  const [activeTab, setActiveTab] = useState<string>('users');
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  return (
    <div className="relative min-h-screen font-sans">

      {/* 1. NEW UNIFIED NAVBAR CONTAINER */}
      <NavBar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        username="Admin"
      />

      {/* 2. SIDEBAR DRAWERS COMPONENT */}
      <SideBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* 
        ── 3. FIXED RESPONSIVE MAIN WORKSPACE PANEL ── 
        - pt-[84px]: 60px nav clearance + 24px clean top breathing margin space
        - lg:pl-[240px]: Safely indents content exactly past the 240px wide sidebar desk element
        - pl-0: Snaps completely left to full edge on mobile devices when sidebar hides
      */}
      <main className="lg:ml-[240px] mt-[60px] p-6 min-h-[calc(100vh-60px)]">
        {/* Removed w-full conflict wrapper to restore clean box layout distributions */}
        <div className="max-w-[1600px] mx-auto">
          {activeTab === 'users' && <UsersView />}
          {activeTab === 'wallet' && <WalletView />}
          {activeTab === 'deposits' && <DepositsView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'screenshots' && <ScreenshotsView />}
          {activeTab === 'announce' && <AnnounceView />}
          {activeTab === 'search' && <SearchView />}
        </div>
      </main>

    </div>
  );
}
