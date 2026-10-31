import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Gift, Sparkles } from 'lucide-react';
import { sounds } from '../audio/soundManager';

const REWARDS = [
  { label: '500 Coins', type: 'coins', val: 500, color: '#f59e0b' },
  { label: '25 Gems', type: 'gems', val: 25, color: '#10b981' },
  { label: '1,500 Coins', type: 'coins', val: 1500, color: '#ef4444' },
  { label: '50 Gems', type: 'gems', val: 50, color: '#3b82f6' },
  { label: '3,000 Coins', type: 'coins', val: 3000, color: '#8b5cf6' },
  { label: '100 Gems', type: 'gems', val: 100, color: '#ec4899' },
  { label: '5,000 Coins', type: 'coins', val: 5000, color: '#eab308' },
  { label: 'JACKPOT (10K)', type: 'coins', val: 10000, color: '#14b8a6' },
];

export default function SpinModal({ isOpen, onClose, onRewardClaimed }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState(null);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWonPrize(null);

    // Random prize index 0..7
    const prizeIndex = Math.floor(Math.random() * REWARDS.length);
    const degreesPerSlice = 360 / REWARDS.length;
    // Add 5 to 8 full 360 rotations + slice alignment
    const extraRounds = (5 + Math.floor(Math.random() * 3)) * 360;
    const targetDeg = extraRounds + (360 - (prizeIndex * degreesPerSlice + degreesPerSlice / 2));

    setRotation(targetDeg);

    // Play periodic ticking sounds
    const tickInterval = setInterval(() => {
      sounds.playSpinTick();
    }, 120);

    setTimeout(() => {
      clearInterval(tickInterval);
      setSpinning(false);
      const prize = REWARDS[prizeIndex];
      setWonPrize(prize);
      sounds.playSafeZone();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      onRewardClaimed(prize);
    }, 3800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border-2 border-amber-500/60 rounded-3xl p-5 text-center shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={spinning}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Lucky Fortune Wheel
        </div>

        <h3 className="text-xl font-black text-white">Daily Royal Spin</h3>
        <p className="text-xs text-slate-400">Spin the wheel to win instant coins & gems!</p>

        {/* Wheel Container */}
        <div className="relative w-64 h-64 mx-auto my-5 flex items-center justify-center">
          {/* Top Indicator Arrow Pointer */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-lg">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400" />
          </div>

          {/* Rotating Wheel Disk */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-400 shadow-2xl overflow-hidden relative"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 3.8s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {REWARDS.map((r, i) => {
                const angle = 360 / REWARDS.length;
                const startAngle = (i * angle * Math.PI) / 180;
                const endAngle = ((i + 1) * angle * Math.PI) / 180;

                const x1 = 50 + 50 * Math.cos(startAngle);
                const y1 = 50 + 50 * Math.sin(startAngle);
                const x2 = 50 + 50 * Math.cos(endAngle);
                const y2 = 50 + 50 * Math.sin(endAngle);

                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                return (
                  <path
                    key={i}
                    d={pathData}
                    fill={r.color}
                    stroke="#1e293b"
                    strokeWidth="0.8"
                  />
                );
              })}
            </svg>

            {/* Center Golden Pin */}
            <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 border-2 border-white shadow-lg flex items-center justify-center text-sm">
              👑
            </div>
          </div>
        </div>

        {/* Won Prize Banner */}
        {wonPrize && (
          <div className="my-2 p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-400 animate-bounce">
            <span className="text-xs text-amber-300 font-bold block">YOU WON</span>
            <span className="text-base font-black text-white">{wonPrize.label}!</span>
          </div>
        )}

        {/* Spin CTA Button */}
        <button
          type="button"
          onClick={handleSpin}
          disabled={spinning}
          className="w-full shimmer-button py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition disabled:opacity-50 cursor-pointer"
        >
          {spinning ? 'Spinning...' : 'SPIN NOW!'}
        </button>
      </div>
    </div>
  );
}

