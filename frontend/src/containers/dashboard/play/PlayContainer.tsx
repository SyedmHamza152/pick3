'use client';

import React, { useState } from 'react';
import GameSelector from './GameSelector';
import ThreeUpGame from './ThreeUpGame';

export default function PlayContainer() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState('');

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-fade-in">
      <div className="bg-[#17171f] border border-[#2a2a3a] rounded-2xl p-8 shadow-sm">

        <h2 className="font-space text-2xl font-bold text-[#f1f0ff] mb-2">
          Play Games
        </h2>

        <p className="text-[#7b7a95] text-sm mb-6">
          Select a game from the dropdown below to start playing.
        </p>

        <GameSelector
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
          selectedGame={selectedGame}
          setSelectedGame={setSelectedGame}
        />

        {selectedGame === '3up' && (
          <ThreeUpGame />
        )}

      </div>
    </div>
  );
}