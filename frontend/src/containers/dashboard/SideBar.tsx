'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Declare precise TypeScript type shapes for passing control states
interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  handleLogout: () => void;
}

export default function Sidebar({ isMobileOpen, setIsMobileOpen, handleLogout }: SidebarProps) {
  const pathname = usePathname();

  const menuGroups = [
    {
      title: 'Lottery Hub',
      items: [
        { title: 'Dashboard', icon: '🏠', href: '/dashboard' },
        { title: 'My Wallet', icon: '💰', href: '/dashboard/wallet' },
        { title: 'Recharge', icon: '💳', href: '/dashboard/recharge' },
        { title: 'Withdraw', icon: '💸', href: '/dashboard/withdraw' },
        { title: 'Play Games', icon: '🎮', href: '/dashboard/play' },
        { title: 'My Lottery Play History', icon: '📜', href: '/dashboard/history' },
        { title: 'Transaction Summary', icon: '📊', href: '/dashboard/transactions' },
      ],
    },
    {
      title: 'Account',
      items: [
        { title: 'Profile Settings', icon: '⚙️', href: '/dashboard/profile' },
        { title: 'Change Password', icon: '🔒', href: '/dashboard/change-password' },
        { title: 'Offers', icon: '🎁', href: '/dashboard/offers' },
        { title: 'Referrals List', icon: '👥', href: '/dashboard/referrals' },
        { title: 'Help', icon: '❓', href: '/dashboard/help' },
      ],
    },
  ];

  return (
    <>
      {/* Drawer click shadow backdrop layout overlay (Restored inside the component layout context) */}
      <div 
        onClick={() => setIsMobileOpen(false)} 
        className={`fixed inset-0 bg-black/55 z-40 lg:hidden transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} 
      />

      {/* Sidebar drawer containing exact structural fields and scroll resets */}
      <aside className={`w-[240px] bg-[#17171f] border-r border-[#2a2a3a] fixed top-0 bottom-0 left-0 overflow-y-auto scrollbar-none z-50 transition-transform duration-300 lg:translate-x-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <a href='/' className="p-5 pb-3 font-space text-xl font-bold border-b border-[#2a2a3a] flex items-center justify-between">
          <span>Pick<span className="text-[#a855f7]">3</span> Panel</span>
          <button 
            onClick={() => setIsMobileOpen(false)} 
            className="lg:hidden text-white text-2xl leading-none"
          >
            &times;
          </button>
        </a>

        <div className="py-4 space-y-4">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <div className="text-[10px] font-bold tracking-[1.2px] uppercase text-[#ebebee]/60 px-5 mb-1">
                {group.title}
              </div>
              <div className="space-y-0.5 px-2">
                {group.items.map((item, iIdx) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={iIdx}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`w-full flex items-center gap-3 py-2 px-3 rounded-xl text-[13px] font-medium transition-all ${
                        isActive 
                          ? 'bg-[#a855f7]/20 text-[#a855f7] font-semibold' 
                          : 'text-[#f1f0ff]/80 hover:bg-[#1e1e2a] hover:text-white'
                      }`}
                    >
                      <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Sidebar Logout Action Placement */}
          <div className="pt-2 px-2 border-t border-[#2a2a3a]/40">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 py-2 px-3 rounded-xl text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-all text-left"
            >
              <span className="text-base w-5 text-center flex-shrink-0">🚪</span>
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
