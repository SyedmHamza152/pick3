'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/utils/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
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
            if (!user || !user.is_admin) {
              router.push('/dashboard');
            } else {
              setIsAuthenticated(true);
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

  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1A202C] flex items-center justify-center">
        <div className="text-[#f1f0ff] text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A202C] text-[#f1f0ff] font-sans antialiased">
      {/* Simple children injection slot. No fixed navigation tags allowed here */}
      {children}
    </div>
  );
}
