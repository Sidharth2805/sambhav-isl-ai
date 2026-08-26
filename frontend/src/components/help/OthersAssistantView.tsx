import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchSupportProblems, type SupportProblem } from '../../data/helpAssistantData';
import { matchQuestionInKnowledgeBase } from '../../data/chatbotKnowledge';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  actionLabel?: string;
  actionRoute?: string;
  steps?: string[];
  options?: { title: string; steps: string[] }[];
  showSatisfaction?: boolean;
  showEscalation?: boolean;
}

interface OthersAssistantViewProps {
  onBackToCategories: () => void;
  onEscalate: () => void;
}

export const OthersAssistantView: React.FC<OthersAssistantViewProps> = ({
  onBackToCategories,
  onEscalate,
}) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'greeting-1',
      sender: 'bot',
      text: 'Namaste! I am the Sambhav Assistant. Please describe any question or issue you are experiencing with video calls, the 3D avatar, speech recognition, translation, account login, or general features.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const quickPrompts = [
    'My microphone is not working in the call',
    'The 3D avatar screen is blank or frozen',
    'Speech is not converting to text',
    'How do I reset my password?',
    'Call keeps disconnecting or lagging',
    'How do I access news in ISL?',
  ];

  const handleSendMessage = (textToSend: string) => {
    const cleanText = textToSend.trim();
    if (!cleanText || isProcessing) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: cleanText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    setTimeout(() => {
      // 1. Search in Support Problems database (85+ problems)
      const supportMatches: SupportProblem[] = searchSupportProblems(cleanText);
      // 2. Search in Chatbot Knowledge Base
      const knowledgeMatch = matchQuestionInKnowledgeBase(cleanText);

      if (supportMatches.length > 0) {
        const top = supportMatches[0];
        const botResponse: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `Here is the solution for "${top.title}":\n\n${top.summary}`,
          steps: top.solution,
          options: top.multipleOptions?.map((o) => ({ title: o.title, steps: o.steps })),
          actionLabel: top.actionLabel,
          actionRoute: top.actionRoute,
          showSatisfaction: true,
        };
        setMessages((prev) => [...prev, botResponse]);
      } else if (knowledgeMatch) {
        const botResponse: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `${knowledgeMatch.answer}`,
          actionLabel: knowledgeMatch.actionLabel,
          actionRoute: knowledgeMatch.actionRoute,
          showSatisfaction: true,
        };
        setMessages((prev) => [...prev, botResponse]);
      } else {
        const botFallback: Message = {
          id: `bot-fallback-${Date.now()}`,
          sender: 'bot',
          text: `I couldn't find a direct automated solution for "${cleanText}" in our predefined knowledge base. Our accessibility team is available to assist you directly.`,
          showEscalation: true,
        };
        setMessages((prev) => [...prev, botFallback]);
      }
      setIsProcessing(false);
    }, 600);
  };

  const handleSatisfactionAnswer = (msgId: string, isSolved: boolean) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, showSatisfaction: false } : m))
    );

    if (isSolved) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-resolved-${Date.now()}`,
          sender: 'bot',
          text: 'Great! I am glad we could resolve your problem. Would you like to ask anything else, or end this session?',
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-unresolved-${Date.now()}`,
          sender: 'bot',
          text: 'I am sorry this did not resolve your issue. Please connect with our human support desk below for personalized assistance.',
          showEscalation: true,
        },
      ]);
    }
  };

  const handleClearAndEndChat = () => {
    setMessages([
      {
        id: 'greeting-1',
        sender: 'bot',
        text: 'Namaste! I am the Sambhav Assistant. Please describe any question or issue you are experiencing.',
      },
    ]);
    onBackToCategories();
  };

  return (
    <div className="bg-white dark:bg-[#151c28] rounded-3xl border border-[#e0e3e5] dark:border-[#243044] p-6 sm:p-8 shadow-sm flex flex-col gap-6 animate-fadeIn font-['Inter',sans-serif]">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e0e3e5] dark:border-[#243044] pb-5">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBackToCategories}
            className="w-10 h-10 rounded-2xl bg-[#f1f4f6] dark:bg-[#0c121e] hover:bg-[#fe9832]/15 border border-[#e0e3e5] dark:border-[#243044] hover:border-[#fe9832] text-[#fe9832] flex items-center justify-center transition-all group shrink-0"
            title="Back to All Categories"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
          </button>

          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#828796] uppercase tracking-wider">
              <span>Categories</span>
              <span>/</span>
              <span className="text-[#fe9832]">Others</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#030813] dark:text-white tracking-tight flex items-center gap-2">
              <span>Custom Problem Assistant</span>
              <span className="text-[10px] font-bold text-[#8dfc75] bg-[#8dfc75]/10 border border-[#8dfc75]/20 px-2 py-0.5 rounded-full">
                Interactive
              </span>
            </h2>
          </div>
        </div>

        <button
          onClick={handleClearAndEndChat}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          <span>Clear & Return to Categories</span>
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-black uppercase tracking-wider text-[#45474c] dark:text-[#828796]">
          Suggested Questions:
        </span>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3.5 py-1.5 bg-[#f8fafc] dark:bg-[#0c121e] hover:bg-[#fe9832]/10 border border-[#e0e3e5] dark:border-[#243044] hover:border-[#fe9832] rounded-full text-xs font-medium text-[#030813] dark:text-[#c1c6d7] transition-all hover:scale-105 active:scale-95 shadow-2xs text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Conversation Feed */}
      <div className="p-4 sm:p-6 bg-[#f8fafc] dark:bg-[#0c121e] border border-[#e0e3e5] dark:border-[#243044] rounded-2xl flex flex-col gap-4 max-h-[480px] overflow-y-auto custom-scrollbar">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 animate-fadeIn ${
                isBot ? 'justify-start' : 'justify-end'
              }`}
            >
              {isBot && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#030813] to-[#1a2536] text-[#fe9832] flex items-center justify-center shrink-0 border border-[#fe9832]/30 shadow-sm mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                </div>
              )}

              <div
                className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                  isBot
                    ? 'bg-white dark:bg-[#151c28] text-[#030813] dark:text-[#f7fafc] border border-[#e0e3e5] dark:border-[#243044] rounded-tl-sm'
                    : 'bg-gradient-to-r from-[#fe9832] to-[#e8872b] text-[#542900] font-bold rounded-tr-sm shadow-md'
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                {/* Step-by-Step Solutions */}
                {msg.steps && msg.steps.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/10 flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase text-[#fe9832]">
                      Step-by-Step Fix:
                    </span>
                    {msg.steps.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-2 text-xs">
                        <span className="w-4 h-4 rounded-md bg-[#f1f4f6] dark:bg-[#0c121e] text-[#fe9832] font-black text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <p className="flex-1 font-medium">{step}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Multiple Options if available */}
                {msg.options && msg.options.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/10 flex flex-col gap-2.5">
                    <span className="text-[10px] font-black uppercase text-[#8dfc75]">
                      Alternative Solution Options:
                    </span>
                    {msg.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className="p-3 bg-[#f8fafc] dark:bg-[#0c121e] rounded-xl border border-[#e0e3e5] dark:border-[#243044] flex flex-col gap-1"
                      >
                        <span className="font-bold text-[#fe9832]">{opt.title}</span>
                        {opt.steps.map((st, stIdx) => (
                          <p key={stIdx} className="text-[11px] text-gray-400 pl-2">
                            • {st}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Navigation Button */}
                {msg.actionLabel && msg.actionRoute && (
                  <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => navigate(msg.actionRoute!)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#fe9832] to-[#e8872b] hover:brightness-110 active:scale-95 text-[#542900] font-black text-xs rounded-xl transition-all shadow-sm group"
                    >
                      <span>{msg.actionLabel}</span>
                      <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                    <span className="text-[10px] text-gray-400 italic">Instant Navigation</span>
                  </div>
                )}

                {/* Satisfaction Prompt */}
                {msg.showSatisfaction && (
                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex flex-col gap-2.5">
                    <span className="font-bold text-xs">Did this answer solve your problem?</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSatisfactionAnswer(msg.id, true)}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-[#8dfc75] rounded-xl font-bold text-xs transition-all active:scale-95"
                      >
                        ✓ Yes, Problem Solved
                      </button>
                      <button
                        onClick={() => handleSatisfactionAnswer(msg.id, false)}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl font-bold text-xs transition-all active:scale-95"
                      >
                        ✕ No, I Need More Help
                      </button>
                    </div>
                  </div>
                )}

                {/* Escalation Options */}
                {msg.showEscalation && (
                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex flex-col gap-2.5">
                    <span className="font-bold text-xs text-amber-500">
                      Need Personalized Assistance?
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={onEscalate}
                        className="px-3.5 py-2 bg-gradient-to-r from-[#fe9832] to-[#e8872b] hover:brightness-110 active:scale-95 text-[#542900] rounded-xl font-black text-xs transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">outgoing_mail</span>
                        <span>Submit Support Ticket</span>
                      </button>

                      <a
                        href="tel:+918045678900"
                        className="px-3.5 py-2 bg-white dark:bg-[#1a2332] hover:border-[#fe9832] border border-[#e0e3e5] dark:border-[#243044] text-[#030813] dark:text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px] text-[#8dfc75]">call</span>
                        <span>Call Helpline</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-gray-400 animate-pulse">
            <span className="material-symbols-outlined text-[18px] text-[#fe9832]">smart_toy</span>
            <span>Sambhav Assistant is analyzing your query...</span>
          </div>
        )}

        <div ref={scrollEndRef} />
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Describe your issue in detail (e.g. 'I cannot hear the other person in my video call')..."
          className="w-full pl-5 pr-28 py-3.5 bg-[#f8fafc] dark:bg-[#0c121e] border border-[#e0e3e5] dark:border-[#243044] focus:border-[#fe9832] focus:ring-2 focus:ring-[#fe9832]/20 rounded-2xl text-xs sm:text-sm text-[#030813] dark:text-white placeholder-[#45474c]/50 dark:placeholder-[#828796]/60 transition-all outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isProcessing}
          className="absolute right-2 px-4 py-2 bg-gradient-to-r from-[#fe9832] to-[#e8872b] hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-[#542900] rounded-xl font-black text-xs transition-all shadow-sm flex items-center gap-1"
        >
          <span>Send</span>
          <span className="material-symbols-outlined text-[16px]">send</span>
        </button>
      </form>

    </div>
  );
};
