import React from 'react';
import { sounds } from '../audio/soundManager';

const EMOJIS = ['😂', '😡', '👑', '🔥', '👏', '🎲'];

export default function EmojiBar({ onSendEmoji }) {
  const handleClick = (emoji) => {
    sounds.playEmoji();
    onSendEmoji(emoji);
  };

  return (
    <div className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
      <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">React:</span>
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => handleClick(emoji)}
          className="w-7 h-7 flex items-center justify-center text-base rounded-xl hover:bg-slate-800 hover:scale-125 active:scale-95 transition-transform cursor-pointer"
          title={`Send ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

