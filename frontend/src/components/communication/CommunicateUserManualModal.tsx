import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useAccessibility';

interface CommunicateUserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleAutoShow?: (show: boolean) => void;
}

export const COMMUNICATE_GUIDE_STORAGE_KEY = 'sambhav_show_communicate_guide';

export const isCommunicateGuideEnabled = (): boolean => {
  const saved = localStorage.getItem(COMMUNICATE_GUIDE_STORAGE_KEY);
  // Default to true if not set
  return saved === null ? true : saved !== 'false';
};

export const setCommunicateGuideEnabled = (enabled: boolean): void => {
  localStorage.setItem(COMMUNICATE_GUIDE_STORAGE_KEY, enabled ? 'true' : 'false');
};

export interface CommunicateUserManualCardProps {
  onDismiss: () => void;
  onToggleAutoShow?: (show: boolean) => void;
}

export const CommunicateUserManualCard: React.FC<CommunicateUserManualCardProps> = ({
  onDismiss,
  onToggleAutoShow,
}) => {
  const { t } = useTranslation();
  const [autoShow, setAutoShow] = useState<boolean>(isCommunicateGuideEnabled());

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const shouldShow = !e.target.checked;
    setAutoShow(shouldShow);
    setCommunicateGuideEnabled(shouldShow);
    if (onToggleAutoShow) {
      onToggleAutoShow(shouldShow);
    }
  };

  const visualSteps = [
    {
      step: '01',
      title: t('manual.step1.title', 'Framing & Distance'),
      badge: t('manual.step1.badge', '0.5m – 1.5m'),
      icon: 'straighten',
      image: '/assets/manual_camera_framing.jpg',
      fallback: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=600&q=80',
      // Mint / Sage Green (like UX/UI Design)
      cardBg: 'bg-[#d2ece5] dark:bg-[#122822]',
      cardHover: 'hover:bg-[#bfe2d8] dark:hover:bg-[#17332b] hover:border-[#9ed3c6] dark:hover:border-[#244c41]',
      border: 'border-[#c1e6dc] dark:border-[#1d3d34]',
      titleColor: 'text-[#193a32] dark:text-[#c4eee4]',
      badgeBg: 'bg-[#193a32] text-[#d2ece5] dark:bg-[#204a40] dark:text-[#c4eee4]',
      arrowBg: 'bg-white text-[#193a32] dark:bg-[#1f3f37] dark:text-[#c4eee4]',
      tipsColor: 'text-[#2a5449] dark:text-[#a8ded0]',
      checkColor: 'text-[#193a32] dark:text-[#4edebe]',
      tips: [
        t('manual.step1.tip1', 'Sit 2–4 ft away (arm’s length)'),
        t('manual.step1.tip2', 'Keep head, chest & hands in view')
      ],
    },
    {
      step: '02',
      title: t('manual.step2.title', 'Front-Facing Lighting'),
      badge: t('manual.step2.badge', 'Direct Light'),
      icon: 'wb_sunny',
      image: '/assets/manual_lighting_setup.jpg',
      fallback: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      // Butter Warm Yellow (like Interface Motion / Score)
      cardBg: 'bg-[#fee5b6] dark:bg-[#2b2010]',
      cardHover: 'hover:bg-[#fcd795] dark:hover:bg-[#382b16] hover:border-[#fbc674] dark:hover:border-[#4d3b1f]',
      border: 'border-[#fddc9b] dark:border-[#3e2e17]',
      titleColor: 'text-[#483309] dark:text-[#feebb7]',
      badgeBg: 'bg-[#483309] text-[#fee5b6] dark:bg-[#483618] dark:text-[#fee09c]',
      arrowBg: 'bg-white text-[#483309] dark:bg-[#433215] dark:text-[#fee09c]',
      tipsColor: 'text-[#5d4411] dark:text-[#e4cb93]',
      checkColor: 'text-[#483309] dark:text-[#f8b84e]',
      tips: [
        t('manual.step2.tip1', 'Direct front light on hands & face'),
        t('manual.step2.tip2', 'Avoid dark shadows or backlighting')
      ],
    },
    {
      step: '03',
      title: t('manual.step3.title', 'Chest-Level Signing'),
      badge: t('manual.step3.badge', '171 ISL Signs'),
      icon: 'sign_language',
      image: '/assets/manual_sign_gesture.jpg',
      fallback: '/assets/isl_gesture_hello.jpg',
      // Soft Rose / Pink (like Analytics Tools)
      cardBg: 'bg-[#fed8e7] dark:bg-[#2b131f]',
      cardHover: 'hover:bg-[#fbc3da] dark:hover:bg-[#391a2a] hover:border-[#f9a6c9] dark:hover:border-[#52253c]',
      border: 'border-[#fbccdf] dark:border-[#401c2f]',
      titleColor: 'text-[#4e132e] dark:text-[#fed4e5]',
      badgeBg: 'bg-[#4e132e] text-[#fed8e7] dark:bg-[#4c1e33] dark:text-[#fec7dc]',
      arrowBg: 'bg-white text-[#4e132e] dark:bg-[#471c30] dark:text-[#fec7dc]',
      tipsColor: 'text-[#672242] dark:text-[#e5b1c7]',
      checkColor: 'text-[#4e132e] dark:text-[#f36f9f]',
      tips: [
        t('manual.step3.tip1', 'Sign clearly in chest-level zone'),
        t('manual.step3.tip2', 'Hold distinct hand shapes & palms')
      ],
    },
    {
      step: '04',
      title: t('manual.step4.title', 'Two-Way Live Sync'),
      badge: t('manual.step4.badge', 'Speech ↔ Sign'),
      icon: 'record_voice_over',
      image: '/assets/manual_twoway_sync.jpg',
      fallback: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=600&q=80',
      // Soft Lavender / Lilac (like Active 11)
      cardBg: 'bg-[#e4dbf7] dark:bg-[#1d162f]',
      cardHover: 'hover:bg-[#d5c7f2] dark:hover:bg-[#271d3e] hover:border-[#bcabeb] dark:hover:border-[#3c2d60]',
      border: 'border-[#dacdf3] dark:border-[#30244d]',
      titleColor: 'text-[#301b50] dark:text-[#e5dcf8]',
      badgeBg: 'bg-[#301b50] text-[#e4dbf7] dark:bg-[#362657] dark:text-[#ded2f8]',
      arrowBg: 'bg-white text-[#301b50] dark:bg-[#332252] dark:text-[#ded2f8]',
      tipsColor: 'text-[#482e70] dark:text-[#c4b5e7]',
      checkColor: 'text-[#301b50] dark:text-[#ab91ed]',
      tips: [
        t('manual.step4.tip1', 'Spoken words animate in 3D Avatar'),
        t('manual.step4.tip2', 'Live camera signs translate to Audio/CC')
      ],
    },
  ];

  return (
    <div
      className="relative w-full max-w-5xl bg-[#f6f8fa] dark:bg-[#0d1424] border border-slate-200/90 dark:border-[#1e293b] rounded-[32px] shadow-2xl p-5 sm:p-8 flex flex-col gap-6 text-gray-900 dark:text-white cursor-default max-h-[92vh] overflow-y-auto custom-scrollbar"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button Top Right */}
      <button
        type="button"
        onClick={onDismiss}
        className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white hover:bg-[#111625] dark:bg-[#192438] dark:hover:bg-white text-gray-700 hover:text-white dark:text-gray-300 dark:hover:text-[#111625] shadow-xs flex items-center justify-center transition-all duration-200 hover:rotate-90 cursor-pointer z-10"
        aria-label="Close user manual"
        title="Close (Esc)"
      >
        <span className="material-symbols-outlined text-[20px]">close</span>
      </button>

      {/* Modal Header */}
      <div className="flex items-center gap-3.5 pr-10">
        <div className="w-12 h-12 rounded-2xl bg-[#111625] dark:bg-[#fe9832] text-white dark:text-[#422006] flex items-center justify-center shrink-0 shadow-md shadow-slate-900/10 dark:shadow-none">
          <span className="material-symbols-outlined text-[26px]">menu_book</span>
        </div>
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 id="user-manual-title" className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white font-headline">
              {t('manual.title', 'Quick Visual Setup Guide')}
            </h2>
            <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-2xs border border-slate-200/80 dark:border-transparent">
              {t('manual.stepsCount', '4 Key Steps')}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-[#94a3b8] mt-0.5 font-medium">
            {t('manual.desc', 'Follow these simple visual guidelines for the highest ISL recognition accuracy.')}
          </p>
        </div>
      </div>

      {/* Visual 4-Card Step Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visualSteps.map((s) => (
          <div
            key={s.step}
            className={`group rounded-[26px] ${s.cardBg} ${s.border} border p-4 flex flex-col justify-between gap-3.5 transition-all duration-300 ease-out cursor-pointer hover:-translate-y-1.5 hover:shadow-xl ${s.cardHover}`}
          >
            {/* Top Row: Step Tag + Hover Action Arrow */}
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider shadow-2xs ${s.badgeBg}`}>
                STEP {s.step}
              </span>

              <div className={`w-7 h-7 rounded-full ${s.arrowBg} shadow-xs flex items-center justify-center transition-all duration-300 group-hover:scale-115 group-hover:rotate-45`}>
                <span className="material-symbols-outlined text-[15px] font-bold">north_east</span>
              </div>
            </div>

            {/* Image Preview Container */}
            <div className="relative w-full aspect-[16/10] bg-slate-900 rounded-2xl overflow-hidden shadow-xs border border-black/5 dark:border-white/5">
              <img
                src={s.image}
                alt={s.title}
                onError={(e) => {
                  if (s.fallback) {
                    (e.target as HTMLImageElement).src = s.fallback;
                  }
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Pill Feature Tag Inside Image */}
              <div className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded-lg bg-black/65 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 shadow-xs">
                <span className="material-symbols-outlined text-xs">{s.icon}</span>
                <span>{s.badge}</span>
              </div>
            </div>

            {/* Content & Tips */}
            <div className="flex flex-col gap-2">
              <h3 className={`font-black text-sm sm:text-[15px] tracking-tight font-headline ${s.titleColor}`}>
                {s.title}
              </h3>

              <ul className="space-y-1.5">
                {s.tips.map((tip, idx) => (
                  <li key={idx} className={`flex items-start gap-1.5 text-[11px] leading-snug font-semibold ${s.tipsColor}`}>
                    <span className={`material-symbols-outlined text-[14px] shrink-0 mt-0.5 ${s.checkColor}`}>check_circle</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Tip Banner with subtle hover shift */}
      <div className="p-3.5 rounded-2xl bg-[#e8f0f3] dark:bg-[#141e2e] border border-[#d2e2e7] dark:border-[#223048] hover:bg-[#deecf0] dark:hover:bg-[#19263a] transition-colors duration-200 flex items-center justify-between gap-3 text-xs text-gray-700 dark:text-[#94a3b8]">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[#111625] dark:text-[#fe9832] text-[20px] shrink-0">
            tips_and_updates
          </span>
          <span className="text-[11px] leading-relaxed">
            <strong>{t('manual.protip.prefix', 'Pro-Tip:')}</strong> {t('manual.protip.text', 'Both Hearing and Deaf callers can talk, sign, and read subtitles together seamlessly in real-time.')}
          </span>
        </div>

        <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-black text-[#111625] dark:text-[#fe9832] shrink-0 font-mono tracking-wider bg-white/70 dark:bg-white/5 px-2 py-0.5 rounded-lg">
          SAMBHAV AI 2.0
        </span>
      </div>

      {/* Modal Footer Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-slate-200/70 dark:border-[#1e293b]">
        {/* Don't show again toggle */}
        <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-[#c1c6d7] cursor-pointer select-none self-start sm:self-center hover:text-gray-900 dark:hover:text-white transition-colors">
          <input
            type="checkbox"
            checked={!autoShow}
            onChange={handleCheckboxChange}
            className="w-4 h-4 rounded text-[#111625] dark:text-[#fe9832] focus:ring-[#111625] dark:focus:ring-[#fe9832] cursor-pointer"
          />
          <span className="font-semibold text-[11px]">{t('manual.dontShow', "Don't show this guide on startup")}</span>
        </label>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="w-full sm:w-auto px-6 py-3 bg-[#111625] hover:bg-[#222a3f] dark:bg-[#fe9832] dark:hover:bg-[#ffaa4c] text-white dark:text-[#422006] font-black text-xs rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{t('manual.gotIt', 'Got It, Start Calling')}</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export const CommunicateUserManualModal: React.FC<CommunicateUserManualModalProps> = ({
  isOpen,
  onClose,
  onToggleAutoShow,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn cursor-pointer font-['Inter',sans-serif]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-manual-title"
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-5xl">
        <CommunicateUserManualCard
          onDismiss={onClose}
          onToggleAutoShow={onToggleAutoShow}
        />
      </div>
    </div>
  );
};

export default CommunicateUserManualModal;
