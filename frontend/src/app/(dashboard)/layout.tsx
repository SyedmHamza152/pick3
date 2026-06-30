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
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    // Wait for client-side hydration before checking auth
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('lottery_token');
        const userStr = localStorage.getItem('lottery_user');
        
        if (!token || !userStr) {
          router.push('/login');
        } else {
          try {
            const user = JSON.parse(userStr);
            if (user) {
              setIsAuthenticated(true);
            } else {
              router.push('/login');
            }
          } catch {
            router.push('/login');
          }
        }
        setIsChecking(false);
      }
    };

    // Increased delay to ensure localStorage is available on mobile
    const timer = setTimeout(checkAuth, 500);
    return () => clearTimeout(timer);
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      auth.clear();
      router.push('/login');
    }
  };

  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1A202C] flex items-center justify-center">
        <div className="text-[#f1f0ff] text-sm">Loading...</div>
      </div>
    );
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
