'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/containers/dashboard/SideBar';
import NavBar from '@/containers/dashboard/NavBar';
import { auth, requireAuth } from '@/utils/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // useEffect(() => {
  //   console.log('Auth check:', { token: auth.token, user: auth.user });
  //   if (!auth.token || !auth.user) {
  //     router.push('/login');
  //   } else {
  //     setIsAuthenticated(true);
  //   }
  // }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      auth.clear();
      router.push('/login');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1A202C] text-[#f1f0ff] font-sans antialiased">

      {/* 🟢 FIXED: Shared state controllers are passed to the top bar layout */}
      <NavBar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Shared state controllers passed to the side menu layout */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        handleLogout={handleLogout}
      />

      {/* Main Panel Viewport View Injection slot */}
      <main className="lg:ml-[240px] mt-[60px] p-6 min-h-[calc(100vh-60px)]">
        {children}
      </main>
    </div>
  );
}
