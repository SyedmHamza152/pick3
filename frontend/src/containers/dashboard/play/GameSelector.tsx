'use client';

import React from 'react';

type Props = {
  isDropdownOpen: boolean;
  setIsDropdownOpen: (v: boolean) => void;
  selectedGame: string;
  setSelectedGame: (v: string) => void;
};

export default function GameSelector({
  isDropdownOpen,
  setIsDropdownOpen,
  selectedGame,
  setSelectedGame
}: Props) {
  return (
    <div className="relative max-w-md z-30">
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full flex items-center justify-between bg-[#1e1e2a] border border-[#2a2a3a] text-[#f1f0ff] px-4 py-3 rounded-xl text-sm font-medium cursor-pointer hover:bg-[#242433] transition-colors"
      >
        <span>{selectedGame === '3up' ? '🎯 3UP Lottery' : 'Select a Game'}</span>
        <span className={`text-xs transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      

      {isDropdownOpen && (
        <div className="absolute top-[105%] left-0 right-0 bg-[#1e1e2a] border border-[#2a2a3a] rounded-xl shadow-xl overflow-hidden animate-fade-down">
          <button
            type="button"
            onClick={() => {
              setSelectedGame('3up');
              setIsDropdownOpen(false);
            }}
            className="w-full flex items-center gap-4 p-4 hover:bg-[#242433] transition-colors text-left cursor-pointer bg-transparent border-none"
          >
            <span className="text-2xl">🎯</span>
            <div>
              <div className="font-semibold text-[#f1f0ff] text-sm">
                3UP Lottery
              </div>
              <div className="text-xs text-[#7b7a95] mt-0.5">
                Pick 3 numbers - Win big prizes!
              </div>
            </div>
          </button>
        </div>
      )}
      
    </div>
  );
}