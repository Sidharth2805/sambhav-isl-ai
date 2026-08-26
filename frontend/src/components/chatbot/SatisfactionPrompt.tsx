import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SatisfactionPromptProps {
  onAskAnotherQuestion: () => void;
  onEndChat: () => void;
}

export const SatisfactionPrompt: React.FC<SatisfactionPromptProps> = ({
  onAskAnotherQuestion,
  onEndChat,
}) => {
  const navigate = useNavigate();
  const [answered, setAnswered] = useState<'yes' | 'no' | null>(null);

  const handleContactTeam = () => {
    navigate('/help');
  };

  return (
    <div className="p-3.5 bg-gradient-to-br from-white to-[#f1f4f6] dark:from-[#151c28] dark:to-[#0f141f] border border-[#e0e3e5] dark:border-[#243044] rounded-2xl flex flex-col gap-3 shadow-sm animate-fadeIn">
      {answered === null ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-[#030813] dark:text-white flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#fe9832] text-[18px]">thumb_up</span>
              <span>Was this answer helpful?</span>
            </p>
            <span className="text-[10px] text-gray-400 font-medium">Quick Feedback</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setAnswered('yes')}
              className="py-2 px-3 bg-white dark:bg-[#1a2332] hover:bg-emerald-500/10 border border-[#e0e3e5] dark:border-[#243044] hover:border-emerald-500 rounded-xl text-xs font-bold text-[#030813] dark:text-white transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
            >
              <span className="text-base">👍</span>
              <span>Yes, Helpful</span>
            </button>

            <button
              onClick={() => setAnswered('no')}
              className="py-2 px-3 bg-white dark:bg-[#1a2332] hover:bg-rose-500/10 border border-[#e0e3e5] dark:border-[#243044] hover:border-rose-500 rounded-xl text-xs font-bold text-[#030813] dark:text-white transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
            >
              <span className="text-base">👎</span>
              <span>Not Really</span>
            </button>
          </div>
        </>
      ) : answered === 'yes' ? (
        <div className="flex flex-col gap-2.5 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-[#8dfc75] font-bold">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Great to hear that! How can we proceed?</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-2 pt-0.5">
            <button
              onClick={onAskAnotherQuestion}
              className="flex-1 py-2 px-3.5 bg-gradient-to-r from-[#fe9832] to-[#e8872b] hover:brightness-105 active:scale-95 text-[#542900] rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">quiz</span>
              <span>Ask Another Question</span>
            </button>

            <button
              onClick={onEndChat}
              className="py-2 px-3.5 bg-white dark:bg-[#1a2332] hover:bg-[#e0e3e5] dark:hover:bg-[#253144] border border-[#e0e3e5] dark:border-[#243044] text-[#45474c] dark:text-[#c1c6d7] active:scale-95 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>End Chat</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-bold">
            <span className="material-symbols-outlined text-[18px]">sentiment_dissatisfied</span>
            <span>Sorry about that! Let&apos;s get you the right help:</span>
          </div>

          <div className="flex flex-col gap-2 pt-0.5">
            <button
              onClick={onAskAnotherQuestion}
              className="w-full py-2 px-3.5 bg-gradient-to-r from-[#fe9832] to-[#e8872b] hover:brightness-105 active:scale-95 text-[#542900] rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Try Another Question</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleContactTeam}
                className="py-2 px-3 bg-white dark:bg-[#1a2332] hover:border-[#fe9832] border border-[#e0e3e5] dark:border-[#243044] text-[#030813] dark:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px] text-[#fe9832]">support_agent</span>
                <span>Contact Team</span>
              </button>

              <button
                onClick={onEndChat}
                className="py-2 px-3 bg-white dark:bg-[#1a2332] hover:bg-[#e0e3e5] dark:hover:bg-[#253144] border border-[#e0e3e5] dark:border-[#243044] text-[#45474c] dark:text-[#c1c6d7] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
              >
                <span>End Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
