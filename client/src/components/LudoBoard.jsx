import React from 'react';
import { COLOR_CONFIG, SHARED_PATH, BOARD_SIZE } from '../constants/ludoPath';
import Token from './Token';

export default function LudoBoard({
  allTokens,
  movableTokens = [],
  onTokenClick,
  activeColor,
  animatingToken = null, // { color, id, coords }
  rippleCell = null, // { r, c, type: 'cut' | 'safe' }
}) {
  // Map token positions to grid cells: { "r,c": [token1, token2] }
  const cellTokensMap = {};

  Object.values(allTokens).forEach((tokensList) => {
    tokensList.forEach((token) => {
      // If this token is currently animating its step-by-step hop, use its live animating coords
      if (
        animatingToken &&
        animatingToken.color === token.color &&
        animatingToken.id === token.id
      ) {
        const key = `${animatingToken.coords.r},${animatingToken.coords.c}`;
        if (!cellTokensMap[key]) cellTokensMap[key] = [];
        cellTokensMap[key].push({ ...token, isHopping: true });
        return;
      }

      let r, c;
      const config = COLOR_CONFIG[token.color];

      if (token.state === 'yard') {
        const yardCoord = config.yardPositions[token.position];
        r = yardCoord.r;
        c = yardCoord.c;
      } else if (token.state === 'home') {
        r = config.homeTarget.r;
        c = config.homeTarget.c;
      } else if (token.state === 'home_column') {
        const hcCoord = config.homeColumn[token.position];
        r = hcCoord.r;
        c = hcCoord.c;
      } else if (token.state === 'path') {
        const pathCoord = SHARED_PATH[token.position];
        r = pathCoord.r;
        c = pathCoord.c;
      }

      const key = `${r},${c}`;
      if (!cellTokensMap[key]) {
        cellTokensMap[key] = [];
      }
      cellTokensMap[key].push(token);
    });
  });

  // Helper to determine cell styling and type
  const getCellMeta = (r, c) => {
    // 1. Red Yard (Top-Left: 0..5, 0..5)
    if (r <= 5 && c <= 5) return { type: 'yard', color: 'red' };
    // 2. Green Yard (Top-Right: 0..5, 9..14)
    if (r <= 5 && c >= 9) return { type: 'yard', color: 'green' };
    // 3. Blue Yard (Bottom-Left: 9..14, 0..5)
    if (r >= 9 && c <= 5) return { type: 'yard', color: 'blue' };
    // 4. Yellow Yard (Bottom-Right: 9..14, 9..14)
    if (r >= 9 && c >= 9) return { type: 'yard', color: 'yellow' };

    // 5. Center Home (6..8, 6..8)
    if (r >= 6 && r <= 8 && c >= 6 && c <= 8) {
      return { type: 'center' };
    }

    // 6. Home Columns
    if (r === 7 && c >= 1 && c <= 5) return { type: 'home_col', color: 'red' };
    if (c === 7 && r >= 1 && r <= 5) return { type: 'home_col', color: 'green' };
    if (r === 7 && c >= 9 && c <= 13) return { type: 'home_col', color: 'yellow' };
    if (c === 7 && r >= 9 && r <= 13) return { type: 'home_col', color: 'blue' };

    // 7. Start Squares with Stars
    if (r === 6 && c === 1) return { type: 'start', color: 'red', hasStar: true };
    if (r === 1 && c === 8) return { type: 'start', color: 'green', hasStar: true };
    if (r === 8 && c === 13) return { type: 'start', color: 'yellow', hasStar: true };
    if (r === 13 && c === 6) return { type: 'start', color: 'blue', hasStar: true };

    // 8. Intermediate Safe Squares with Stars
    if (
      (r === 8 && c === 2) ||
      (r === 2 && c === 6) ||
      (r === 6 && c === 12) ||
      (r === 12 && c === 8)
    ) {
      return { type: 'safe', hasStar: true };
    }

    // 9. Regular Path Square
    return { type: 'path' };
  };

  // Render individual grid cell
  const renderCell = (r, c) => {
    const isYardCorner =
      (r === 0 && c === 0) ||
      (r === 0 && c === 9) ||
      (r === 9 && c === 0) ||
      (r === 9 && c === 9);

    const isCenterCorner = r === 6 && c === 6;

    // We render yards as unified 6x6 blocks
    if (isYardCorner) {
      const color =
        r === 0 && c === 0 ? 'red' :
        r === 0 && c === 9 ? 'green' :
        r === 9 && c === 0 ? 'blue' : 'yellow';

      const config = COLOR_CONFIG[color];

      return (
        <div
          key={`yard-${color}`}
          className="col-span-6 row-span-6 p-2 md:p-3 relative rounded-2xl border-2 border-black/30 shadow-inner flex items-center justify-center transition-all duration-300"
          style={{
            backgroundColor: config.bg,
            boxShadow: `inset 0 4px 12px rgba(0,0,0,0.35)`,
          }}
        >
          {/* Inner Yard White Box with Rounded Corners and Bevel */}
          <div className="w-full h-full bg-slate-50/95 rounded-xl p-2.5 md:p-3 grid grid-cols-2 grid-rows-2 gap-2.5 shadow-md border-2 border-slate-300/80">
            {config.yardPositions.map((slot, idx) => {
              const tokensHere = cellTokensMap[`${slot.r},${slot.c}`] || [];
              const token = tokensHere[0];
              const isMovable = token && movableTokens.some((m) => m.id === token.id && m.color === token.color);

              return (
                <div
                  key={idx}
                  className="rounded-full flex items-center justify-center relative shadow-inner border-2 border-slate-300/80 transition-all hover:brightness-105"
                  style={{
                    backgroundColor: config.light,
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)',
                  }}
                >
                  {token && (
                    <Token
                      token={token}
                      isMovable={isMovable}
                      isHopping={token.isHopping}
                      onClick={() => onTokenClick(token)}
                      count={tokensHere.length}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Skip redundant cells covered by 6x6 yards
    if ((r <= 5 && c <= 5) || (r <= 5 && c >= 9) || (r >= 9 && c <= 5) || (r >= 9 && c >= 9)) {
      return null;
    }

    // Render 3x3 Center Block
    if (isCenterCorner) {
      return (
        <div
          key="center-block"
          className="col-span-3 row-span-3 relative overflow-hidden rounded-xl border-2 border-slate-400 bg-slate-950 shadow-2xl"
        >
          {/* 4 Center Triangles Meeting in Middle */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="gold-crown-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
            </defs>

            {/* Top Green Triangle */}
            <polygon points="0,0 100,0 50,50" fill={COLOR_CONFIG.green.bg} />
            {/* Right Yellow Triangle */}
            <polygon points="100,0 100,100 50,50" fill={COLOR_CONFIG.yellow.bg} />
            {/* Bottom Blue Triangle */}
            <polygon points="100,100 0,100 50,50" fill={COLOR_CONFIG.blue.bg} />
            {/* Left Red Triangle */}
            <polygon points="0,100 0,0 50,50" fill={COLOR_CONFIG.red.bg} />

            {/* Inner Center Circle with Golden Crown */}
            <circle cx="50" cy="50" r="17" fill="#0f172a" stroke="url(#gold-crown-grad)" strokeWidth="2.5" />
            <text
              x="50"
              y="56"
              fontSize="16"
              textAnchor="middle"
              className="animate-crown select-none pointer-events-none"
            >
              👑
            </text>
          </svg>

          {/* Tokens Reached Final Home Counter Badges */}
          {['red', 'green', 'yellow', 'blue'].map((color) => {
            const config = COLOR_CONFIG[color];
            const homeTokens = (allTokens[color] || []).filter((t) => t.state === 'home');
            if (homeTokens.length === 0) return null;

            const posStyles =
              color === 'red' ? 'top-1/2 left-1.5 -translate-y-1/2' :
              color === 'green' ? 'top-1.5 left-1/2 -translate-x-1/2' :
              color === 'yellow' ? 'top-1/2 right-1.5 -translate-y-1/2' :
              'bottom-1.5 left-1/2 -translate-x-1/2';

            return (
              <div
                key={`home-count-${color}`}
                className={`absolute ${posStyles} z-30 flex items-center gap-0.5`}
              >
                <span className="bg-white text-slate-950 font-black text-[10px] md:text-xs px-1.5 py-0.5 rounded-full shadow-lg border border-amber-400">
                  {homeTokens.length}★
                </span>
              </div>
            );
          })}
        </div>
      );
    }

    // Skip cells covered by 3x3 Center Block
    if (r >= 6 && r <= 8 && c >= 6 && c <= 8) {
      return null;
    }

    // Regular track cells
    const meta = getCellMeta(r, c);
    const tokensHere = cellTokensMap[`${r},${c}`] || [];
    const isRippleTarget = rippleCell && rippleCell.r === r && rippleCell.c === c;

    let cellBg = 'bg-white';
    if (meta.type === 'home_col' || meta.type === 'start') {
      cellBg =
        meta.color === 'red' ? 'bg-red-500 text-white' :
        meta.color === 'green' ? 'bg-green-500 text-white' :
        meta.color === 'yellow' ? 'bg-yellow-400 text-slate-900' :
        'bg-blue-500 text-white';
    }

    return (
      <div
        key={`cell-${r}-${c}`}
        className={`relative border border-slate-300/70 flex items-center justify-center select-none transition-colors duration-150 ${cellBg}`}
      >
        {/* Shockwave Ripple Burst when Cut or Safe Star */}
        {isRippleTarget && (
          <div
            className={`absolute inset-0 rounded-full animate-ripple pointer-events-none z-30 ${
              rippleCell.type === 'cut' ? 'bg-red-500/80 ring-4 ring-red-400' : 'bg-amber-400/80 ring-4 ring-yellow-300'
            }`}
          />
        )}

        {/* Star Icon for Safe Squares */}
        {meta.hasStar && tokensHere.length === 0 && (
          <span
            className={`text-sm md:text-base font-black select-none pointer-events-none ${
              meta.type === 'start' ? 'text-white drop-shadow-md' : 'text-amber-500/90'
            }`}
          >
            ★
          </span>
        )}

        {/* Tokens rendered inside the cell */}
        {tokensHere.length > 0 && (
          <div className="w-full h-full flex items-center justify-center p-0.5 relative z-20">
            {tokensHere.map((token) => {
              const isMovable = movableTokens.some(
                (m) => m.id === token.id && m.color === token.color
              );

              return (
                <Token
                  key={token.id}
                  token={token}
                  isMovable={isMovable}
                  isHopping={token.isHopping}
                  onClick={() => onTokenClick(token)}
                  count={tokensHere.length}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="relative w-full max-w-[480px] md:max-w-[500px] aspect-square mx-auto p-2 bg-gradient-to-br from-amber-800 via-amber-950 to-slate-900 rounded-3xl shadow-2xl border-4 border-amber-600/70"
      style={{
        boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 25px ${activeColor || '#eab308'}44`,
      }}
    >
      {/* Wooden Bevel & Inner Board Container */}
      <div className="w-full h-full grid grid-cols-15 grid-rows-15 bg-slate-50 rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/50">
        {Array.from({ length: BOARD_SIZE }).map((_, r) =>
          Array.from({ length: BOARD_SIZE }).map((_, c) => renderCell(r, c))
        )}
      </div>
    </div>
  );
}
