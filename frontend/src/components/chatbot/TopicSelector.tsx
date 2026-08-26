import React from 'react';
import { CHATBOT_TOPICS, type ChatTopic } from '../../data/chatbotKnowledge';

interface TopicSelectorProps {
  onSelectTopic: (topic: ChatTopic) => void;
}

const topicGradients: Record<string, { bg: string; iconBg: string; text: string }> = {
  'isl-accessibility': {
    bg: 'hover:border-blue-500/50 hover:bg-blue-500/5',
    iconBg: 'bg-blue-500/10 text-blue-500',
    text: 'text-blue-500',
  },
  'learn-isl': {
    bg: 'hover:border-emerald-500/50 hover:bg-emerald-500/5',
    iconBg: 'bg-emerald-500/10 text-emerald-500',
    text: 'text-emerald-500',
  },
  'national-culture': {
    bg: 'hover:border-amber-500/50 hover:bg-amber-500/5',
    iconBg: 'bg-amber-500/10 text-amber-500',
    text: 'text-amber-500',
  },
  'news-info': {
    bg: 'hover:border-purple-500/50 hover:bg-purple-500/5',
    iconBg: 'bg-purple-500/10 text-purple-500',
    text: 'text-purple-500',
  },
  'help-guide': {
    bg: 'hover:border-orange-500/50 hover:bg-orange-500/5',
    iconBg: 'bg-orange-500/10 text-orange-500',
    text: 'text-orange-500',
  },
  'others': {
    bg: 'hover:border-teal-500/50 hover:bg-teal-500/5',
    iconBg: 'bg-teal-500/10 text-teal-500',
    text: 'text-teal-500',
  },
};

export const TopicSelector: React.FC<TopicSelectorProps> = ({ onSelectTopic }) => {
  return (
    <div className="flex flex-col gap-2 animate-fadeIn">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-extrabold text-[#45474c] dark:text-[#828796] uppercase tracking-wider">
          Suggested Topics
        </span>
        <span className="text-[10px] text-[#fe9832] font-semibold">Select one to explore</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CHATBOT_TOPICS.map((topic) => {
          const style = topicGradients[topic.id] || topicGradients['others'];
          return (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic)}
              className={`flex items-center gap-2.5 p-2.5 bg-white dark:bg-[#151c28] border border-[#e0e3e5] dark:border-[#243044] rounded-2xl text-left transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 active:scale-[0.98] group ${style.bg}`}
            >
              <div
                className={`w-9 h-9 rounded-xl ${style.iconBg} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform`}
              >
                <span className="material-symbols-outlined text-[19px]">{topic.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#030813] dark:text-white group-hover:text-[#fe9832] truncate transition-colors">
                  {topic.name}
                </p>
                <p className="text-[10px] text-[#45474c] dark:text-[#828796] truncate">
                  {topic.id === 'others' ? 'Type custom question' : `${topic.questions.length} questions`}
                </p>
              </div>
              <span className="material-symbols-outlined text-[15px] text-gray-400 group-hover:translate-x-0.5 group-hover:text-[#fe9832] transition-all shrink-0">
                arrow_forward_ios
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
