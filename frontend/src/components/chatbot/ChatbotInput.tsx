import React, { useState } from 'react';

interface ChatbotInputProps {
  onSubmit: (text: string) => void;
  onBackToTopics: () => void;
  placeholder?: string;
}

export const ChatbotInput: React.FC<ChatbotInputProps> = ({
  onSubmit,
  onBackToTopics,
  placeholder = 'Ask anything about SAMBHAV or ISL...',
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSubmit(inputText.trim());
    setInputText('');
  };

  const sampleSuggestions = [
    'How do I use avatar?',
    'What is ISL?',
    'How to start a call?',
    'National anthem in ISL',
    'Microphone not working',
  ];

  return (
    <div className="flex flex-col gap-2.5 p-1 animate-fadeIn">
      <div className="flex items-center justify-between px-1 bg-[#e0e3e5]/60 dark:bg-[#1a2332]/60 p-2 rounded-xl border border-[#e0e3e5] dark:border-[#243044]">
        <button
          type="button"
          onClick={onBackToTopics}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#fe9832] hover:text-[#e8872b] transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Topics</span>
        </button>
        <span className="text-[10px] text-gray-400 font-semibold">Custom Query Search</span>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex flex-col gap-1 px-1">
        <span className="text-[10px] font-extrabold text-[#45474c] dark:text-[#828796] uppercase tracking-wider">
          Suggested Queries:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {sampleSuggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSubmit(s)}
              className="px-2.5 py-1 bg-white dark:bg-[#151c28] hover:bg-[#fe9832]/10 border border-[#e0e3e5] dark:border-[#243044] hover:border-[#fe9832] rounded-full text-[10px] font-medium text-[#45474c] dark:text-[#c1c6d7] transition-all hover:scale-105 active:scale-95 shadow-xs"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative flex items-center mt-1">
        <div className="absolute left-3 text-gray-400 pointer-events-none flex items-center">
          <span className="material-symbols-outlined text-[18px]">search</span>
        </div>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-12 py-2.5 bg-white dark:bg-[#151c28] border border-[#e0e3e5] dark:border-[#243044] focus:border-[#fe9832] focus:ring-2 focus:ring-[#fe9832]/20 rounded-2xl text-xs text-[#030813] dark:text-white placeholder-[#45474c]/50 dark:placeholder-[#828796]/60 transition-all outline-none shadow-sm"
          autoFocus
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="absolute right-1.5 px-3 py-1.5 bg-gradient-to-r from-[#fe9832] to-[#e8872b] hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-[#542900] rounded-xl font-bold transition-all shadow-sm flex items-center justify-center"
          title="Search Knowledge Base"
        >
          <span className="material-symbols-outlined text-[16px]">send</span>
        </button>
      </form>
    </div>
  );
};
