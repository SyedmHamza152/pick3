'use client';

// 🟢 FIXED: Add 'username?: string;' to the TypeScript interfaces block
interface NavBarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  username?: string; 
}

export default function NavBar({ isMobileOpen, setIsMobileOpen, username = 'Username' }: NavBarProps) {
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
        {/* 🟢 FIXED: Reads the username directly from the layout props cleanly now */}
        <div className="bg-[#1e1e2a] border border-[#2a2a3a] px-3.5 py-1.5 rounded-full text-xs font-semibold truncate max-w-[180px]">
          👤 {username}
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
