import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ContactSupportPromptProps {
  onTryAnotherQuestion: () => void;
  onEndChat: () => void;
}

export const ContactSupportPrompt: React.FC<ContactSupportPromptProps> = ({
  onTryAnotherQuestion,
  onEndChat,
}) => {
  const navigate = useNavigate();

  const handleContactTeam = () => {
    navigate('/help');
  };

  return (
    <div className="p-4 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl flex flex-col gap-3 animate-fadeIn text-xs shadow-sm">
      <div className="flex items-start gap-2.5 text-amber-800 dark:text-amber-300">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-300">
          <span className="material-symbols-outlined text-[20px]">contact_support</span>
        </div>
        <div>
          <p className="font-bold text-xs text-[#030813] dark:text-white">
            No Exact Match Found
          </p>
          <p className="text-[11px] text-[#45474c] dark:text-[#c1c6d7] mt-0.5 leading-relaxed">
            Our automated assistant couldn&apos;t find an answer for this custom query. Our dedicated accessibility team is here to assist you.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button
          onClick={handleContactTeam}
          className="w-full py-2.5 px-3.5 bg-gradient-to-r from-[#fe9832] to-[#e8872b] hover:brightness-105 active:scale-95 text-[#542900] rounded-xl font-extrabold transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">support_agent</span>
          <span>Contact Our Support Team</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onTryAnotherQuestion}
            className="py-2 px-3 bg-white dark:bg-[#1a2332] hover:border-[#fe9832] border border-[#e0e3e5] dark:border-[#243044] text-[#030813] dark:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Try Another</span>
          </button>

          <button
            onClick={onEndChat}
            className="py-2 px-3 bg-white dark:bg-[#1a2332] hover:bg-[#e0e3e5] dark:hover:bg-[#253144] border border-[#e0e3e5] dark:border-[#243044] text-[#45474c] dark:text-[#c1c6d7] rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
          >
            <span>End Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
