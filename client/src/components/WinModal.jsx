import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw } from 'lucide-react';
import { COLOR_CONFIG } from '../constants/ludoPath';
import { sounds } from '../audio/soundManager';

export default function WinModal({ winnerColor, winnerName, onRestart }) {
  const config = COLOR_CONFIG[winnerColor] || COLOR_CONFIG.red;

  useEffect(() => {
    sounds.playWinFanfare();

    // Trigger colorful confetti shower
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#ef4444', '#22c55e', '#eab308', '#3b82f6', '#facc15'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, [winnerColor]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-amber-400 rounded-3xl p-6 text-center shadow-2xl">
        {/* Floating Crown / Trophy */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-400/20 border border-amber-400/40 rounded-full mb-3 shadow-lg">
          <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
        </div>

        <h2 className="text-2xl font-black text-white tracking-wide">
          VICTORY!
        </h2>

        <p className="text-sm text-slate-300 mt-1">
          Congratulations to the champion!
        </p>

        <div
          className="my-4 py-2 px-4 rounded-xl font-black text-lg text-white shadow-md inline-block uppercase"
          style={{ backgroundColor: config.bg }}
        >
          {winnerName || config.name} Won!
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}

