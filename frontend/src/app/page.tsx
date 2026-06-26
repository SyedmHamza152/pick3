'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  // Using an array of strings to reactively manage dynamic ball text states safely
  const [balls, setBalls] = useState<string[]>(['?', '?', '?']);

  useEffect(() => {
    const spinBalls = () => {
      let count = 0;
      const iv = setInterval(() => {
        setBalls([
          String(Math.floor(Math.random() * 10)),
          String(Math.floor(Math.random() * 10)),
          String(Math.floor(Math.random() * 10)),
        ]);

        if (++count > 14) {
          clearInterval(iv);
          // Set exact final numbers from original script template
          setBalls(['3', '7', '2']);
        }
      }, 70);
    };

    // Execute first run immediately on window mount
    spinBalls();

    // Re-trigger the spin loop cycle every 7 seconds exactly like original interval
    const mainInterval = setInterval(spinBalls, 7000);

    return () => {
      clearInterval(mainInterval);
    };
  }, []);

  return (
    <div className="relative z-10 bg-bg text-textCustom min-h-screen overflow-x-hidden font-sans">

      {/* Navigation Bar Element */}
      <nav className="flex items-center justify-between px-8 py-[1.2rem] border-b border-borderCustom bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="font-space text-[22px] text-textCustom tracking-[-0.3px]">
          Pick<span className="text-primaryCustom">3</span>
        </div>
        <div className="flex gap-2">
          <Link href="/login" className="px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer border border-borderCustom bg-transparent text-textCustom transition-all duration-180 inline-block hover:bg-surface2">
            Login
          </Link>
          <Link href="/signup" className="px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer border border-transparent bg-gradient-to-br from-[#a855f7] to-[#7c3aed] text-white transition-all duration-180 inline-block hover:shadow-[0_6px_18px_rgba(168,85,247,0.45)] hover:-translate-y-[1px]">
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero Content Section */}
      <section className="text-center pt-20 pb-12 px-6 max-w-[700px] mx-auto">
        <div className="inline-flex items-center gap-2 bg-surface2 border border-borderCustom rounded-[50px] px-[18px] py-1.5 text-sm text-mutedCustom font-medium mb-8 animate-fade-down">
          <span className="w-[7px] h-[7px] rounded-full bg-primaryCustom animate-pulse"></span>
          Lucky Draw — 1st &amp; 16th of every month
        </div>

        <h1 className="font-space text-[38px] md:text-[68px] leading-[1.05] text-textCustom mb-5 font-bold animate-fade-up [animation-delay:0.1s]">
          Pick three digits.<br />
          <em className="text-primaryCustom not-italic">Win big</em> twice a month.
        </h1>

        <p className="text-[17px] text-mutedCustom leading-relaxed max-w-[440px] mx-auto mb-10 font-normal animate-fade-up [animation-delay:0.2s]">
          Choose Straight, Rumble, or Box. Draws happen on the <strong>1st</strong> and <strong>16th</strong> — mark your calendar and never miss a win.
        </p>

        {/* Interactive Dynamic Animated Balls Grid */}
        <div className="flex justify-center gap-4 mb-10 animate-fade-up [animation-delay:0.3s]">
          {balls.map((digit, index) => (
            <div
              key={index}
              className="relative overflow-hidden w-[72px] h-[72px] rounded-full flex items-center justify-center font-space text-2xl text-textCustom bg-surface border-2 border-primaryCustom after:content-[''] after:absolute after:top-[10%] after:left-[20%] after:w-[30%] after:h-[20%] after:rounded-full after:bg-[rgba(168,85,247,0.12)]"
            >
              {digit}
            </div>
          ))}
        </div>

        {/* Hero Actions CTA Block */}
        <div className="flex gap-3 justify-center flex-wrap animate-fade-up [animation-delay:0.35s]">
          <Link href="/signup" className="px-[32px] py-[13px] bg-gradient-to-br from-[#a855f7] to-[#7c3aed] text-white rounded-xl font-semibold text-[15px] cursor-pointer transition-all duration-180 inline-block shadow-[0_4px_14px_rgba(168,85,247,0.3)] hover:shadow-[0_6px_18px_rgba(168,85,247,0.45)] hover:-translate-y-[1px]">
            Play now — it's free
          </Link>
          <button
            onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-[28px] py-[13px] bg-transparent text-textCustom border border-borderCustom rounded-xl font-semibold text-[15px] cursor-pointer transition-all duration-180 hover:bg-surface2"
          >
            How it works
          </button>
        </div>

        <p className="text-xs text-mutedCustom mt-4 font-normal">
          Must be 18+ · Play responsibly
        </p>
      </section>

      {/* Structural Divider Grid */}
      <hr className="border-t border-borderCustom max-w-[700px] mx-auto" />

      {/* How To Play Flow Section */}
      <section id="how" className="py-12 px-6 max-w-[700px] mx-auto">
        <div className="font-space text-3xl text-textCustom mb-2 text-center font-bold">How to play</div>
        <div className="text-[15px] text-mutedCustom text-center mb-8 font-normal">Four steps between you and the jackpot.</div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
          <div className="bg-surface border border-borderCustom rounded-[14px] p-5 text-center">
            <div className="w-[38px] h-[38px] rounded-full bg-primaryCustom text-white font-space text-lg flex items-center justify-center mx-auto mb-2.5 font-bold">1</div>
            <h3 className="text-sm font-semibold mb-1 text-textCustom">Create account</h3>
            <p className="text-[13px] text-mutedCustom leading-normal font-normal">Sign up free in under a minute.</p>
          </div>
          <div className="bg-surface border border-borderCustom rounded-[14px] p-5 text-center">
            <div className="w-[38px] h-[38px] rounded-full bg-primaryCustom text-white font-space text-lg flex items-center justify-center mx-auto mb-2.5 font-bold">2</div>
            <h3 className="text-sm font-semibold mb-1 text-textCustom">Pick 3 digits</h3>
            <p className="text-[13px] text-mutedCustom leading-normal font-normal">Choose any three numbers 0–9 for your entry.</p>
          </div>
          <div className="bg-surface border border-borderCustom rounded-[14px] p-5 text-center">
            <div className="w-[38px] h-[38px] rounded-full bg-primaryCustom text-white font-space text-lg flex items-center justify-center mx-auto mb-2.5 font-bold">3</div>
            <h3 className="text-sm font-semibold mb-1 text-textCustom">Choose mode</h3>
            <p className="text-[13px] text-mutedCustom leading-normal font-normal">Straight, Rumble, or Box — each with its own odds.</p>
          </div>
          <div className="bg-surface border border-borderCustom rounded-[14px] p-5 text-center">
            <div className="w-[38px] h-[38px] rounded-full bg-primaryCustom text-white font-space text-lg flex items-center justify-center mx-auto mb-2.5 font-bold">4</div>
            <h3 className="text-sm font-semibold mb-1 text-textCustom">Watch the draw</h3>
            <p className="text-[13px] text-mutedCustom leading-normal font-normal">Live every 1st &amp; 16th at 9 PM. Winnings paid instantly.</p>
          </div>
        </div>
      </section>

      {/* Structural Divider Grid */}
      <hr className="border-t border-borderCustom max-w-[700px] mx-auto" />

      {/* Draw Schedule Section */}
      <section className="py-12 px-6 max-w-[700px] mx-auto">
        <div className="font-space text-3xl text-textCustom mb-2 text-center font-bold">Draw schedule</div>
        <div className="text-[15px] text-mutedCustom text-center mb-8 font-normal">Two guaranteed draws every single month.</div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface border border-borderCustom rounded-[14px] p-6 text-center">
            <div className="font-space text-5xl text-primaryCustom leading-none mb-1 font-bold">1st</div>
            <div className="text-sm text-mutedCustom font-normal">First of the month</div>
            <div className="inline-flex items-center gap-1.5 mt-2.5 text-[13px] font-medium text-textCustom bg-surface2 rounded-md px-3 py-1">📋 9:00 PM sharp</div>
          </div>
          <div className="bg-surface border border-borderCustom rounded-[14px] p-6 text-center">
            <div className="font-space text-5xl text-primaryCustom leading-none mb-1 font-bold">16th</div>
            <div className="text-sm text-mutedCustom font-normal">Mid of the month</div>
            <div className="inline-flex items-center gap-1.5 mt-2.5 text-[13px] font-medium text-textCustom bg-surface2 rounded-md px-3 py-1">📋 9:00 PM sharp</div>
          </div>
        </div>
        <p className="text-[13px] text-mutedCustom text-center mt-4 font-light">
          Ticket purchases close at 8:00 PM on draw day. Results posted live.
        </p>
      </section>

      {/* Structural Divider Grid */}
      <hr className="border-t border-borderCustom max-w-[700px] mx-auto" />

      {/* Play Strategy Modes Section */}
      <section className="py-12 px-6 max-w-[700px] mx-auto">
        <div className="font-space text-3xl text-textCustom mb-2 text-center font-bold">Play modes</div>
        <div className="text-[15px] text-mutedCustom text-center mb-8 font-normal">Pick the style that suits your strategy.</div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
          <div className="bg-surface border border-borderCustom rounded-[14px] p-6">
            {/* Straight Mode Card */}
            <div className="bg-surface border border-borderCustom rounded-[14px] p-6">
              <div className="w-10 h-10 rounded-xl bg-surface2 flex items-center justify-center mb-3 text-xl">🎯</div>
              <h3 className="text-base font-semibold mb-1.5 text-textCustom">Straight</h3>
              <p className="text-[13px] text-mutedCustom leading-relaxed font-normal">Your three digits must match the draw in the exact same order. Highest reward, toughest odds.</p>
              <span className="inline-block mt-2.5 text-xs font-medium text-textCustom bg-surface2 border border-borderCustom rounded-md px-2.5 py-1">Top prize: PKR 5,00,000</span>
            </div>

            {/* Rumble Mode Card */}
            <div className="bg-surface border border-borderCustom rounded-[14px] p-6">
              <div className="w-10 h-10 rounded-xl bg-surface2 flex items-center justify-center mb-3 text-xl">🔀</div>
              <h3 className="text-base font-semibold mb-1.5 text-textCustom">Rumble</h3>
              <p className="text-[13px] text-mutedCustom leading-relaxed font-normal">Your digits can match in any order — six winning combinations from a single ticket.</p>
              <span className="inline-block mt-2.5 text-xs font-medium text-textCustom bg-surface2 border border-borderCustom rounded-md px-2.5 py-1">Top prize: PKR 80,000</span>
            </div>

            {/* Box Mode Card */}
            <div className="bg-surface border border-borderCustom rounded-[14px] p-6">
              <div className="w-10 h-10 rounded-xl bg-surface2 flex items-center justify-center mb-3 text-xl">📦</div>
              <h3 className="text-base font-semibold mb-1.5 text-textCustom">Box</h3>
              <p className="text-[13px] text-mutedCustom leading-relaxed font-normal">Win if all three digits appear anywhere in the result. Works with repeated digits too.</p>
              <span className="inline-block mt-2.5 text-xs font-medium text-textCustom bg-surface2 border border-borderCustom rounded-md px-2.5 py-1">Top prize: PKR 1,60,000</span>
            </div>
          </div>
        </div>
      </section>

      {/* Layout Footer Wrapper */}
      <footer className="border-t border-borderCustom px-8 py-6 text-center text-xs text-mutedCustom font-normal">
        © 2026 Pick3 Lucky Draw &nbsp;·&nbsp; Draws held 1st &amp; 16th of every month &nbsp;·&nbsp; 18+ only &nbsp;·&nbsp; Play responsibly
      </footer>
    </div>
  );
}
