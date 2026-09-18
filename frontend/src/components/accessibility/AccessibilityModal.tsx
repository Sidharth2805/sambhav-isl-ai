import React, { useState } from 'react';
import { useAccessibility } from '../../hooks/useAccessibility';

export const AccessibilityModal: React.FC = () => {
  const {
    isModalOpen,
    closeModal,
    settings,
    language,
    setLanguage,
    t,
    setColorFilter,
    increaseTextScale,
    decreaseTextScale,
    toggleLineHeight,
    toggleTextSpacing,
    toggleHighlightLinks,
    toggleDyslexiaFriendly,
    toggleTextMagnifier,
    toggleScreenReader,
    toggleVoiceSupport,
    toggleHideImages,
    toggleReadingGuideline,
    toggleFocusMode,
    toggleBigCursor,
    resetAllSettings,
    activeFeaturesCount,
  } = useAccessibility();

  const [activeTab, setActiveTab] = useState<'language' | 'color' | 'content' | 'orientation'>('language');

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fadeIn font-['Inter',sans-serif]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeModal}
        aria-hidden="true"
      />

      {/* Main Modal Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="a11y-modal-title"
        className="relative w-full max-w-3xl bg-white dark:bg-[#151c28] border border-indigo-100 dark:border-[#243044] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] a11y-panel text-[#0f172a] dark:text-white"
      >
        {/* Header with Generous Top Spacing */}
        <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-slate-100 dark:border-[#243044] bg-gradient-to-r from-sky-50/80 via-indigo-50/50 to-purple-50/60 dark:from-[#0d121d] dark:to-[#151c28] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-600 dark:bg-none dark:bg-[#fe9832] text-white dark:text-[#542900] flex items-center justify-center shadow-md shrink-0">
              <span className="material-symbols-outlined text-[26px]">accessibility_new</span>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 id="a11y-modal-title" className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {t('a11y.modal.title', 'Accessibility & Assistive Tools')}
              </h2>
              {activeFeaturesCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#fe9832] text-[#542900] text-[11px] font-black shadow-xs">
                  {activeFeaturesCount} {t('a11y.active', 'Active')}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeFeaturesCount > 0 && (
              <button
                type="button"
                onClick={resetAllSettings}
                className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                title={t('a11y.reset', 'Reset all accessibility settings')}
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span className="hidden sm:inline">{t('a11y.reset', 'Reset All')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={closeModal}
              className="p-2.5 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#1f293d] transition-colors cursor-pointer"
              aria-label={t('a11y.close', 'Close accessibility modal')}
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex border-b border-slate-100 dark:border-[#243044] bg-slate-50/50 dark:bg-[#0d121d]/70 px-4 sm:px-6 pt-2 shrink-0 overflow-x-auto gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('language')}
            className={`pb-3 px-3 text-xs sm:text-sm font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'language'
                ? 'border-indigo-600 dark:border-[#fe9832] text-indigo-600 dark:text-[#fe9832]'
                : 'border-transparent text-gray-500 dark:text-[#828796] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">translate</span>
            <span>{t('a11y.tab.language', 'Language / भाषा / ଭାଷା')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('color')}
            className={`pb-3 px-3 text-xs sm:text-sm font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'color'
                ? 'border-indigo-600 dark:border-[#fe9832] text-indigo-600 dark:text-[#fe9832]'
                : 'border-transparent text-gray-500 dark:text-[#828796] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">palette</span>
            <span>{t('a11y.tab.color', 'Color Adjustment')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`pb-3 px-3 text-xs sm:text-sm font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'content'
                ? 'border-indigo-600 dark:border-[#fe9832] text-indigo-600 dark:text-[#fe9832]'
                : 'border-transparent text-gray-500 dark:text-[#828796] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">format_size</span>
            <span>{t('a11y.tab.content', 'Content Adjustment')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orientation')}
            className={`pb-3 px-3 text-xs sm:text-sm font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'orientation'
                ? 'border-indigo-600 dark:border-[#fe9832] text-indigo-600 dark:text-[#fe9832]'
                : 'border-transparent text-gray-500 dark:text-[#828796] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">explore</span>
            <span>{t('a11y.tab.orientation', 'Orientation Adjustment')}</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 max-h-[60vh]">
          {/* ========================================================================= */}
          {/* TAB 0: LANGUAGE SELECTION (ENGLISH, HINDI, ODIA)                          */}
          {/* ========================================================================= */}
          {activeTab === 'language' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Header Description Card */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-[#0d121d] border border-indigo-100 dark:border-[#243044] flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-[#fe9832] text-white dark:text-[#542900] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">language</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {t('a11y.lang.title', 'Select Display Language')}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
                    {t('a11y.lang.desc', 'Choose your preferred language. All text, buttons, and accessibility guides across the entire website will update instantly.')}
                  </p>
                </div>
              </div>

              {/* 3 Supported Language Cards (English, Hindi, Odia) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* 1. English */}
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`relative p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group ${
                    language === 'en'
                      ? 'border-[#fe9832] bg-[#fe9832]/10 dark:bg-[#fe9832]/15 shadow-md ring-2 ring-[#fe9832]/40'
                      : 'border-slate-200 dark:border-[#243044] bg-white dark:bg-[#1a202c] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">🇬🇧</span>
                      <div>
                        <h4 className="text-base font-black text-gray-900 dark:text-white font-headline">English</h4>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Latin Script</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      language === 'en' ? 'bg-[#fe9832] text-[#542900] shadow-xs' : 'bg-slate-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                    }`}>
                      {language === 'en' ? t('a11y.active', 'ACTIVE') : 'SELECT'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c121e] border border-slate-100 dark:border-white/5">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed italic">
                      "Transforming Indian Sign Language into meaningful connection."
                    </p>
                  </div>
                </button>

                {/* 2. Hindi (हिन्दी) */}
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`relative p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group ${
                    language === 'hi'
                      ? 'border-[#fe9832] bg-[#fe9832]/10 dark:bg-[#fe9832]/15 shadow-md ring-2 ring-[#fe9832]/40'
                      : 'border-slate-200 dark:border-[#243044] bg-white dark:bg-[#1a202c] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">🇮🇳</span>
                      <div>
                        <h4 className="text-base font-black text-gray-900 dark:text-white font-headline">हिन्दी</h4>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Devanagari (Hindi)</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      language === 'hi' ? 'bg-[#fe9832] text-[#542900] shadow-xs' : 'bg-slate-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                    }`}>
                      {language === 'hi' ? t('a11y.active', 'ACTIVE') : 'SELECT'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c121e] border border-slate-100 dark:border-white/5">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed italic">
                      "भारतीय सांकेतिक भाषा को सार्थक मानवीय जुड़ाव में बदल रहे हैं।"
                    </p>
                  </div>
                </button>

                {/* 3. Odia (ଓଡ଼ିଆ) */}
                <button
                  type="button"
                  onClick={() => setLanguage('or')}
                  className={`relative p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group ${
                    language === 'or'
                      ? 'border-[#fe9832] bg-[#fe9832]/10 dark:bg-[#fe9832]/15 shadow-md ring-2 ring-[#fe9832]/40'
                      : 'border-slate-200 dark:border-[#243044] bg-white dark:bg-[#1a202c] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">🇮🇳</span>
                      <div>
                        <h4 className="text-base font-black text-gray-900 dark:text-white font-headline">ଓଡ଼ିଆ</h4>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Odia Script (Odia)</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      language === 'or' ? 'bg-[#fe9832] text-[#542900] shadow-xs' : 'bg-slate-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                    }`}>
                      {language === 'or' ? t('a11y.active', 'ACTIVE') : 'SELECT'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c121e] border border-slate-100 dark:border-white/5">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed italic">
                      "ଭାରତୀୟ ସାଙ୍କେତିକ ଭାଷାକୁ ଅର୍ଥପୂର୍ଣ୍ଣ ମାନବୀୟ ସଂଯୋଗରେ ରୂପାନ୍ତରିତ କରୁଛି।"
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: COLOR ADJUSTMENT                                                   */}
          {/* ========================================================================= */}
          {activeTab === 'color' && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 animate-fadeIn">
              {/* 1. Monochrome */}
              <div
                onClick={() => setColorFilter(settings.colorFilter === 'monochrome' ? 'none' : 'monochrome')}
                className={`relative overflow-hidden p-4 min-h-[145px] sm:min-h-[155px] rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center gap-2 group ${
                  settings.colorFilter === 'monochrome'
                    ? 'border-[#fe9832] bg-[#fe9832]/15 shadow-md ring-2 ring-[#fe9832]/30'
                    : 'border-slate-200 dark:border-[#243044] bg-white dark:bg-[#1a202c] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 hover:shadow-md'
                }`}
              >
                {/* Default Visual Content */}
                <div className="flex flex-col items-center justify-center gap-2 w-full transition-opacity duration-200 group-hover:opacity-0">
                  <div className={`w-13 h-13 rounded-2xl flex items-center justify-center ${
                    settings.colorFilter === 'monochrome' ? 'bg-[#fe9832] text-[#542900] shadow-sm' : 'bg-slate-100 dark:bg-[#0c121e] text-gray-700 dark:text-[#c1c6d7]'
                  }`}>
                    <span className="material-symbols-outlined text-[28px]">filter_b_and_w</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-full">Monochrome</h4>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    settings.colorFilter === 'monochrome' ? 'bg-[#fe9832] text-[#542900]' : 'bg-slate-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                  }`}>
                    {settings.colorFilter === 'monochrome' ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>

                {/* Inside-the-Box Hover Description Overlay */}
                <div className="absolute inset-0 rounded-2xl p-3 bg-[#030813]/95 text-white flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 backdrop-blur-xs border-2 border-[#fe9832]">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#fe9832] mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">filter_b_and_w</span> Monochrome
                  </span>
                  <p className="text-[11px] leading-snug font-medium text-slate-100">
                    Converts interface colors into grayscale for visual comfort.
                  </p>
                </div>
              </div>

              {/* 2. High Saturate */}
              <div
                onClick={() => setColorFilter(settings.colorFilter === 'high-saturate' ? 'none' : 'high-saturate')}
                className={`relative overflow-hidden p-4 min-h-[145px] sm:min-h-[155px] rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center gap-2 group ${
                  settings.colorFilter === 'high-saturate'
                    ? 'border-[#fe9832] bg-[#fe9832]/15 shadow-md ring-2 ring-[#fe9832]/30'
                    : 'border-slate-200 dark:border-[#243044] bg-white dark:bg-[#1a202c] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 hover:shadow-md'
                }`}
              >
                {/* Default Visual Content */}
                <div className="flex flex-col items-center justify-center gap-2 w-full transition-opacity duration-200 group-hover:opacity-0">
                  <div className={`w-13 h-13 rounded-2xl flex items-center justify-center ${
                    settings.colorFilter === 'high-saturate' ? 'bg-[#fe9832] text-[#542900] shadow-sm' : 'bg-slate-100 dark:bg-[#0c121e] text-gray-700 dark:text-[#c1c6d7]'
                  }`}>
                    <span className="material-symbols-outlined text-[28px]">contrast</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-full">High Saturate</h4>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    settings.colorFilter === 'high-saturate' ? 'bg-[#fe9832] text-[#542900]' : 'bg-slate-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                  }`}>
                    {settings.colorFilter === 'high-saturate' ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>

                {/* Inside-the-Box Hover Description Overlay */}
                <div className="absolute inset-0 rounded-2xl p-3 bg-[#030813]/95 text-white flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 backdrop-blur-xs border-2 border-[#fe9832]">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#fe9832] mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">contrast</span> High Saturate
                  </span>
                  <p className="text-[11px] leading-snug font-medium text-slate-100">
                    Increases color intensity and contrast for visual comfort.
                  </p>
                </div>
              </div>

              {/* 3. Low Saturate */}
              <div
                onClick={() => setColorFilter(settings.colorFilter === 'low-saturate' ? 'none' : 'low-saturate')}
                className={`relative overflow-hidden p-4 min-h-[145px] sm:min-h-[155px] rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center gap-2 group ${
                  settings.colorFilter === 'low-saturate'
                    ? 'border-[#fe9832] bg-[#fe9832]/15 shadow-md ring-2 ring-[#fe9832]/30'
                    : 'border-slate-200 dark:border-[#243044] bg-white dark:bg-[#1a202c] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 hover:shadow-md'
                }`}
              >
                {/* Default Visual Content */}
                <div className="flex flex-col items-center justify-center gap-2 w-full transition-opacity duration-200 group-hover:opacity-0">
                  <div className={`w-13 h-13 rounded-2xl flex items-center justify-center ${
                    settings.colorFilter === 'low-saturate' ? 'bg-[#fe9832] text-[#542900] shadow-sm' : 'bg-slate-100 dark:bg-[#0c121e] text-gray-700 dark:text-[#c1c6d7]'
                  }`}>
                    <span className="material-symbols-outlined text-[28px]">tonality</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-full">Low Saturate</h4>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    settings.colorFilter === 'low-saturate' ? 'bg-[#fe9832] text-[#542900]' : 'bg-slate-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                  }`}>
                    {settings.colorFilter === 'low-saturate' ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>

                {/* Inside-the-Box Hover Description Overlay */}
                <div className="absolute inset-0 rounded-2xl p-3 bg-[#030813]/95 text-white flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 backdrop-blur-xs border-2 border-[#fe9832]">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#fe9832] mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">tonality</span> Low Saturate
                  </span>
                  <p className="text-[11px] leading-snug font-medium text-slate-100">
                    Decreases color intensity and contrast for visual comfort.
                  </p>
                </div>
              </div>

              {/* 4. Invert Color */}
              <div
                onClick={() => setColorFilter(settings.colorFilter === 'invert' ? 'none' : 'invert')}
                className={`relative overflow-hidden p-4 min-h-[145px] sm:min-h-[155px] rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center gap-2 group ${
                  settings.colorFilter === 'invert'
                    ? 'border-[#fe9832] bg-[#fe9832]/15 shadow-md ring-2 ring-[#fe9832]/30'
                    : 'border-slate-200 dark:border-[#243044] bg-white dark:bg-[#1a202c] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 hover:shadow-md'
                }`}
              >
                {/* Default Visual Content */}
                <div className="flex flex-col items-center justify-center gap-2 w-full transition-opacity duration-200 group-hover:opacity-0">
                  <div className={`w-13 h-13 rounded-2xl flex items-center justify-center ${
                    settings.colorFilter === 'invert' ? 'bg-[#fe9832] text-[#542900] shadow-sm' : 'bg-slate-100 dark:bg-[#0c121e] text-gray-700 dark:text-[#c1c6d7]'
                  }`}>
                    <span className="material-symbols-outlined text-[28px]">invert_colors</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-full">Invert Color</h4>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    settings.colorFilter === 'invert' ? 'bg-[#fe9832] text-[#542900]' : 'bg-slate-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                  }`}>
                    {settings.colorFilter === 'invert' ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>

                {/* Inside-the-Box Hover Description Overlay */}
                <div className="absolute inset-0 rounded-2xl p-3 bg-[#030813]/95 text-white flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 backdrop-blur-xs border-2 border-[#fe9832]">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#fe9832] mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">invert_colors</span> Invert Color
                  </span>
                  <p className="text-[11px] leading-snug font-medium text-slate-100">
                    Reverse on screen color for higher visual contrast.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: CONTENT ADJUSTMENT                                                 */}
          {/* ========================================================================= */}
          {activeTab === 'content' && (
            <div className="space-y-4 animate-fadeIn">
              {/* 1. Bigger Text Stepper Card */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-[#243044] bg-white dark:bg-[#1a202c] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-[#0c121e] text-indigo-600 dark:text-[#fe9832] flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[26px]">text_fields</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Bigger Text Scale</h4>
                    <span className="text-xs text-gray-500 dark:text-[#828796]">Adjust font size magnification</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={decreaseTextScale}
                    disabled={settings.textScale === 0}
                    className="w-10 h-10 rounded-xl border border-slate-200 dark:border-[#2d3a50] bg-slate-100 dark:bg-[#151c28] text-gray-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-[#243044] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-all shadow-xs"
                    title="Decrease font size"
                  >
                    A-
                  </button>
                  <span className="px-3.5 py-1.5 bg-indigo-50 dark:bg-[#fe9832]/10 border border-indigo-200 dark:border-[#fe9832]/30 text-indigo-700 dark:text-[#fe9832] rounded-xl text-xs font-black min-w-[70px] text-center">
                    {settings.textScale === 0 ? '100%' : settings.textScale === 1 ? '115%' : settings.textScale === 2 ? '130%' : '145%'}
                  </span>
                  <button
                    type="button"
                    onClick={increaseTextScale}
                    disabled={settings.textScale === 3}
                    className="w-10 h-10 rounded-xl border border-slate-200 dark:border-[#2d3a50] bg-slate-100 dark:bg-[#151c28] text-gray-900 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-[#243044] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-all shadow-xs"
                    title="Increase font size"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* Grid of Content Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* 2. Line Height */}
                <div
                  onClick={toggleLineHeight}
                  className={`relative overflow-hidden p-3.5 min-h-[145px] sm:min-h-[155px] rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center gap-2 group ${
                    settings.lineHeight
                      ? 'border-[#fe9832] bg-[#fe9832]/15 shadow-md ring-2 ring-[#fe9832]/30'
                      : 'border-slate-200 dark:border-[#243044] bg-white dark:bg-[#1a202c] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-2 w-full transition-opacity duration-200 group-hover:opacity-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      settings.lineHeight ? 'bg-[#fe9832] text-[#542900] shadow-sm' : 'bg-slate-100 dark:bg-[#0c121e] text-gray-700 dark:text-[#c1c6d7]'
                    }`}>
                      <span className="material-symbols-outlined text-[24px]">format_line_spacing</span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-full">Line Height</h4>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      settings.lineHeight ? 'bg-[#fe9832] text-[#542900]' : 'bg-slate-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                    }`}>
                      {settings.lineHeight ? 'ON' : 'OFF'}
                    </span>
                  </div>

                  {/* Inside-the-Box Hover Description Overlay */}
                  <div className="absolute inset-0 rounded-2xl p-2.5 bg-[#030813]/95 text-white flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 backdrop-blur-xs border-2 border-[#fe9832]">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#fe9832] mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">format_line_spacing</span> Line Height
                    </span>
                    <p className="text-[10px] leading-snug font-medium text-slate-100">
                      Increase the line height of text for easier reading.
                    </p>
                  </div>
                </div>

                {/* 3. Text Spacing */}
                <div
                  onClick={toggleTextSpacing}
                  className={`relative overflow-hidden p-3.5 min-h-[145px] sm:min-h-[155px] rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center gap-2 group ${
                    settings.textSpacing
                      ? 'border-[#fe9832] bg-[#fe9832]/15 shadow-md ring-2 ring-[#fe9832]/30'
                      : 'border-slate-200 dark:border-[#243044] bg-white dark:bg-[#1a202c] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-2 w-full transition-opacity duration-200 group-hover:opacity-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      settings.textSpacing ? 'bg-[#fe9832] text-[#542900] shadow-sm' : 'bg-slate-100 dark:bg-[#0c121e] text-gray-700 dark:text-[#c1c6d7]'
                    }`}>
                      <span className="material-symbols-outlined text-[24px]">space_bar</span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-full">Text Spacing</h4>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      settings.textSpacing ? 'bg-[#fe9832] text-[#542900]' : 'bg-slate-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                    }`}>
                      {settings.textSpacing ? 'ON' : 'OFF'}
                    </span>
                  </div>

                  {/* Inside-the-Box Hover Description Overlay */}
                  <div className="absolute inset-0 rounded-2xl p-2.5 bg-[#030813]/95 text-white flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 backdrop-blur-xs border-2 border-[#fe9832]">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#fe9832] mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">space_bar</span> Text Spacing
                    </span>
                    <p className="text-[10px] leading-snug font-medium text-slate-100">
                      Increase the text space for easier reading.
                    </p>
                  </div>
                </div>

                {/* 4. Highlight Links */}
                <div
                  onClick={toggleHighlightLinks}
                  className={`relative overflow-hidden p-3.5 min-h-[145px] sm:min-h-[155px] rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center gap-2 group ${
                    settings.highlightLinks
                      ? 'border-[#fe9832] bg-[#fe9832]/15 shadow-md ring-2 ring-[#fe9832]/30'
                      : 'border-slate-200 dark:border-[#243044] bg-white dark:bg-[#1a202c] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-2 w-full transition-opacity duration-200 group-hover:opacity-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      settings.highlightLinks ? 'bg-[#fe9832] text-[#542900] shadow-sm' : 'bg-slate-100 dark:bg-[#0c121e] text-gray-700 dark:text-[#c1c6d7]'
                    }`}>
                      <span className="material-symbols-outlined text-[24px]">link</span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-full">Highlight Links</h4>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      settings.highlightLinks ? 'bg-[#fe9832] text-[#542900]' : 'bg-slate-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                    }`}>
                      {settings.highlightLinks ? 'ON' : 'OFF'}
                    </span>
                  </div>

                  {/* Inside-the-Box Hover Description Overlay */}
                  <div className="absolute inset-0 rounded-2xl p-2.5 bg-[#030813]/95 text-white flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 backdrop-blur-xs border-2 border-[#fe9832]">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#fe9832] mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">link</span> Highlight Links
                    </span>
                    <p className="text-[10px] leading-snug font-medium text-slate-100">
                      Highlight the links that redirect across the website in yellow color.
                    </p>
                  </div>
                </div>

                {/* 5. Dyslexia Friendly */}
                <div
                  onClick={toggleDyslexiaFriendly}
                  className={`relative overflow-hidden p-3.5 min-h-[145px] sm:min-h-[155px] rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center gap-2 group ${
                    settings.dyslexiaFriendly
                      ? 'border-[#fe9832] bg-[#fe9832]/15 shadow-md ring-2 ring-[#fe9832]/30'
                      : 'border-slate-200 dark:border-[#243044] bg-white dark:bg-[#1a202c] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-2 w-full transition-opacity duration-200 group-hover:opacity-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      settings.dyslexiaFriendly ? 'bg-[#fe9832] text-[#542900] shadow-sm' : 'bg-slate-100 dark:bg-[#0c121e] text-gray-700 dark:text-[#c1c6d7]'
                    }`}>
                      <span className="material-symbols-outlined text-[24px]">spellcheck</span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-full">Dyslexia Friendly</h4>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      settings.dyslexiaFriendly ? 'bg-[#fe9832] text-[#542900]' : 'bg-slate-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                    }`}>
                      {settings.dyslexiaFriendly ? 'ON' : 'OFF'}
                    </span>
                  </div>

                  {/* Inside-the-Box Hover Description Overlay */}
                  <div className="absolute inset-0 rounded-2xl p-2.5 bg-[#030813]/95 text-white flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 backdrop-blur-xs border-2 border-[#fe9832]">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#fe9832] mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">spellcheck</span> Dyslexia Friendly
                    </span>
                    <p className="text-[10px] leading-snug font-medium text-slate-100">
                      Uses readable fonts and spacing for dyslexia users.
                    </p>
                  </div>
                </div>

                {/* 6. Text Magnifier */}
                <div
                  onClick={toggleTextMagnifier}
                  className={`relative overflow-hidden p-3.5 min-h-[145px] sm:min-h-[155px] rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center gap-2 group ${
                    settings.textMagnifier
                      ? 'border-[#fe9832] bg-[#fe9832]/15 shadow-md ring-2 ring-[#fe9832]/30'
                      : 'border-slate-200 dark:border-[#243044] bg-white dark:bg-[#1a202c] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-2 w-full transition-opacity duration-200 group-hover:opacity-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      settings.textMagnifier ? 'bg-[#fe9832] text-[#542900] shadow-sm' : 'bg-slate-100 dark:bg-[#0c121e] text-gray-700 dark:text-[#c1c6d7]'
                    }`}>
                      <span className="material-symbols-outlined text-[24px]">zoom_in</span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-full">Text Magnify</h4>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      settings.textMagnifier ? 'bg-[#fe9832] text-[#542900]' : 'bg-slate-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                    }`}>
                      {settings.textMagnifier ? 'ON' : 'OFF'}
                    </span>
                  </div>

                  {/* Inside-the-Box Hover Description Overlay */}
                  <div className="absolute inset-0 rounded-2xl p-2.5 bg-[#030813]/95 text-white flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 backdrop-blur-xs border-2 border-[#fe9832]">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#fe9832] mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">zoom_in</span> Text Magnify
                    </span>
                    <p className="text-[10px] leading-snug font-medium text-slate-100">
                      Displays enlarged text on hover for improved readability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: ORIENTATION ADJUSTMENT                                             */}
          {/* ========================================================================= */}
          {activeTab === 'orientation' && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-fadeIn">
              {/* 1. Screen Reader */}
              <div
                onClick={toggleScreenReader}
                className={`relative overflow-hidden p-4 min-h-[145px] sm:min-h-[155px] rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center gap-2 group ${
                  settings.screenReader
                    ? 'border-[#fe9832] bg-[#fe9832]/15 shadow-md ring-2 ring-[#fe9832]/30'
                    : 'border-slate-200 dark:border-[#243044] bg-white dark:bg-[#1a202c] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2 w-full transition-opacity duration-200 group-hover:opacity-0">
                  <div className={`w-13 h-13 rounded-2xl flex items-center justify-center ${
                    settings.screenReader ? 'bg-[#fe9832] text-[#542900] shadow-sm' : 'bg-slate-100 dark:bg-[#0c121e] text-gray-700 dark:text-[#c1c6d7]'
                  }`}>
                    <span className="material-symbols-outlined text-[28px]">volume_up</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-full">Screen Reader</h4>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    settings.screenReader ? 'bg-[#fe9832] text-[#542900]' : 'bg-slate-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                  }`}>
                    {settings.screenReader ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>

                {/* Inside-the-Box Hover Description Overlay */}
                <div className="absolute inset-0 rounded-2xl p-3 bg-[#030813]/95 text-white flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 backdrop-blur-xs border-2 border-[#fe9832]">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#fe9832] mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">volume_up</span> Screen Reader
                  </span>
                  <p className="text-[11px] leading-snug font-medium text-slate-100">
                    Reads aloud the content for accessibility support.
                  </p>
                </div>
              </div>

              {/* 2. Voice Support */}
              <div
                onClick={toggleVoiceSupport}
                className={`relative overflow-hidden p-4 min-h-[145px] sm:min-h-[155px] rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center gap-2 group ${
                  settings.voiceSupport
                    ? 'border-[#fe9832] bg-[#fe9832]/15 shadow-md ring-2 ring-[#fe9832]/30'
                    : 'border-slate-200 dark:border-[#243044] bg-white dark:bg-[#1a202c] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2 w-full transition-opacity duration-200 group-hover:opacity-0">
                  <div className={`w-13 h-13 rounded-2xl flex items-center justify-center ${
                    settings.voiceSupport ? 'bg-[#fe9832] text-[#542900] shadow-sm' : 'bg-slate-100 dark:bg-[#0c121e] text-gray-700 dark:text-[#c1c6d7]'
                  }`}>
                    <span className="material-symbols-outlined text-[28px]">mic</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-full">Voice Support</h4>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    settings.voiceSupport ? 'bg-[#fe9832] text-[#542900]' : 'bg-slate-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                  }`}>
                    {settings.voiceSupport ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>

                {/* Inside-the-Box Hover Description Overlay */}
                <div className="absolute inset-0 rounded-2xl p-3 bg-[#030813]/95 text-white flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 backdrop-blur-xs border-2 border-[#fe9832]">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#fe9832] mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">mic</span> Voice Support
                  </span>
                  <p className="text-[11px] leading-snug font-medium text-slate-100">
                    Enable simple voice based website navigation controls.
                  </p>
                </div>
              </div>

              {/* 3. Hide Images */}
              <div
                onClick={toggleHideImages}
                className={`relative overflow-hidden p-4 min-h-[145px] sm:min-h-[155px] rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center gap-2 group ${
                  settings.hideImages
                    ? 'border-[#fe9832] bg-[#fe9832]/15 shadow-md ring-2 ring-[#fe9832]/30'
                    : 'border-slate-200 dark:border-[#243044] bg-white dark:bg-[#1a202c] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2 w-full transition-opacity duration-200 group-hover:opacity-0">
                  <div className={`w-13 h-13 rounded-2xl flex items-center justify-center ${
                    settings.hideImages ? 'bg-[#fe9832] text-[#542900] shadow-sm' : 'bg-slate-100 dark:bg-[#0c121e] text-gray-700 dark:text-[#c1c6d7]'
                  }`}>
                    <span className="material-symbols-outlined text-[28px]">hide_image</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-full">Hide Images</h4>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    settings.hideImages ? 'bg-[#fe9832] text-[#542900]' : 'bg-slate-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                  }`}>
                    {settings.hideImages ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>

                {/* Inside-the-Box Hover Description Overlay */}
                <div className="absolute inset-0 rounded-2xl p-3 bg-[#030813]/95 text-white flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 backdrop-blur-xs border-2 border-[#fe9832]">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#fe9832] mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">hide_image</span> Hide Images
                  </span>
                  <p className="text-[11px] leading-snug font-medium text-slate-100">
                    Remove distracting visuals for focused content reading.
                  </p>
                </div>
              </div>

              {/* 4. Reading Guideline */}
              <div
                onClick={toggleReadingGuideline}
                className={`relative overflow-hidden p-4 min-h-[145px] sm:min-h-[155px] rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center gap-2 group ${
                  settings.readingGuideline
                    ? 'border-[#fe9832] bg-[#fe9832]/15 shadow-md ring-2 ring-[#fe9832]/30'
                    : 'border-slate-200 dark:border-[#243044] bg-white dark:bg-[#1a202c] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2 w-full transition-opacity duration-200 group-hover:opacity-0">
                  <div className={`w-13 h-13 rounded-2xl flex items-center justify-center ${
                    settings.readingGuideline ? 'bg-[#fe9832] text-[#542900] shadow-sm' : 'bg-slate-100 dark:bg-[#0c121e] text-gray-700 dark:text-[#c1c6d7]'
                  }`}>
                    <span className="material-symbols-outlined text-[28px]">horizontal_rule</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-full">Reading Guideline</h4>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    settings.readingGuideline ? 'bg-[#fe9832] text-[#542900]' : 'bg-slate-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                  }`}>
                    {settings.readingGuideline ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>

                {/* Inside-the-Box Hover Description Overlay */}
                <div className="absolute inset-0 rounded-2xl p-3 bg-[#030813]/95 text-white flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 backdrop-blur-xs border-2 border-[#fe9832]">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#fe9832] mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">horizontal_rule</span> Reading Guideline
                  </span>
                  <p className="text-[11px] leading-snug font-medium text-slate-100">
                    Guiding lines that help you follow texts easily.
                  </p>
                </div>
              </div>

              {/* 5. Focus Mode */}
              <div
                onClick={toggleFocusMode}
                className={`relative overflow-hidden p-4 min-h-[145px] sm:min-h-[155px] rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center gap-2 group ${
                  settings.focusMode
                    ? 'border-[#fe9832] bg-[#fe9832]/15 shadow-md ring-2 ring-[#fe9832]/30'
                    : 'border-slate-200 dark:border-[#243044] bg-white dark:bg-[#1a202c] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2 w-full transition-opacity duration-200 group-hover:opacity-0">
                  <div className={`w-13 h-13 rounded-2xl flex items-center justify-center ${
                    settings.focusMode ? 'bg-[#fe9832] text-[#542900] shadow-sm' : 'bg-slate-100 dark:bg-[#0c121e] text-gray-700 dark:text-[#c1c6d7]'
                  }`}>
                    <span className="material-symbols-outlined text-[28px]">center_focus_strong</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-full">Focus Mode</h4>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    settings.focusMode ? 'bg-[#fe9832] text-[#542900]' : 'bg-slate-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                  }`}>
                    {settings.focusMode ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>

                {/* Inside-the-Box Hover Description Overlay */}
                <div className="absolute inset-0 rounded-2xl p-3 bg-[#030813]/95 text-white flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 backdrop-blur-xs border-2 border-[#fe9832]">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#fe9832] mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">center_focus_strong</span> Focus Mode
                  </span>
                  <p className="text-[11px] leading-snug font-medium text-slate-100">
                    Light up the selected section on page while hovering.
                  </p>
                </div>
              </div>

              {/* 6. Large Cursor */}
              <div
                onClick={toggleBigCursor}
                className={`relative overflow-hidden p-4 min-h-[145px] sm:min-h-[155px] rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center gap-2 group ${
                  settings.bigCursor
                    ? 'border-[#fe9832] bg-[#fe9832]/15 shadow-md ring-2 ring-[#fe9832]/30'
                    : 'border-slate-200 dark:border-[#243044] bg-white dark:bg-[#1a202c] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2 w-full transition-opacity duration-200 group-hover:opacity-0">
                  <div className={`w-13 h-13 rounded-2xl flex items-center justify-center ${
                    settings.bigCursor ? 'bg-[#fe9832] text-[#542900] shadow-sm' : 'bg-slate-100 dark:bg-[#0c121e] text-gray-700 dark:text-[#c1c6d7]'
                  }`}>
                    <span className="material-symbols-outlined text-[28px]">ads_click</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate max-w-full">Cursor Size</h4>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    settings.bigCursor ? 'bg-[#fe9832] text-[#542900]' : 'bg-slate-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'
                  }`}>
                    {settings.bigCursor ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>

                {/* Inside-the-Box Hover Description Overlay */}
                <div className="absolute inset-0 rounded-2xl p-3 bg-[#030813]/95 text-white flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 backdrop-blur-xs border-2 border-[#fe9832]">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#fe9832] mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">ads_click</span> Cursor Size
                  </span>
                  <p className="text-[11px] leading-snug font-medium text-slate-100">
                    Enlarge the cursor size for better visibility and tracking.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-[#243044] bg-slate-50/70 dark:bg-[#0d121d] flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={closeModal}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 dark:bg-none dark:bg-[#fe9832] dark:hover:bg-[#e8872b] text-white dark:text-[#542900] rounded-xl text-xs font-black transition-all shadow-md shadow-indigo-500/20 dark:shadow-none hover:opacity-95 cursor-pointer active:scale-95"
          >
            {language === 'hi' ? 'लागू करें और बंद करें' : language === 'or' ? 'ପ୍ରୟୋଗ କରନ୍ତୁ ଏବଂ ବନ୍ଦ କରନ୍ତୁ' : 'Apply & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
