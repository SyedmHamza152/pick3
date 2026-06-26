'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/utils/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    if (!auth.token || !auth.user) {
      router.push('/login');
    } else if (!auth.user.is_admin) {
      router.push('/dashboard');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#8e8d89] text-[#f1f0ff] font-sans antialiased">
      {/* Simple children injection slot. No fixed navigation tags allowed here */}
      {children}
    </div>
  );
}
