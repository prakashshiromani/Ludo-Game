import React, { useState } from 'react';
import {
  Bot,
  Users,
  Globe,
  Zap,
  Volume2,
  VolumeX,
  Music,
  HelpCircle,
  Gift,
  Coins,
  Gem,
  Play,
  Check,
  ChevronRight,
  Shield,
  Award,
} from 'lucide-react';
import { COLOR_CONFIG } from '../constants/ludoPath';
import { sounds } from '../audio/soundManager';

export default function LandingPage({
  onStartGame,
  onOpenOnlineModal,
  soundOn,
  onToggleSound,
  musicOn,
  onToggleMusic,
  coins,
  gems,
  onOpenSpin,
  onOpenRules,
}) {
  const [selectedMode, setSelectedMode] = useState('vs_computer'); // 'vs_computer' | 'pass_and_play' | 'quick'
  const [playerCount, setPlayerCount] = useState(4);
  const [difficulty, setDifficulty] = useState('medium'); // 'easy' | 'medium' | 'hard'
  const [userColor, setUserColor] = useState('red');
  const [quickTokens, setQuickTokens] = useState(2); // 2 tokens for quick match

  const handleModeCardClick = (mode) => {
    sounds.playClick();
    setSelectedMode(mode);
  };

  const handleStart = () => {
    sounds.playClick();
    if (selectedMode === 'vs_computer') {
      onStartGame({
        mode: 'vs_computer',
        playerCount,
        difficulty,
        userColor,
        tokensToWin: 4,
      });
    } else if (selectedMode === 'pass_and_play') {
      onStartGame({
        mode: 'pass_and_play',
        playerCount,
        difficulty: 'medium',
        tokensToWin: 4,
      });
    } else if (selectedMode === 'quick') {
      onStartGame({
        mode: 'vs_computer',
        playerCount: 2,
        difficulty: 'hard',
        userColor: 'red',
        tokensToWin: quickTokens,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-between p-3 md:p-6 select-none relative overflow-hidden">
      {/* Background Decorative Radial Halos */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-red-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* TOP HEADER: Profile Bar & Utilities */}
      <header className="relative z-10 max-w-2xl w-full mx-auto flex items-center justify-between gap-2 py-2 px-3 md:px-5 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-md">
        {/* User Profile */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 p-0.5 shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl">
                👑
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1 rounded-full shadow">
              LV.15
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs md:text-sm font-black text-white">King Player</span>
              <Shield className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            </div>
            <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
              Royal Knight
            </span>
          </div>
        </div>

        {/* Currency Counters (Coins & Gems) */}
        <div className="flex items-center gap-2">
          {/* Coins Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800/90 border border-amber-500/30 shadow-inner">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black text-amber-300">{coins.toLocaleString()}</span>
          </div>

          {/* Gems Badge */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800/90 border border-emerald-500/30 shadow-inner">
            <Gem className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-black text-emerald-300">{gems}</span>
          </div>
        </div>

        {/* Action Controls: Lucky Spin, Sound, Music, Rules */}
        <div className="flex items-center gap-1 md:gap-1.5">
          {/* Lucky Spin Button */}
          <button
            type="button"
            onClick={onOpenSpin}
            className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black shadow-md cursor-pointer transition active:scale-95 flex items-center gap-1 text-xs"
            title="Daily Lucky Spin"
          >
            <Gift className="w-4 h-4 animate-bounce" />
            <span className="hidden md:inline font-black text-[11px]">SPIN</span>
          </button>

          {/* Audio Controls */}
          <button
            type="button"
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title={soundOn ? 'Mute Sound Effects' : 'Unmute Sound'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          <button
            type="button"
            onClick={onToggleMusic}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title={musicOn ? 'Stop Ambient Music' : 'Play Ambient Music'}
          >
            <Music className={`w-4 h-4 ${musicOn ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
          </button>

          <button
            type="button"
            onClick={onOpenRules}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Game Rules Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* HERO SECTION: Title & Crown */}
      <section className="relative z-10 text-center my-4 md:my-6">
        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 p-1 shadow-2xl shadow-amber-500/30 mb-2">
          <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-3xl md:text-4xl animate-crown">
            👑
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 drop-shadow-md">
          LUDO GAME
        </h1>
        <p className="text-xs md:text-sm font-bold tracking-widest text-slate-400 uppercase mt-0.5">
          Royal Web Edition • Real-Time Arena
        </p>
      </section>

      {/* GAME MODES SELECTION GRID */}
      <section className="relative z-10 max-w-xl w-full mx-auto grid grid-cols-2 gap-2.5 md:gap-3.5">
        {/* 1. Play vs Computer */}
        <div
          onClick={() => handleModeCardClick('vs_computer')}
          className={`p-3.5 md:p-4 rounded-3xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
            selectedMode === 'vs_computer'
              ? 'bg-gradient-to-b from-amber-500/20 to-slate-900 border-amber-400 shadow-xl shadow-amber-500/20 scale-102 ring-2 ring-amber-400/50'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 text-white shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            {selectedMode === 'vs_computer' && (
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}
          </div>

          <div className="mt-3">
            <h3 className="text-sm md:text-base font-black text-white">vs Computer</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Tactical AI Bot Battle</p>
          </div>
        </div>

        {/* 2. Pass & Play (Local) */}
        <div
          onClick={() => handleModeCardClick('pass_and_play')}
          className={`p-3.5 md:p-4 rounded-3xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
            selectedMode === 'pass_and_play'
              ? 'bg-gradient-to-b from-green-500/20 to-slate-900 border-green-400 shadow-xl shadow-green-500/20 scale-102 ring-2 ring-green-400/50'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md">
              <Users className="w-6 h-6" />
            </div>
            {selectedMode === 'pass_and_play' && (
              <span className="w-5 h-5 rounded-full bg-green-400 text-slate-950 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}
          </div>

          <div className="mt-3">
            <h3 className="text-sm md:text-base font-black text-white">Pass & Play</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">2–4 Players, 1 Screen</p>
          </div>
        </div>

        {/* 3. Quick Rush Mode */}
        <div
          onClick={() => handleModeCardClick('quick')}
          className={`p-3.5 md:p-4 rounded-3xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
            selectedMode === 'quick'
              ? 'bg-gradient-to-b from-purple-500/20 to-slate-900 border-purple-400 shadow-xl shadow-purple-500/20 scale-102 ring-2 ring-purple-400/50'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-md">
              <Zap className="w-6 h-6" />
            </div>
            {selectedMode === 'quick' && (
              <span className="w-5 h-5 rounded-full bg-purple-400 text-slate-950 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}
          </div>

          <div className="mt-3">
            <h3 className="text-sm md:text-base font-black text-white">Quick Rush</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Fast 2-Token Blitz Match</p>
          </div>
        </div>

        {/* 4. Play with Friends (Online) */}
        <div
          onClick={() => {
            sounds.playClick();
            onOpenOnlineModal();
          }}
          className="p-3.5 md:p-4 rounded-3xl border-2 border-blue-500/60 bg-gradient-to-b from-blue-600/20 to-slate-900 hover:border-blue-400 hover:scale-102 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-lg shadow-blue-500/10"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
              <Globe className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/30">
              Online
            </span>
          </div>

          <div className="mt-3">
            <h3 className="text-sm md:text-base font-black text-white">Play Online</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">6-Digit Private Room</p>
          </div>
        </div>
      </section>

      {/* MODE CUSTOMIZATION SETTINGS PANEL */}
      <section className="relative z-10 max-w-xl w-full mx-auto my-3 p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        {/* Player Count Selector */}
        {selectedMode !== 'quick' && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Player Count:</span>
            <div className="flex gap-2">
              {[2, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setPlayerCount(count);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                    playerCount === count
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {count} Players
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Difficulty Selector */}
        {selectedMode === 'vs_computer' && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">AI Difficulty:</span>
            <div className="flex gap-1.5">
              {[
                { id: 'easy', label: 'Rookie' },
                { id: 'medium', label: 'Warrior' },
                { id: 'hard', label: 'Master' },
              ].map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setDifficulty(diff.id);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    difficulty === diff.id
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Token Color Selection (for vs Computer) */}
        {selectedMode === 'vs_computer' && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Your Royal Color:</span>
            <div className="flex gap-2">
              {['red', 'green', 'yellow', 'blue'].map((color) => {
                const cfg = COLOR_CONFIG[color];
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setUserColor(color);
                    }}
                    className={`w-7 h-7 rounded-full transition-transform cursor-pointer border-2 shadow-md ${
                      userColor === color
                        ? 'scale-125 border-white ring-2 ring-amber-400'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: cfg.bg }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Mode Rule */}
        {selectedMode === 'quick' && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Tokens to Win:</span>
            <div className="flex gap-2">
              {[1, 2].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setQuickTokens(num);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                    quickTokens === num
                      ? 'bg-purple-500 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {num} {num === 1 ? 'Token' : 'Tokens'}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* START GAME PRIMARY CTA BUTTON */}
      <footer className="relative z-10 max-w-xl w-full mx-auto">
        <button
          type="button"
          onClick={handleStart}
          className="w-full shimmer-button py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-base md:text-lg tracking-wider uppercase shadow-2xl shadow-amber-500/30 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer border-2 border-yellow-200"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          START BATTLE
          <ChevronRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
}

