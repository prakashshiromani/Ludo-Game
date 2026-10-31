import React, { useState, useEffect } from 'react';
import { sounds } from '../audio/soundManager';

export default function Dice({ value, rolling, onRoll, disabled, activeColor }) {
  const [displayValue, setDisplayValue] = useState(value || 1);
  const [internalRoll, setInternalRoll] = useState(false);

  // Rapid face cycle animation during rolling
  useEffect(() => {
    if (rolling || internalRoll) {
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 60);

      return () => clearInterval(interval);
    } else {
      setDisplayValue(value || 1);
    }
  }, [rolling, internalRoll, value]);

  const handleClick = () => {
    if (disabled || rolling || internalRoll) return;
    setInternalRoll(true);
    sounds.playDiceRoll();
    onRoll();
    setTimeout(() => {
      setInternalRoll(false);
    }, 480);
  };

  const isRolling = rolling || internalRoll;

  // Dot patterns with 3D inset shadows and glossy surface
  const renderDots = () => {
    const val = displayValue;
    const dotClasses = "w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-gradient-to-br from-slate-900 via-slate-800 to-black shadow-inner border border-slate-700/50";

    switch (val) {
      case 1:
        return (
          <div className="flex items-center justify-center w-full h-full">
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-red-800 shadow-inner border border-red-400 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white/70 rounded-full" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex justify-between w-full h-full p-2.5">
            <div className={dotClasses} />
            <div className={`${dotClasses} self-end`} />
          </div>
        );
      case 3:
        return (
          <div className="flex justify-between w-full h-full p-2.5">
            <div className={dotClasses} />
            <div className={`${dotClasses} self-center`} />
            <div className={`${dotClasses} self-end`} />
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-2 gap-2 p-2.5 w-full h-full justify-items-center items-center">
            <div className={dotClasses} />
            <div className={dotClasses} />
            <div className={dotClasses} />
            <div className={dotClasses} />
          </div>
        );
      case 5:
        return (
          <div className="relative w-full h-full p-2.5">
            <div className="absolute top-2.5 left-2.5"><div className={dotClasses} /></div>
            <div className="absolute top-2.5 right-2.5"><div className={dotClasses} /></div>
            <div className="absolute inset-0 m-auto flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-inner" />
            </div>
            <div className="absolute bottom-2.5 left-2.5"><div className={dotClasses} /></div>
            <div className="absolute bottom-2.5 right-2.5"><div className={dotClasses} /></div>
          </div>
        );
      case 6:
        return (
          <div className="grid grid-cols-2 grid-rows-3 gap-1.5 p-2 w-full h-full justify-items-center items-center">
            <div className={dotClasses} />
            <div className={dotClasses} />
            <div className={dotClasses} />
            <div className={dotClasses} />
            <div className={dotClasses} />
            <div className={dotClasses} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        {/* Dynamic Glowing Floor Halo */}
        {!disabled && (
          <div
            className="absolute -inset-1.5 rounded-3xl blur-md opacity-70 animate-pulse pointer-events-none"
            style={{ backgroundColor: activeColor || '#eab308' }}
          />
        )}

        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || isRolling}
          aria-label="Roll Dice"
          className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-200 border-2 border-slate-300/90 shadow-2xl transition-all duration-200 flex items-center justify-center overflow-hidden cursor-pointer ${
            disabled
              ? 'opacity-50 cursor-not-allowed saturate-50'
              : 'hover:scale-105 active:scale-95'
          } ${isRolling ? 'animate-dice-3d' : ''}`}
          style={{
            boxShadow: !disabled
              ? `0 10px 25px -5px ${activeColor || '#38bdf8'}66, inset 0 2px 4px rgba(255,255,255,0.9)`
              : undefined,
          }}
        >
          {/* Gloss Specular Highlight */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent rounded-t-2xl pointer-events-none" />

          {/* Dice Face Dots */}
          <div className="w-full h-full relative z-10">
            {renderDots()}
          </div>
        </button>
      </div>

      <span
        className={`text-[11px] md:text-xs font-black tracking-wider uppercase px-2 py-0.5 rounded-full transition-all ${
          disabled
            ? 'text-slate-500 bg-slate-900/60'
            : isRolling
            ? 'text-amber-300 bg-amber-500/20 animate-pulse'
            : 'text-amber-400 bg-amber-400/10 font-bold'
        }`}
      >
        {disabled ? 'Wait...' : isRolling ? 'Rolling...' : 'Tap to Roll'}
      </span>
    </div>
  );
}
