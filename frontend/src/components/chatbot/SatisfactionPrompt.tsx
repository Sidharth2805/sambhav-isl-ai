import React, { useState } from 'react';

interface SatisfactionPromptProps {
  onAskAnotherQuestion: () => void;
  onEndChat: () => void;
}

export const SatisfactionPrompt: React.FC<SatisfactionPromptProps> = ({
  onAskAnotherQuestion,
  onEndChat,
}) => {
  const [answered, setAnswered] = useState<'yes' | 'no' | null>(null);
  const [showSupportInfo, setShowSupportInfo] = useState(false);
  const [feedbackSuggestion, setFeedbackSuggestion] = useState('');
  const [suggestionSubmitted, setSuggestionSubmitted] = useState(false);

  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackSuggestion.trim()) return;

    try {
      const existing = JSON.parse(localStorage.getItem('sambhav_chatbot_feedback') || '[]');
      existing.unshift({
        suggestion: feedbackSuggestion.trim(),
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('sambhav_chatbot_feedback', JSON.stringify(existing.slice(0, 50)));
    } catch {
      // Ignore
    }

    setSuggestionSubmitted(true);
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
              type="button"
              onClick={() => setAnswered('yes')}
              className="py-2 px-3 bg-white dark:bg-[#1a2332] hover:bg-emerald-500/10 border border-[#e0e3e5] dark:border-[#243044] hover:border-emerald-500 rounded-xl text-xs font-bold text-[#030813] dark:text-white transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm cursor-pointer"
            >
              <span className="text-base">👍</span>
              <span>Yes, Helpful</span>
            </button>

            <button
              type="button"
              onClick={() => setAnswered('no')}
              className="py-2 px-3 bg-white dark:bg-[#1a2332] hover:bg-rose-500/10 border border-[#e0e3e5] dark:border-[#243044] hover:border-rose-500 rounded-xl text-xs font-bold text-[#030813] dark:text-white transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm cursor-pointer"
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
              type="button"
              onClick={onAskAnotherQuestion}
              className="flex-1 py-2 px-3.5 bg-gradient-to-r from-[#fe9832] to-[#e8872b] hover:brightness-105 active:scale-95 text-[#542900] rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">quiz</span>
              <span>Ask Another Question</span>
            </button>

            <button
              type="button"
              onClick={onEndChat}
              className="py-2 px-3.5 bg-white dark:bg-[#1a2332] hover:bg-[#e0e3e5] dark:hover:bg-[#253144] border border-[#e0e3e5] dark:border-[#243044] text-[#45474c] dark:text-[#c1c6d7] active:scale-95 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
            <span>Sorry about that! Help us improve or contact support:</span>
          </div>

          {!suggestionSubmitted ? (
            <form onSubmit={handleSubmitSuggestion} className="flex flex-col gap-2 bg-slate-50 dark:bg-[#0c121e] p-3 rounded-xl border border-slate-200 dark:border-[#243044]">
              <label htmlFor="not-really-feedback" className="text-[11px] font-bold text-gray-800 dark:text-gray-200">
                What were you looking for or how can we improve?
              </label>
              <textarea
                id="not-really-feedback"
                rows={2}
                required
                value={feedbackSuggestion}
                onChange={(e) => setFeedbackSuggestion(e.target.value)}
                placeholder="Type your suggestion or what was missing..."
                className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-[#2d3133] bg-white dark:bg-[#151c28] text-gray-900 dark:text-white outline-none focus:border-[#fe9832]"
              />
              <button
                type="submit"
                className="py-1.5 px-3 bg-gradient-to-r from-[#fe9832] to-[#e8872b] text-[#542900] font-extrabold text-xs rounded-lg transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">send</span>
                <span>Submit Suggestion</span>
              </button>
            </form>
          ) : (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-800 dark:text-[#8dfc75] font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Thank you! Your suggestion will help improve SAMBHAV.</span>
            </div>
          )}

          {!showSupportInfo ? (
            <div className="flex flex-col gap-2 pt-0.5">
              <button
                type="button"
                onClick={onAskAnotherQuestion}
                className="w-full py-2 px-3.5 bg-gradient-to-r from-[#fe9832] to-[#e8872b] hover:brightness-105 active:scale-95 text-[#542900] rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>Try Another Question</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowSupportInfo(true)}
                  className="py-2 px-3 bg-white dark:bg-[#1a2332] hover:border-[#fe9832] border border-[#e0e3e5] dark:border-[#243044] text-[#030813] dark:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#fe9832]">support_agent</span>
                  <span>Contact Team</span>
                </button>

                <button
                  type="button"
                  onClick={onEndChat}
                  className="py-2 px-3 bg-white dark:bg-[#1a2332] hover:bg-[#e0e3e5] dark:hover:bg-[#253144] border border-[#e0e3e5] dark:border-[#243044] text-[#45474c] dark:text-[#c1c6d7] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm cursor-pointer"
                >
                  <span>End Chat</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-0.5 animate-fadeIn">
              <div className="p-2.5 bg-white dark:bg-[#151c28] border border-[#e0e3e5] dark:border-[#243044] rounded-xl text-[11px] text-[#475569] dark:text-[#cbd5e1] space-y-1">
                <p className="font-bold text-[#030813] dark:text-white">Sambhav Support Helpdesk</p>
                <p>Email: <a href="mailto:nayak.subham2426@gmail.com" className="text-sky-600 dark:text-sky-400 underline font-medium">nayak.subham2426@gmail.com</a></p>
                <p>Helpline: <span className="font-medium text-emerald-600 dark:text-emerald-400">1800-SAMBHAV</span></p>
              </div>
              <button
                type="button"
                onClick={onAskAnotherQuestion}
                className="w-full py-2 px-3.5 bg-gradient-to-r from-[#fe9832] to-[#e8872b] hover:brightness-105 active:scale-95 text-[#542900] rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>Choose Another Topic</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SatisfactionPrompt;
