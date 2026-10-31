import React from 'react';
import { COLOR_CONFIG } from '../constants/ludoPath';
import { Bot, User, Trophy, Flame } from 'lucide-react';

export default function PlayerCard({
  color,
  name,
  isActive,
  isBot,
  tokens = [],
  timeLeft = 15,
  maxTime = 15,
  floatingEmoji = null,
}) {
  const config = COLOR_CONFIG[color] || COLOR_CONFIG.red;
  const homeCount = tokens.filter((t) => t.state === 'home').length;
  const isFinished = homeCount === 4;

  // Perfect concentric SVG circular countdown timer
  // Box size: 48x48, Center: 24, 24, Radius: 21, Diameter: 42
  const viewBoxSize = 48;
  const center = 24;
  const radius = 21;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.max(0, timeLeft) / maxTime) * circumference;

  // Timer stroke color based on remaining time
  const timerColor =
    timeLeft <= 4 ? '#ef4444' : timeLeft <= 8 ? '#f59e0b' : '#22c55e';

  return (
    <div
      className={`relative flex items-center gap-2.5 px-3 py-2 rounded-2xl transition-all duration-300 border-2 select-none shadow-md ${
        isActive
          ? 'bg-slate-900/95 scale-102 shadow-xl ring-2'
          : 'bg-slate-900/70 opacity-80'
      }`}
      style={{
        borderColor: isActive ? config.bg : 'rgba(71, 85, 105, 0.4)',
        boxShadow: isActive ? `0 0 20px -2px ${config.bg}88` : undefined,
      }}
    >
      {/* Floating Reaction Emoji Popup */}
      {floatingEmoji && (
        <div className="absolute -top-7 left-3 z-50 animate-float-emoji text-2xl filter drop-shadow-lg pointer-events-none">
          {floatingEmoji}
        </div>
      )}

      {/* Avatar Container with Perfectly Centered Circular Countdown */}
      <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
        {/* SVG Circular Countdown Ring when Active */}
        {isActive && !isFinished && (
          <svg
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-10"
          >
            {/* Background track circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="3"
              fill="transparent"
            />
            {/* Active animated countdown stroke */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke={timerColor}
              strokeWidth="3.2"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
        )}

        {/* Player Avatar Disc - Perfectly centered inside the circular countdown */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white/50 relative z-0"
          style={{ backgroundColor: config.bg }}
        >
          {isFinished ? (
            <Trophy className="w-4 h-4 text-amber-300 animate-bounce" />
          ) : isBot ? (
            <Bot className="w-4 h-4 text-white/95" />
          ) : (
            <User className="w-4 h-4 text-white/95" />
          )}
        </div>

        {/* Time Left Badge when <= 5s */}
        {isActive && timeLeft <= 5 && !isFinished && (
          <span className="absolute -bottom-1 -right-1 bg-red-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-md z-20 animate-pulse">
            {timeLeft}
          </span>
        )}
      </div>

      {/* Player Info & Home Token Progress */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs md:text-sm font-black text-slate-100 truncate flex items-center gap-1">
            {name}
            {isActive && <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />}
          </span>
          {isFinished && (
            <span className="text-[10px] bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 px-1.5 py-0.5 rounded-full font-black shadow">
              RANK 1
            </span>
          )}
        </div>

        {/* 4-dot home progress indicator */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full border transition-all ${
                  idx < homeCount
                    ? 'bg-amber-400 border-amber-300 scale-125 shadow-sm'
                    : 'bg-slate-700 border-slate-600'
                }`}
              />
            ))}
            <span className="text-[10px] text-slate-400 ml-1 font-semibold">
              {homeCount}/4
            </span>
          </div>

          {/* Color tag */}
          <span
            className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded"
            style={{ backgroundColor: config.light, color: config.border }}
          >
            {config.name}
          </span>
        </div>
      </div>
    </div>
  );
}
