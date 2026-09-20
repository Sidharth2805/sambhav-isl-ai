import React from 'react';

interface ChatbotHeaderProps {
  onClose: () => void;
  onReset: () => void;
}

export const ChatbotHeader: React.FC<ChatbotHeaderProps> = ({ onClose, onReset }) => {
  return (
    <div className="relative px-4 py-3.5 bg-gradient-to-r from-[#030813] via-[#0d1527] to-[#121c2e] text-white flex items-center justify-between border-b border-white/10 shadow-sm overflow-hidden select-none">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#fe9832] via-[#8dfc75] to-[#fe9832]" />

      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#fe9832] to-[#e8872b] p-0.5 shadow-md flex items-center justify-center">
            <img
              src="/logo.png"
              alt="SAMBHAV AI Logo"
              className="w-full h-full rounded-[10px] object-cover"
            />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#8dfc75] ring-2 ring-[#030813] animate-pulse" />
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-extrabold tracking-tight text-white">
              SAMBHAV <span className="text-[#fe9832]">Guide</span>
            </h3>
            <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-white/10 text-[#8dfc75] rounded-full border border-white/10">
              AI Bot
            </span>
          </div>
          <p className="text-[10px] text-white/70 font-medium">ISL Knowledge & Support Assistant</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onReset}
          className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 active:scale-95 rounded-lg transition-all"
          title="Restart Conversation"
          aria-label="Restart Conversation"
        >
          <span className="material-symbols-outlined text-[18px]">restart_alt</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 active:scale-95 rounded-lg transition-all"
          title="Close Assistant"
          aria-label="Close Assistant"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
};
