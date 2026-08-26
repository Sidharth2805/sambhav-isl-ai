import React from 'react';

interface ChatbotButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const ChatbotButton: React.FC<ChatbotButtonProps> = ({ isOpen, onClick }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 font-['Inter',sans-serif]">
      {/* Floating Tooltip / Helper pill when closed */}
      {!isOpen && (
        <div
          onClick={onClick}
          className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 bg-[#030813]/90 dark:bg-[#0c121e]/90 text-white text-xs font-bold rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/15 cursor-pointer hover:border-[#fe9832] hover:scale-105 transition-all duration-300 backdrop-blur-md animate-fadeIn group"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#8dfc75] animate-pulse" />
          <span className="group-hover:text-[#fe9832] transition-colors">Need Help? Ask SAMBHAV</span>
          <span className="material-symbols-outlined text-[16px] text-[#fe9832] group-hover:translate-x-0.5 transition-transform">
            chat
          </span>
        </div>
      )}

      {/* Main Floating Action Button */}
      <button
        type="button"
        onClick={onClick}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[#542900] shadow-[0_10px_35px_rgba(254,152,50,0.35)] transition-all duration-300 transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#fe9832]/40 relative ${
          isOpen
            ? 'bg-[#030813] text-white border border-white/20 rotate-90 shadow-xl'
            : 'bg-gradient-to-tr from-[#fe9832] via-[#e8872b] to-[#ffaa4d] border-2 border-white/90 dark:border-white/10'
        }`}
        title={isOpen ? 'Close SAMBHAV Guide' : 'Open SAMBHAV Guide Assistant'}
        aria-label={isOpen ? 'Close SAMBHAV Guide' : 'Open SAMBHAV Guide Assistant'}
        aria-expanded={isOpen}
      >
        <span className="material-symbols-outlined text-[28px]">
          {isOpen ? 'close' : 'support_agent'}
        </span>

        {/* Pulsing indicator badge when closed */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8dfc75] opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#8dfc75] border-2 border-white dark:border-[#030813]" />
          </span>
        )}
      </button>
    </div>
  );
};
