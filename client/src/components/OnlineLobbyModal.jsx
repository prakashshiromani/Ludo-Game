import React, { useState } from 'react';
import { Globe, Plus, LogIn, Copy, Check, Play, X, Users } from 'lucide-react';
import { COLOR_CONFIG } from '../constants/ludoPath';

export default function OnlineLobbyModal({
  isOpen,
  onClose,
  socket,
  room,
  myColor,
  onCreateRoom,
  onJoinRoom,
  onStartGame,
  joinError,
}) {
  const [playerName, setPlayerName] = useState('Player ' + Math.floor(100 + Math.random() * 900));
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isHost = room && socket && room.hostId === socket.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 shadow-2xl text-slate-100">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Play with Friends</h2>
            <p className="text-xs text-slate-400">Real-time online multiplayer room</p>
          </div>
        </div>

        {/* If Not in Room yet: Create / Join inputs */}
        {!room ? (
          <div className="space-y-4">
            {/* Player Name Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={15}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-blue-500"
                placeholder="Enter player name"
              />
            </div>

            {/* Create Room Button */}
            <button
              type="button"
              onClick={() => onCreateRoom(playerName)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 active:scale-98 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create New Room (Get 6-Digit Code)
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800" />
              <span className="flex-shrink mx-4 text-xs font-bold text-slate-500 uppercase">OR</span>
              <div className="flex-grow border-t border-slate-800" />
            </div>

            {/* Join Room Section */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">Join Existing Room</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.trim())}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold tracking-widest text-center text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => onJoinRoom(roomCodeInput, playerName)}
                  disabled={roomCodeInput.length !== 6}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  Join
                </button>
              </div>
              {joinError && (
                <p className="text-xs text-red-400 font-semibold mt-1">{joinError}</p>
              )}
            </div>
          </div>
        ) : (
          /* When Room is Created / Joined: Lobby view */
          <div className="space-y-4">
            {/* 6-digit Room Code Box */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Room Code
              </span>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-3xl font-black font-mono tracking-widest text-amber-400">
                  {room.code}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition cursor-pointer"
                  title="Copy Room Code"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Share this code with your friends to join!
              </p>
            </div>

            {/* Players Joined List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">
                  Players Joined ({room.players.length}/4)
                </span>
                <span className="text-[11px] text-slate-400">Min 2 to start</span>
              </div>

              <div className="space-y-1.5">
                {room.players.map((p, idx) => {
                  const cfg = COLOR_CONFIG[p.color] || COLOR_CONFIG.red;
                  const isMe = p.color === myColor;

                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800 border border-slate-700/80"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shadow"
                          style={{ backgroundColor: cfg.bg }}
                        >
                          {p.color[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-white">
                          {p.name} {isMe && '(You)'}
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                        style={{ backgroundColor: cfg.light, color: cfg.border }}
                      >
                        {cfg.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Start Game Button (for Host) */}
            {isHost ? (
              <button
                type="button"
                onClick={onStartGame}
                disabled={room.players.length < 2}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-lg shadow-green-500/20 active:scale-98 transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Game ({room.players.length} Players)
              </button>
            ) : (
              <div className="py-2.5 px-3 rounded-xl bg-slate-800 text-center text-xs font-semibold text-slate-300">
                Waiting for the host to start the game...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

