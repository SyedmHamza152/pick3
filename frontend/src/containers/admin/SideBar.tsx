'use client';

import React from 'react';
import { logout } from '@/utils/api';

interface SideBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function SideBar({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen }: SideBarProps) {
  const menuGroups = [
    {
      title: 'Lottery Hub',
      items: [
        { id: 'users', title: 'Users', icon: '👥' },
        { id: 'wallet', title: 'Wallet Balance', icon: '💰' },
        { id: 'deposits', title: 'Pending Deposits', icon: '💳' },
        { id: 'reports', title: 'Lottery Reports', icon: '📊' },
        { id: 'screenshots', title: 'Deposit Screenshots', icon: '🖼️' },
        { id: 'announce', title: 'Announce Winners', icon: '🏆' },
        { id: 'search', title: 'Search Winners', icon: '🔍' },
      ],
    },
  ];

  return (
    <>
      {/* 📱 Backdrop mask overlay layer upgraded to explicit z-50 stack visibility priority */}
      <div 
        onClick={() => setIsMobileOpen(false)} 
        className={`fixed inset-0 bg-black/55 z-50 lg:hidden transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`} 
      />

      {/* 📱 Sidebar frame panel container layer upgraded to explicit z-50 stack slide drawer visibility priority */}
      <aside className={`w-[240px] bg-[#17171f] border-r border-[#2a2a3a] fixed top-0 bottom-0 left-0 overflow-y-auto scrollbar-none z-50 transition-transform duration-300 lg:translate-x-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <a href={"/"} className="cursor-pointer p-5 pb-3 font-space text-xl font-bold border-b border-[#2a2a3a] flex items-center justify-between">
          <span>Pick<span className="text-[#a855f7]">3</span> Panel</span>
          <button 
            onClick={() => setIsMobileOpen(false)} 
            className="lg:hidden text-white text-2xl leading-none cursor-pointer p-1"
          >
            &times;
          </button>
        </a>

        <div className="py-4 space-y-4 flex flex-col justify-between h-[calc(100vh-65px)]">
          <div>
            {menuGroups.map((group, gIdx) => (
              <div key={gIdx}>
                <div className="text-[10px] font-bold tracking-[1.2px] uppercase text-[#ebebee]/60 px-5 mb-1">
                  {group.title}
                </div>
                
                <div className="space-y-0.5 px-2">
                  {group.items.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileOpen(false); 
                        }}
                        className={`w-full flex items-center gap-3 py-2 px-3 rounded-xl text-[13px] font-medium transition-all text-left cursor-pointer ${
                          isActive
                            ? 'bg-[#a855f7]/20 text-[#a855f7] font-semibold'
                            : 'text-[#f1f0ff]/80 hover:bg-[#1e1e2a] hover:text-white'
                        }`}
                      >
                        <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                        {item.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 px-2 border-t border-[#2a2a3a]/40">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 py-2 px-3 rounded-xl text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-all text-left cursor-pointer"
            >
              <span className="text-base w-5 text-center shrink-0">🚪</span>
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
