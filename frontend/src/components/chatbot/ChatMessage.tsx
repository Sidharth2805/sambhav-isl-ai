import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface MessageItem {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  actionLabel?: string;
  actionRoute?: string;
  timestamp?: string;
}

interface ChatMessageProps {
  message: MessageItem;
  onActionClick?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onActionClick }) => {
  const navigate = useNavigate();
  const isBot = message.sender === 'bot';

  const handleAction = () => {
    if (message.actionRoute) {
      navigate(message.actionRoute);
    }
    if (onActionClick) {
      onActionClick();
    }
  };

  return (
    <div
      className={`flex items-start gap-2.5 animate-fadeIn ${
        isBot ? 'justify-start' : 'justify-end'
      }`}
    >
      {isBot && (
        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#030813] to-[#1a2536] text-[#fe9832] flex items-center justify-center shrink-0 border border-[#fe9832]/30 shadow-sm mt-0.5">
          <span className="material-symbols-outlined text-[16px]">smart_toy</span>
        </div>
      )}

      <div
        className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed transition-all shadow-sm ${
          isBot
            ? 'bg-white dark:bg-[#151c28] text-[#030813] dark:text-[#f7fafc] border border-[#e0e3e5] dark:border-[#243044] rounded-tl-sm'
            : 'bg-gradient-to-r from-[#fe9832] to-[#f78619] text-[#4a2400] font-semibold rounded-tr-sm shadow-md'
        }`}
      >
        <p className="whitespace-pre-line leading-relaxed">{message.text}</p>

        {/* Action Button for Navigation if present */}
        {message.actionLabel && message.actionRoute && (
          <div className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
            <button
              onClick={handleAction}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#fe9832] to-[#e8872b] hover:brightness-110 active:scale-95 text-[#542900] font-black text-[11px] rounded-xl transition-all shadow-sm group"
            >
              <span>{message.actionLabel}</span>
              <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </button>
            <span className="text-[10px] text-gray-400 font-medium italic">Instant redirect</span>
          </div>
        )}
      </div>
    </div>
  );
};
