'use client';

import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  // Admin menu array with admin-specific items
  const menuGroups = [
    {
      title: 'Overview/Control',
      items: [
        { title: 'Users', icon: '👥', tab: 'users' },
        { title: 'Manage Balance', icon: '💰', tab: 'balance' },
      ],
    },
    {
      title: "Payment's Management",
      items: [
        { title: 'Pending Deposits', icon: '💳', tab: 'deposits' },
        { title: 'Delete Screenshots', icon: '📸', tab: 'screenshots' },
      ],
    },
    {
      title: 'Lottery Management',
      items: [
        { title: 'Announce Winner', icon: '🏆', tab: 'announce' },
        { title: 'Search Winner', icon: '🔍', tab: 'search' },
        { title: 'Lottery Report', icon: '📊', tab: 'reports' },
      ],
    },
  ];

  return (
    <>
      {/* Drawer click shadow backdrop layout overlay */}
      <div 
        onClick={() => setIsMobileOpen(false)} 
        className={`fixed inset-0 bg-black/55 z-40 lg:hidden transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`} 
      />

      {/* Sidebar drawer panel container */}
      <aside className={`w-[240px] bg-[#17171f] border-r border-[#2a2a3a] fixed top-0 bottom-0 left-0 overflow-y-auto scrollbar-none z-50 transition-transform duration-300 lg:translate-x-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-5 pb-3 font-space text-xl font-bold border-b border-[#2a2a3a] flex items-center justify-between">
          <span>Pick<span className="text-[#a855f7]">3</span> Panel</span>
          <button 
            type="button"
            onClick={() => setIsMobileOpen(false)} 
            className="lg:hidden text-white text-2xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* ── MENUS CONTENT WRAPPER GRID ── */}
        <div className="py-4 space-y-4 flex flex-col justify-between h-[calc(100vh-65px)]">
          <div className="space-y-4">
            {menuGroups.map((group, gIdx) => (
              <div key={gIdx}>
                <div className="text-[10px] font-bold tracking-[1.2px] uppercase text-[#ebebee]/60 px-5 mb-1.5">
                  {group.title}
                </div>
                <div className="space-y-0.5 px-2">
                  {group.items.map((item, iIdx) => {
                    const isActive = activeTab === item.tab;

                    return (
                      <button
                        key={iIdx}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.tab);
                          setIsMobileOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 py-2 px-3 rounded-xl text-[13px] font-medium transition-all cursor-pointer border-none bg-transparent ${
                          isActive 
                            ? 'bg-[#a855f7]/20 text-[#a855f7] font-semibold shadow-inner' 
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

          {/* Persistent Logout Interface Button */}
          <div className="pt-2 px-2 border-t border-[#2a2a3a]/40">
            <button
              type="button"
              onClick={() => window.location.href = '/login'}
              className="w-full flex items-center gap-3 py-2 px-3 rounded-xl text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-all text-left cursor-pointer border-none bg-transparent"
            >
              <span className="text-base w-5 text-center shrink-0">🔓</span>
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
