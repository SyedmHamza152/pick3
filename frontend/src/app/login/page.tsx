'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, auth } from '@/utils/api';

export default function Login() {
  const router = useRouter();

  // State handlers for input parameters
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Status message state control blocks
  const [msgText, setMsgText] = useState<string>('');
  const [showMsg, setShowMsg] = useState<boolean>(false);

  // Redirect if already authenticated
  useEffect(() => {
    const checkAuthAndRedirect = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('lottery_token');
        const userStr = localStorage.getItem('lottery_user');
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            if (user) {
              if (user.is_admin) {
                router.push('/admin');
              } else {
                router.push('/dashboard');
              }
            }
          } catch {
            // Invalid user data, stay on login
          }
        }
      }
    };

    // Small delay to ensure localStorage is available
    const timer = setTimeout(checkAuthAndRedirect, 100);
    return () => clearTimeout(timer);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowMsg(false);

    try {
      const data = await api('/api/auth/login', {
        method: 'POST',
        body: { username, password },
        auth: false,
      });

      // Maintain exact session properties assignment from legacy markup
      auth.set(data.access_token, {
        user_id: data.user_id,
        public_id: data.public_id,
        username: data.username,
        phone: data.phone,
        is_admin: data.is_admin,
        account_balance: data.account_balance,
      });

      // Conditional administration portal routing
      if (data.is_admin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setMsgText(err.message || 'An error occurred');
      setShowMsg(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-5 bg-bg text-textCustom font-sans">
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-[400px] bg-surface border border-borderCustom rounded-2xl p-8"
      >
        <h2 className="font-space text-2xl font-bold text-textCustom m-0 mb-2">
          Welcome back
        </h2>
        <p className="text-mutedCustom m-0 mb-4 font-normal text-sm">
          Login to your account
        </p>

        {/* Message Alert Element wrapper */}
        {showMsg && (
          <div className="p-4 rounded-xl text-[13.5px] font-medium mb-4 bg-red-500/10 border border-red-500/30 text-[#fca5a5]">
            {msgText}
          </div>
        )}

        <label className="block text-[11px] font-semibold text-mutedCustom mb-1.5 uppercase tracking-[0.5px]">
          Username
        </label>
        <input 
          className="w-full bg-surface2 border border-borderCustom text-textCustom px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors duration-150 focus:border-primaryCustom focus:shadow-[0_0_0_3px_rgba(168,85,247,0.25)]"
          name="username" 
          type="text"
          required 
          minLength={3}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className="h-2.5"></div>

        <label className="block text-[11px] font-semibold text-mutedCustom mb-1.5 uppercase tracking-[0.5px]">
          Password
        </label>
        <input 
          className="w-full bg-surface2 border border-borderCustom text-textCustom px-3.5 py-2.5 rounded-xl text-sm outline-none transition-colors duration-150 focus:border-primaryCustom focus:shadow-[0_0_0_3px_rgba(168,85,247,0.25)]"
          name="password" 
          type="password" 
          required 
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="h-3.5"></div>

        <button 
          className="w-full inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold cursor-pointer border-none bg-gradient-to-br from-[#a855f7] to-[#7c3aed] text-white shadow-[0_4px_14px_rgba(168,85,247,0.3)] transition-all duration-180 hover:shadow-[0_6px_18px_rgba(168,85,247,0.45)] hover:-translate-y-[1px]" 
          type="submit"
        >
          Login
        </button>

        {/* Navigation redirection routing containers */}
        <p className="text-mutedCustom font-normal text-sm mt-3 m-0">
          <Link href="/forgot-password" className="text-primaryCustom no-underline hover:underline">
            Forgot password?
          </Link>
        </p>
        <p className="text-mutedCustom font-normal text-sm mt-2 m-0">
          No account?{' '}
          <Link href="/signup" className="text-primaryCustom no-underline hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
