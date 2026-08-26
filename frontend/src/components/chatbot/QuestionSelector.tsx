import React from 'react';
import type { ChatTopic, ChatQuestion } from '../../data/chatbotKnowledge';

interface QuestionSelectorProps {
  topic: ChatTopic;
  onSelectQuestion: (question: ChatQuestion) => void;
  onBackToTopics: () => void;
}

export const QuestionSelector: React.FC<QuestionSelectorProps> = ({
  topic,
  onSelectQuestion,
  onBackToTopics,
}) => {
  return (
    <div className="flex flex-col gap-2 animate-fadeIn">
      {/* Header bar with Back button */}
      <div className="flex items-center justify-between px-1 bg-[#e0e3e5]/60 dark:bg-[#1a2332]/60 p-2 rounded-xl border border-[#e0e3e5] dark:border-[#243044]">
        <button
          type="button"
          onClick={onBackToTopics}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#fe9832] hover:text-[#e8872b] transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Topics</span>
        </button>
        <span className="text-[11px] text-[#030813] dark:text-white font-bold truncate max-w-[180px]">
          {topic.name}
        </span>
      </div>

      <div className="flex items-center justify-between px-1 pt-1">
        <span className="text-[11px] font-extrabold text-[#45474c] dark:text-[#828796] uppercase tracking-wider">
          Pick a Question:
        </span>
        <span className="text-[10px] text-gray-400 font-semibold">{topic.questions.length} available</span>
      </div>

      <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto pr-0.5 custom-scrollbar">
        {topic.questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => onSelectQuestion(q)}
            className="w-full text-left p-3 bg-white dark:bg-[#151c28] hover:bg-[#fe9832]/10 dark:hover:bg-[#fe9832]/15 border border-[#e0e3e5] dark:border-[#243044] hover:border-[#fe9832] rounded-xl text-xs font-semibold text-[#030813] dark:text-white transition-all shadow-sm hover:shadow hover:translate-x-0.5 active:scale-[0.99] flex items-center justify-between gap-2.5 group"
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <span className="w-5 h-5 rounded-md bg-[#f1f4f6] dark:bg-[#1f2a3c] text-[10px] font-bold text-[#45474c] dark:text-[#828796] group-hover:bg-[#fe9832] group-hover:text-[#683700] flex items-center justify-center shrink-0 transition-colors">
                {idx + 1}
              </span>
              <span className="group-hover:text-[#fe9832] transition-colors truncate">
                {q.question}
              </span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-gray-400 group-hover:text-[#fe9832] transition-colors shrink-0">
              arrow_forward
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
