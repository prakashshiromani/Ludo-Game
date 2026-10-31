import React from 'react';
import { X, BookOpen, Star, Zap, Shield, Trophy } from 'lucide-react';
import { sounds } from '../audio/soundManager';

export default function RulesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-md max-h-[85vh] overflow-y-auto bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 shadow-2xl text-slate-100">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">How to Play Ludo Game</h3>
            <p className="text-xs text-slate-400">Official rules & winning tactics</p>
          </div>
        </div>

        {/* Rules Cards */}
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex gap-3">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 flex-shrink-0 self-start">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">1. Deploy on Roll 6</h4>
              <p className="text-slate-300 mt-0.5">
                Tokens wait in the Yard. You need to roll a <strong>6</strong> on the dice to release a token onto the starting square.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0 self-start">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">2. Safe Star Squares (★)</h4>
              <p className="text-slate-300 mt-0.5">
                Squares marked with a <strong>Star (★)</strong> are safe zones. Opponents cannot cut your token on these squares. Multiple tokens can rest together safely.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 flex-shrink-0 self-start">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">3. Cutting Opponents</h4>
              <p className="text-slate-300 mt-0.5">
                If your token lands on an opponent's token outside a safe star, their token is <strong>cut</strong> and sent back to their yard. You earn an <strong>Extra Bonus Turn</strong>!
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex gap-3">
            <div className="p-2 rounded-xl bg-green-500/20 text-green-400 flex-shrink-0 self-start">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">4. Reaching Home & Winning</h4>
              <p className="text-slate-300 mt-0.5">
                Navigate all 52 track squares and enter your color's exclusive Home Column. First player to place all 4 tokens in the center <strong>Final Home</strong> wins the crown!
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
            💡 <strong>Pro Tip:</strong> Rolling a 6 gives an extra turn! But rolling three 6s in a row forfeits the third turn.
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold transition cursor-pointer"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
}

