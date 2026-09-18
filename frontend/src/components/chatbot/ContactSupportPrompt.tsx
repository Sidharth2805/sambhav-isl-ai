import React, { useState } from 'react';

interface ContactSupportPromptProps {
  onTryAnotherQuestion: () => void;
  onEndChat: () => void;
}

export const ContactSupportPrompt: React.FC<ContactSupportPromptProps> = ({
  onTryAnotherQuestion,
  onEndChat,
}) => {
  const [showDirectContact, setShowDirectContact] = useState(false);

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

      {!showDirectContact ? (
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={() => setShowDirectContact(true)}
            className="w-full py-2.5 px-3.5 bg-gradient-to-r from-[#fe9832] to-[#e8872b] hover:brightness-105 active:scale-95 text-[#542900] rounded-xl font-extrabold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
            <span>View Direct Support Contacts</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onTryAnotherQuestion}
              className="py-2 px-3 bg-white dark:bg-[#1a2332] hover:border-[#fe9832] border border-[#e0e3e5] dark:border-[#243044] text-[#030813] dark:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Try Another</span>
            </button>

            <button
              type="button"
              onClick={onEndChat}
              className="py-2 px-3 bg-white dark:bg-[#1a2332] hover:bg-[#e0e3e5] dark:hover:bg-[#253144] border border-[#e0e3e5] dark:border-[#243044] text-[#45474c] dark:text-[#c1c6d7] rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm cursor-pointer"
            >
              <span>End Chat</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 pt-1 animate-fadeIn">
          <div className="p-3 bg-white dark:bg-[#151c28] border border-[#e0e3e5] dark:border-[#243044] rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#030813] dark:text-white text-[11px]">Direct Support Desk</span>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-[#8dfc75] border border-emerald-500/20">Active</span>
            </div>
            <div className="space-y-1 text-[11px] text-[#475569] dark:text-[#cbd5e1]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[15px] text-[#fe9832]">mail</span>
                <a href="mailto:support@sambhav-isl.ai" className="hover:underline text-sky-600 dark:text-sky-400 font-medium">support@sambhav-isl.ai</a>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[15px] text-emerald-500">call</span>
                <span className="font-medium">1800-SAMBHAV (Toll-Free, 9am - 6pm IST)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onTryAnotherQuestion}
              className="py-2 px-3 bg-white dark:bg-[#1a2332] hover:border-[#fe9832] border border-[#e0e3e5] dark:border-[#243044] text-[#030813] dark:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Ask Topic</span>
            </button>

            <button
              type="button"
              onClick={onEndChat}
              className="py-2 px-3 bg-white dark:bg-[#1a2332] hover:bg-[#e0e3e5] dark:hover:bg-[#253144] border border-[#e0e3e5] dark:border-[#243044] text-[#45474c] dark:text-[#c1c6d7] rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm cursor-pointer"
            >
              <span>End Chat</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

