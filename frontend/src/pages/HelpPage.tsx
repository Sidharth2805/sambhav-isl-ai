import React, { useState, useMemo } from 'react';
import {
  SUPPORT_CATEGORIES,
  searchSupportProblems,
  type SupportProblem,
  type SupportCategory,
} from '../data/helpAssistantData';
import { ProblemDetailViewer } from '../components/help/ProblemDetailViewer';
import { SupportContactSection } from '../components/help/SupportContactSection';

type HelpViewState = 'categories' | 'questions' | 'solution';

export const HelpPage: React.FC = () => {
  const [viewState, setViewState] = useState<HelpViewState>('categories');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('communication');
  const [selectedProblem, setSelectedProblem] = useState<SupportProblem | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [showContactDesk, setShowContactDesk] = useState<boolean>(false);
  const [escalateSubject, setEscalateSubject] = useState<string>('');

  // Active category object
  const activeCategory: SupportCategory = useMemo(() => {
    return SUPPORT_CATEGORIES.find((c) => c.id === selectedCategoryId) || SUPPORT_CATEGORIES[0];
  }, [selectedCategoryId]);

  // Global search results across all issues
  const globalSearchResults = useMemo(() => {
    if (!globalSearchQuery.trim()) return [];
    return searchSupportProblems(globalSearchQuery);
  }, [globalSearchQuery]);

  // User selects a Category from the grid
  const handleSelectCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    setViewState('questions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // User selects a Question from the list or search
  const handleSelectProblem = (problem: SupportProblem) => {
    setSelectedProblem(problem);
    setSelectedCategoryId(problem.categoryId);
    setGlobalSearchQuery('');
    setViewState('solution');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to Category Grid
  const handleBackToCategories = () => {
    setViewState('categories');
    setSelectedProblem(null);
    setGlobalSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to Questions List
  const handleBackToQuestions = () => {
    setViewState('questions');
    setSelectedProblem(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Contact Support Desk
  const handleOpenContactSupport = () => {
    setShowContactDesk(true);
    setTimeout(() => {
      document.getElementById('support-contact-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Handle Escalation Ticket
  const handleEscalate = () => {
    const subject = selectedProblem ? selectedProblem.title : 'General Assistance';
    setEscalateSubject(subject);
    handleOpenContactSupport();
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1240px] mx-auto animate-fadeIn font-['Inter',sans-serif] pb-24">
      
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* STAGE 1: CATEGORIES & MAIN SEARCH (Only shown on Category Overview) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {viewState === 'categories' && (
        <>
          {/* Main Top Header with Search Bar */}
          <header className="flex flex-col gap-6 border-b border-[#e0e3e5] dark:border-[#243044] pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#fe9832] to-[#e8872b] text-[#542900] flex items-center justify-center font-black shadow-md shrink-0">
                  <span className="material-symbols-outlined text-[28px]">support_agent</span>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#030813] dark:text-white tracking-tight flex items-center gap-2.5">
                    <span>Help & Support Center</span>
                    <span className="text-xs font-bold text-[#8dfc75] bg-[#8dfc75]/10 border border-[#8dfc75]/20 px-2.5 py-0.5 rounded-full">
                      Self-Service
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-[#45474c] dark:text-[#c1c6d7] mt-0.5 font-medium">
                    Find instant solutions, guided troubleshooting, and user-end fixes for Sambhav.
                  </p>
                </div>
              </div>

              {/* Always-Active Contact Support Button */}
              <button
                onClick={handleOpenContactSupport}
                className="self-start md:self-auto flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#151c28] border border-[#e0e3e5] dark:border-[#243044] hover:border-[#fe9832] rounded-xl text-xs font-bold text-[#030813] dark:text-white transition-all shadow-sm hover:scale-105 active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px] text-[#fe9832]">contact_support</span>
                <span>Contact Support</span>
              </button>
            </div>

            {/* Single Direct Universal Search Bar */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center">
                <span className="material-symbols-outlined text-[22px]">search</span>
              </div>
              <input
                type="text"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Search any issue directly (e.g. 'microphone not working', 'avatar is stuck', 'camera blocked', 'login password')..."
                className="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-[#151c28] border border-[#e0e3e5] dark:border-[#243044] focus:border-[#fe9832] focus:ring-2 focus:ring-[#fe9832]/20 rounded-2xl text-xs sm:text-sm text-[#030813] dark:text-white placeholder-[#45474c]/50 dark:placeholder-[#828796]/60 transition-all outline-none shadow-xs"
              />
              {globalSearchQuery && (
                <button
                  onClick={() => setGlobalSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#030813] dark:hover:text-white"
                  title="Clear search"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>
          </header>

          {/* Global Search Results Overlay (Only when user types in search) */}
          {globalSearchQuery.trim() ? (
            <section className="bg-white dark:bg-[#151c28] rounded-3xl border border-[#fe9832]/40 p-6 sm:p-8 shadow-xl flex flex-col gap-5 animate-slideUp">
              <div className="flex items-center justify-between border-b border-[#e0e3e5] dark:border-[#243044] pb-4">
                <span className="text-xs font-black uppercase tracking-wider text-[#030813] dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#fe9832]">manage_search</span>
                  <span>Search Results for &ldquo;{globalSearchQuery}&rdquo;</span>
                </span>
                <span className="text-xs text-gray-400 font-semibold">{globalSearchResults.length} issues found</span>
              </div>

              {globalSearchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {globalSearchResults.map((prob) => (
                    <button
                      key={prob.id}
                      onClick={() => handleSelectProblem(prob)}
                      className="p-5 bg-[#f8fafc] dark:bg-[#0c121e] hover:bg-[#fe9832]/10 border border-[#e0e3e5] dark:border-[#243044] hover:border-[#fe9832] rounded-2xl text-left transition-all flex items-center justify-between gap-4 group shadow-2xs"
                    >
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-[#030813] dark:text-white group-hover:text-[#fe9832] transition-colors block truncate">
                          {prob.title}
                        </span>
                        <span className="text-xs text-[#45474c] dark:text-[#828796] block truncate mt-1">
                          {prob.summary}
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-[20px] text-gray-400 group-hover:text-[#fe9832] transition-transform group-hover:translate-x-0.5 shrink-0">
                        arrow_forward
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs sm:text-sm text-[#45474c] dark:text-[#c1c6d7]">
                  No direct matches found for &ldquo;{globalSearchQuery}&rdquo;. You can explore the categories below or contact support.
                </div>
              )}
            </section>
          ) : (
            /* Full Category Grid View */
            <section className="flex flex-col gap-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#030813] dark:text-white tracking-tight">
                    Choose a Problem Category
                  </h2>
                  <p className="text-xs sm:text-sm text-[#45474c] dark:text-[#828796] mt-0.5">
                    Click any category to browse all related questions and solutions.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#fe9832] bg-[#fe9832]/10 border border-[#fe9832]/20 px-3 py-1 rounded-full">
                  {SUPPORT_CATEGORIES.length} Categories
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SUPPORT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className="p-6 sm:p-7 bg-white dark:bg-[#151c28] hover:bg-gradient-to-br hover:from-white hover:to-[#fe9832]/5 dark:hover:from-[#151c28] dark:hover:to-[#fe9832]/10 border border-[#e0e3e5] dark:border-[#243044] hover:border-[#fe9832] rounded-3xl text-left transition-all duration-300 flex flex-col justify-between gap-6 group shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#fe9832]/10 text-[#fe9832] group-hover:bg-[#fe9832] group-hover:text-[#542900] flex items-center justify-center font-bold transition-all duration-300 shadow-inner shrink-0">
                        <span className="material-symbols-outlined text-[28px]">{cat.icon}</span>
                      </div>

                      <span className="text-[10px] font-extrabold text-[#45474c] dark:text-[#828796] bg-[#f1f4f6] dark:bg-[#0c121e] px-3 py-1 rounded-full border border-[#e0e3e5] dark:border-[#243044]">
                        {cat.problems.length} Issues
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-[#030813] dark:text-white group-hover:text-[#fe9832] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-[#45474c] dark:text-[#828796] mt-1.5 leading-relaxed line-clamp-2 font-medium">
                        {cat.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-[#fe9832] pt-3.5 border-t border-black/5 dark:border-white/5">
                      <span>Browse Questions</span>
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* STAGE 2: QUESTIONS LIST VIEW (Whole screen dedicated to questions)  */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {viewState === 'questions' && (
        <section className="flex flex-col gap-6 animate-fadeIn">
          {/* Header Bar with Back Button */}
          <div className="flex items-center justify-between gap-4 bg-white dark:bg-[#151c28] p-6 sm:p-7 rounded-3xl border border-[#e0e3e5] dark:border-[#243044] shadow-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToCategories}
                className="w-11 h-11 rounded-2xl bg-[#f1f4f6] dark:bg-[#0c121e] hover:bg-[#fe9832]/15 border border-[#e0e3e5] dark:border-[#243044] hover:border-[#fe9832] text-[#fe9832] flex items-center justify-center transition-all group shrink-0 shadow-xs"
                title="Back to All Categories"
              >
                <span className="material-symbols-outlined text-[22px] group-hover:-translate-x-0.5 transition-transform">
                  arrow_back
                </span>
              </button>

              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#828796] uppercase tracking-wider">
                  <span>Categories</span>
                  <span>/</span>
                  <span className="text-[#fe9832]">{activeCategory.name}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#030813] dark:text-white tracking-tight mt-0.5">
                  {activeCategory.name}
                </h2>
              </div>
            </div>

            <button
              onClick={handleBackToCategories}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-[#f8fafc] dark:bg-[#0c121e] hover:bg-[#fe9832]/10 border border-[#e0e3e5] dark:border-[#243044] rounded-xl text-xs font-bold text-[#030813] dark:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-[#fe9832]">grid_view</span>
              <span>All Categories</span>
            </button>
          </div>

          {/* List of Questions */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase text-[#45474c] dark:text-[#828796] tracking-wider">
                Select Your Question ({activeCategory.problems.length} Available)
              </span>
              <span className="text-[11px] text-[#fe9832] font-bold">Click to view fix</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeCategory.problems.map((prob, idx) => (
                <button
                  key={prob.id}
                  onClick={() => handleSelectProblem(prob)}
                  className="p-6 bg-white dark:bg-[#151c28] hover:bg-gradient-to-br hover:from-white hover:to-[#fe9832]/5 dark:hover:from-[#151c28] dark:hover:to-[#fe9832]/10 border border-[#e0e3e5] dark:border-[#243044] hover:border-[#fe9832] rounded-3xl text-left transition-all duration-200 flex flex-col justify-between gap-4 group shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-[#f1f4f6] dark:bg-[#0c121e] text-xs font-black text-[#fe9832] flex items-center justify-center shrink-0 border border-[#e0e3e5] dark:border-[#243044] mt-0.5 shadow-2xs">
                      {idx + 1}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-[#030813] dark:text-white group-hover:text-[#fe9832] transition-colors leading-snug">
                      {prob.title}
                    </h3>
                  </div>

                  <p className="text-xs text-[#45474c] dark:text-[#828796] pl-10 leading-relaxed font-medium">
                    {prob.summary}
                  </p>

                  <div className="flex items-center justify-between text-xs font-bold text-[#fe9832] pt-3 border-t border-black/5 dark:border-white/5 pl-10">
                    <span>View Solution & Diagnostic</span>
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* STAGE 3: SOLUTION VIEW (Whole screen dedicated to solution)        */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {viewState === 'solution' && selectedProblem && (
        <section className="animate-fadeIn">
          <ProblemDetailViewer
            problem={selectedProblem}
            onBackToQuestions={handleBackToQuestions}
            onResetToCategories={handleBackToCategories}
            onEscalate={handleEscalate}
          />
        </section>
      )}

      {/* 4. Support Desk Contact Section */}
      {showContactDesk && (
        <div className="mt-4 pt-8 border-t border-[#e0e3e5] dark:border-[#243044]">
          <SupportContactSection
            initialSubject={escalateSubject}
            onSubmittedSuccess={() => setShowContactDesk(false)}
          />
        </div>
      )}

    </div>
  );
};

export default HelpPage;
