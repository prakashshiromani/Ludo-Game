import React from 'react';
import { COLOR_CONFIG } from '../constants/ludoPath';

export default function Token({ token, isMovable, isHopping, onClick, count = 1 }) {
  const config = COLOR_CONFIG[token.color] || COLOR_CONFIG.red;

  return (
    <div
      onClick={isMovable ? onClick : undefined}
      className={`relative flex items-center justify-center transition-transform select-none ${
        isHopping
          ? 'animate-token-hop z-50'
          : isMovable
          ? 'animate-token-active z-40 cursor-pointer hover:scale-125'
          : 'z-20 cursor-default'
      }`}
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      {/* 3D Pawn SVG */}
      <svg viewBox="0 0 44 44" className="w-[90%] h-[90%] filter drop-shadow-md">
        <defs>
          <radialGradient id={`grad-token-${token.color}-${token.id}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="35%" stopColor={config.bg} />
            <stop offset="100%" stopColor={config.border} />
          </radialGradient>

          <filter id={`glow-${token.color}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Base Ellipse Ground Shadow */}
        <ellipse cx="22" cy="37" rx="15" ry="4" fill="rgba(0,0,0,0.35)" />

        {/* Base disc ring */}
        <path
          d="M 9 35 C 9 30, 35 30, 35 35 C 35 39, 9 39, 9 35 Z"
          fill={config.border}
        />
        <ellipse
          cx="22"
          cy="34"
          rx="13"
          ry="3.8"
          fill={`url(#grad-token-${token.color}-${token.id})`}
        />

        {/* Body neck */}
        <path
          d="M 13 33 C 14 24, 18 19, 19 16 L 25 16 C 26 19, 30 24, 31 33 Z"
          fill={`url(#grad-token-${token.color}-${token.id})`}
        />

        {/* Golden Royal Collar Accent */}
        <ellipse
          cx="22"
          cy="16"
          rx="6"
          ry="2"
          fill="#facc15"
          stroke="#b45309"
          strokeWidth="0.9"
        />

        {/* Head Sphere */}
        <circle
          cx="22"
          cy="11"
          r="8"
          fill={`url(#grad-token-${token.color}-${token.id})`}
          stroke={isMovable ? '#ffffff' : config.border}
          strokeWidth={isMovable ? '2' : '1'}
        />

        {/* Gloss Specular Highlight on Head */}
        <ellipse cx="19.5" cy="8" rx="3" ry="1.8" fill="#ffffff" opacity="0.8" />
      </svg>

      {/* Cluster count badge if multiple tokens share the spot */}
      {count > 1 && (
        <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-lg">
          {count}
        </span>
      )}
    </div>
  );
}
