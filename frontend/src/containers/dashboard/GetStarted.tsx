import React from 'react';

export default function GetStarted() {
  return (
    <div className="bg-surface border border-borderCustom rounded-2xl p-6 mb-5">
      <h3 className="text-base font-semibold mb-4 text-textCustom">
        How to Get Started
      </h3>
      <div className="leading-relaxed text-mutedCustom space-y-2">
        <p>
          <strong className="text-textCustom">1. Deposit Funds:</strong> Go to the Deposit section and send money via JazzCash. Your deposit will be converted to SAR after approval.
        </p>
        <p>
          <strong className="text-textCustom">2. Play Games:</strong> Click on "Play Games" in the sidebar, select a game (like 3UP), pick your numbers, and place your bet.
        </p>
        <p>
          <strong className="text-textCustom">3. Win Big:</strong> If your numbers match, you win! Straight bets pay 400x, Rumble bets pay 80x.
        </p>
        
        {/* Tip Box */}
        <p className="mt-4 p-4 bg-surface2 rounded-xl border-l-4 border-primaryCustom text-textCustom">
          <strong>💡 Tip:</strong> Start with small bets to learn the game. Good luck!
        </p>
        
        {/* Cashback Info Box */}
        <p className="mt-4 p-4 bg-surface2 rounded-xl border-l-4 border-primaryCustom text-textCustom">
          <strong>🎁 43% Cashback on Every Bet</strong>
          <br />
          Every time you place a bet, you will receive 43% cashback instantly.
          For example, if you play a $100 bet, only $57 will be deducted from your account while $43 will be returned back to your balance.
        </p>
        
        {/* Deduction Info Box */}
        <p className="mt-4 p-4 bg-surface2 rounded-xl border-l-4 border-primaryCustom text-textCustom">
          <strong>💰 10% Deduction on Winnings</strong>
          <br />
          A 10% fee will be applied on all winnings before they are credited to your account.
          For example, if you win $100, you will receive $90 after deduction.
        </p>
      </div>
    </div>
  );
}
