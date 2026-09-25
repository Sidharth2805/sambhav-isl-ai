import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../hooks/useAccessibility';
import type { FontSize } from '../hooks/useAccessibility';
import {
  isCommunicateGuideEnabled,
  setCommunicateGuideEnabled,
} from '../components/communication/CommunicateUserManualModal';
import {
  isAppAnimationsEnabled,
  setAppAnimationsEnabled,
} from '../utils/animationPreferences';
import { FeedbackRatingModal } from '../components/help/FeedbackRatingModal';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserName, updateUserAvatar, updateUserProfile } = useAuth();
  const { fontSize, setFontSize, theme, toggleTheme, setLanguage: setAppLanguage } = useAccessibility();

  // Guide tutorial preferences
  const [guideEnabled, setGuideEnabled] = useState<boolean>(() => isCommunicateGuideEnabled());
  const [guideFeedback, setGuideFeedback] = useState<string | null>(null);

  // Global App Animations & Transitions preferences
  const [animationsEnabled, setAnimationsEnabledState] = useState<boolean>(() => isAppAnimationsEnabled());
  const [animationFeedback, setAnimationFeedback] = useState<string | null>(null);

  // Rating & Support Modals
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackModalTab, setFeedbackModalTab] = useState<'feedback' | 'contact'>('feedback');

  // Name editing state
  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  // Avatar states
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile preferences
  const profile = user?.profile;
  const [language, setLanguage] = useState(profile?.preferredLanguage || 'English');
  const signLanguage = 'ISL';
  const [commPreference, setCommPreference] = useState(profile?.communicationPreference || 'text');
  const [needs, setNeeds] = useState<string[]>(profile?.accessibilityNeeds || []);
  
  // Local state managers for preferences
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefError, setPrefError] = useState<string | null>(null);
  const [prefSuccess, setPrefSuccess] = useState<string | null>(null);

  // Live dynamic initial based on entered name
  const liveInitial = (name || user?.name || 'U').trim().charAt(0).toUpperCase();
  const customAvatarUrl = user?.avatarUrl;

  // Handle Name update
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Name cannot be empty.');
      return;
    }
    setSavingName(true);
    setNameError(null);
    setNameSuccess(null);

    try {
      await updateUserName(name.trim());
      setNameSuccess('Your name has been updated successfully!');
      setTimeout(() => setNameSuccess(null), 3500);
    } catch (err: any) {
      setNameError(err?.message || 'Failed to update name. Please try again.');
    } finally {
      setSavingName(false);
    }
  };

  // Handle Avatar file upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, WEBP).');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('Image file size must be under 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        if (base64Data) {
          try {
            await updateUserAvatar(base64Data);
            setAvatarSuccess('Profile photo updated successfully!');
            setTimeout(() => setAvatarSuccess(null), 3500);
          } catch (err) {
            console.error('Failed to update avatar:', err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset to default Letter avatar
  const handleResetAvatar = async () => {
    await updateUserAvatar('');
    setAvatarSuccess('Profile photo reset to default name initial!');
    setTimeout(() => setAvatarSuccess(null), 3000);
  };

  const handleNeedToggle = (need: string) => {
    if (need === 'DEAF' && needs.includes('HARD_OF_HEARING')) {
      setPrefError('Cannot select both Deaf and Hard of Hearing simultaneously.');
      return;
    }
    if (need === 'HARD_OF_HEARING' && needs.includes('DEAF')) {
      setPrefError('Cannot select both Deaf and Hard of Hearing simultaneously.');
      return;
    }

    setPrefError(null);
    setPrefSuccess(null);
    if (needs.includes(need)) {
      setNeeds(needs.filter((n) => n !== need));
    } else {
      setNeeds([...needs, need]);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    setPrefError(null);
    setPrefSuccess(null);

    try {
      await updateUserProfile({
        preferredLanguage: language,
        preferredSignLanguage: signLanguage,
        textSizePreference: fontSize,
        highContrastPreference: false,
        communicationPreference: commPreference,
        accessibilityNeeds: needs,
      });

      // Sync active app language immediately
      if (language === 'Hindi') {
        setAppLanguage('hi');
      } else if (language === 'Odia') {
        setAppLanguage('or');
      } else {
        setAppLanguage('en');
      }

      setPrefSuccess('Accessibility & language preferences updated successfully!');
      setTimeout(() => setPrefSuccess(null), 3500);
    } catch (err: any) {
      setPrefError(err?.message || 'Failed to save preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto animate-fadeIn font-['Inter',sans-serif]">
      
      {/* Back to Dashboard Navigation & Header */}
      <div className="flex flex-col gap-3">
        <div>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1a202c] border border-slate-200 dark:border-[#2d3133] text-xs font-bold text-gray-600 dark:text-[#c1c6d7] hover:text-indigo-600 hover:border-indigo-300 dark:hover:text-[#38bdf8] dark:hover:border-[#38bdf8] transition-all shadow-2xs hover:shadow-xs cursor-pointer group active:scale-95"
            title="Return to Dashboard"
            aria-label="Return to Dashboard"
          >
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-0.5">arrow_back</span>
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2d3133] pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              <span className="material-symbols-outlined text-indigo-600 dark:text-[#fe9832] text-3xl sm:text-4xl">manage_accounts</span>
              <span>User Profile &amp; Settings</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-[#828796] mt-1">
              Personalize your identity, communication modes, language, and accessibility preferences.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setFeedbackModalTab('feedback');
                setFeedbackModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-700 dark:text-[#fe9832] hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px] text-amber-500">star</span>
              <span>Rate App</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFeedbackModalTab('contact');
                setFeedbackModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px] text-indigo-500">support_agent</span>
              <span>Contact Support</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: IDENTITY & PROFILE PHOTO (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* PROFILE CARD */}
          <section className="bg-white dark:bg-[#1a202c] rounded-[24px] p-6 border border-slate-200 dark:border-[#2d3133] shadow-xs flex flex-col items-center text-center gap-5">
            <div className="relative group">
              {customAvatarUrl ? (
                <img
                  src={customAvatarUrl}
                  alt={user?.name || 'User Profile'}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-indigo-100 dark:border-[#2d3133] shadow-md transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 text-white font-black text-4xl sm:text-5xl flex items-center justify-center border-4 border-indigo-100 dark:border-[#2d3133] shadow-md transition-transform group-hover:scale-105">
                  {liveInitial}
                </div>
              )}

              {/* Upload Photo Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 dark:bg-[#fe9832] text-white dark:text-[#683700] flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-white dark:border-[#1a202c]"
                title="Upload Profile Picture"
                aria-label="Upload Profile Picture"
              >
                <span className="material-symbols-outlined text-[16px]">photo_camera</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                aria-hidden="true"
              />
            </div>

            {avatarSuccess && (
              <div className="w-full p-2.5 rounded-xl bg-emerald-50 dark:bg-green-950/40 border border-emerald-200 dark:border-green-800 text-xs font-semibold text-emerald-800 dark:text-green-300 animate-fadeIn">
                {avatarSuccess}
              </div>
            )}

            <div className="flex flex-col items-center">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                {user?.name || 'SAMBHAV User'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-[#828796] mt-0.5">
                {user?.email || 'user@sambhav-isl.ai'}
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold uppercase tracking-wider">
                  {user?.accountType || 'COMMON_USER'}
                </span>
                {user?.profile?.communicationPreference && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-[#fe9832] border border-amber-200 dark:border-amber-800 text-[10px] font-bold uppercase tracking-wider">
                    {user.profile.communicationPreference}
                  </span>
                )}
              </div>
            </div>

            {customAvatarUrl && (
              <button
                type="button"
                onClick={handleResetAvatar}
                className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                Remove photo and use letter initial
              </button>
            )}
          </section>

          {/* EDIT NAME FORM */}
          <section className="bg-white dark:bg-[#1a202c] rounded-[24px] p-6 border border-slate-200 dark:border-[#2d3133] shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#2d3133] pb-3">
              <span className="material-symbols-outlined text-indigo-600 dark:text-[#fe9832] text-[22px]">badge</span>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Personal Information</h2>
            </div>

            <form onSubmit={handleSaveName} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1 text-xs">
                <label htmlFor="user-name-input" className="font-bold text-gray-900 dark:text-white">
                  Display Full Name
                </label>
                <input
                  id="user-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="min-h-[38px] px-3 rounded-xl border border-slate-300 dark:border-[#2d3133] bg-slate-50 dark:bg-[#030813] text-gray-900 dark:text-white font-semibold outline-none text-xs focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <label className="font-bold text-gray-500 dark:text-[#828796]">
                  Registered Email (Fixed)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="min-h-[38px] px-3 rounded-xl border border-slate-200 dark:border-[#2d3133] bg-slate-100 dark:bg-[#030813]/60 text-gray-400 dark:text-[#6c7280] font-medium outline-none text-xs cursor-not-allowed"
                />
              </div>

              {nameError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-red-950/40 border border-rose-200 dark:border-red-800 text-xs font-semibold text-rose-700 dark:text-red-300">
                  {nameError}
                </div>
              )}
              {nameSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-green-950/40 border border-emerald-200 dark:border-green-800 text-xs font-semibold text-emerald-800 dark:text-green-300">
                  {nameSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={savingName || !name.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#683700] hover:opacity-95 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-1"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>{savingName ? 'Saving...' : 'Update Name'}</span>
              </button>
            </form>
          </section>

          {/* QUICK LINKS TO RATE & SUPPORT */}
          <section className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-[24px] p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 dark:text-[#fe9832] text-[20px]">star_rate</span>
              <h3 className="font-bold text-xs text-gray-900 dark:text-white">Help Us Improve SAMBHAV</h3>
            </div>
            <p className="text-[11px] text-gray-600 dark:text-[#cbd5e1] leading-relaxed">
              Rate your experience or message our dedicated engineering &amp; accessibility team directly.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setFeedbackModalTab('feedback');
                  setFeedbackModalOpen(true);
                }}
                className="py-2 px-3 bg-white dark:bg-[#1a202c] border border-amber-300 dark:border-[#fe9832]/40 rounded-xl text-xs font-bold text-amber-800 dark:text-[#fe9832] hover:bg-amber-50 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">rate_review</span>
                <span>Rate App</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFeedbackModalTab('contact');
                  setFeedbackModalOpen(true);
                }}
                className="py-2 px-3 bg-white dark:bg-[#1a202c] border border-slate-300 dark:border-[#2d3133] rounded-xl text-xs font-bold text-gray-800 dark:text-white hover:bg-slate-50 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">mail</span>
                <span>Contact Team</span>
              </button>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: PREFERENCES, LANGUAGE, ACCESSIBILITY & ANIMATIONS (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* SECTION 3: ACCESSIBILITY NEEDS */}
          {user?.accountType === 'ACCESSIBILITY_USER' && (
            <section className="bg-white dark:bg-[#1a202c] rounded-[24px] p-6 border border-slate-200 dark:border-[#2d3133] shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#2d3133] pb-3">
                <span className="material-symbols-outlined text-indigo-600 dark:text-[#fe9832] text-[22px]">accessibility_new</span>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Accessibility Needs Selection</h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-[#828796]">
                Select the assistive features tailored to your daily communication:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { key: 'DEAF', label: 'Deaf (ISL Primary)', icon: 'hearing_disabled' },
                  { key: 'HARD_OF_HEARING', label: 'Hard of Hearing', icon: 'hearing' },
                  { key: 'MUTE', label: 'Non-Verbal / Mute', icon: 'voice_over_off' },
                  { key: 'LOW_VISION', label: 'Low Vision Support', icon: 'visibility' },
                  { key: 'MOTOR_IMPAIRMENT', label: 'Motor / Dexterity Assistance', icon: 'pan_tool' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNeedToggle(item.key)}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer text-left ${
                      needs.includes(item.key)
                        ? 'border-indigo-600 dark:border-[#fe9832] bg-indigo-50/70 dark:bg-[#fe9832]/10 text-indigo-900 dark:text-[#fe9832]'
                        : 'border-slate-200 dark:border-[#2d3133] bg-slate-50 dark:bg-[#030813] text-gray-700 dark:text-[#c1c6d7] hover:border-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    <span className="material-symbols-outlined text-[18px]">
                      {needs.includes(item.key) ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* SECTION 4: LANGUAGE & COMMUNICATION PREFERENCES */}
          <section className="bg-white dark:bg-[#1a202c] rounded-[24px] p-6 border border-slate-200 dark:border-[#2d3133] shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#2d3133] pb-3">
              <span className="material-symbols-outlined text-indigo-600 dark:text-[#fe9832] text-[22px]">translate</span>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Language &amp; System Preferences</h2>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label htmlFor="pref-lang" className="font-bold text-gray-900 dark:text-white">Supported Application &amp; Spoken Language</label>
                <select
                  id="pref-lang"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="min-h-[38px] px-3 rounded-xl border border-slate-300 dark:border-[#2d3133] bg-slate-50 dark:bg-[#030813] text-gray-900 dark:text-white font-semibold outline-none text-xs focus:border-indigo-500"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
                </select>
                <span className="text-[10px] text-gray-500 dark:text-[#828796]">
                  Available full translations: English, Hindi, and Odia.
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="pref-comm" className="font-bold text-gray-900 dark:text-white">Default Communication Mode</label>
                <select
                  id="pref-comm"
                  value={commPreference}
                  onChange={(e) => setCommPreference(e.target.value)}
                  className="min-h-[38px] px-3 rounded-xl border border-slate-300 dark:border-[#2d3133] bg-slate-50 dark:bg-[#030813] text-gray-900 dark:text-white font-semibold outline-none text-xs focus:border-indigo-500"
                >
                  <option value="text">Text Conversational Input</option>
                  <option value="sign">Indian Sign Language (ISL) Avatar</option>
                  <option value="speech">Spoken Audio Output</option>
                </select>
              </div>
            </div>

            {prefError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-red-950/40 border border-rose-200 dark:border-red-800 text-xs font-semibold text-rose-700 dark:text-red-300">
                {prefError}
              </div>
            )}
            {prefSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-green-950/40 border border-emerald-200 dark:border-green-800 text-xs font-semibold text-emerald-800 dark:text-green-300">
                {prefSuccess}
              </div>
            )}

            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={savingPrefs}
              className="w-full py-2.5 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#683700] hover:opacity-95 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer mt-1"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>{savingPrefs ? 'Saving...' : 'Save Language & Preferences'}</span>
            </button>
          </section>

          {/* SECTION 5: DISPLAY MODE & THEME */}
          <section className="bg-white dark:bg-[#1a202c] rounded-[24px] p-6 border border-slate-200 dark:border-[#2d3133] shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#2d3133] pb-3">
              <span className="material-symbols-outlined text-indigo-600 dark:text-[#fe9832] text-[22px]">palette</span>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Display &amp; Font Scaling</h2>
            </div>
            
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">App Color Theme</p>
                <p className="text-[10px] text-gray-500 dark:text-[#828796]">
                  {theme === 'dark' ? 'Sleek Dark Mode' : 'Clean Light Mode'}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#2d3133] dark:hover:bg-[#3d4346] text-gray-800 dark:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
                <span>{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
              </button>
            </div>

            {/* Font scaling selector */}
            <div className="flex flex-col gap-1 text-xs pt-2 border-t border-slate-100 dark:border-[#2d3133]">
              <label htmlFor="select-fontsize" className="font-bold text-gray-900 dark:text-white">Text Size Scaling</label>
              <select
                id="select-fontsize"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value as FontSize)}
                className="min-h-[38px] px-3 rounded-xl border border-slate-300 dark:border-[#2d3133] bg-slate-50 dark:bg-[#030813] text-gray-900 dark:text-white font-semibold outline-none text-xs"
              >
                <option value="small">Small scale (85%)</option>
                <option value="normal">Standard scale (100%)</option>
                <option value="large">Large scale (115%)</option>
                <option value="xlarge">Extra Large scale (130%)</option>
              </select>
            </div>

          </section>

          {/* SECTION 6: APP ANIMATIONS & TRANSITIONS (Item 3) */}
          <section className="bg-white dark:bg-[#1a202c] rounded-[24px] p-6 border border-slate-200 dark:border-[#2d3133] shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#2d3133] pb-3">
              <span className="material-symbols-outlined text-indigo-600 dark:text-[#fe9832] text-[22px]">animation</span>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">App Animations &amp; Transitions</h2>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Global Smooth Animations &amp; Transitions</p>
                <p className="text-[10px] text-gray-500 dark:text-[#828796] mt-0.5 leading-relaxed">
                  {animationsEnabled
                    ? 'Active: Fluid transitions, motion effects, and animations run across all pages.'
                    : 'Disabled: Animations and transitions are instantly bypassed for reduced motion & high performance.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const nextVal = !animationsEnabled;
                  setAnimationsEnabledState(nextVal);
                  setAppAnimationsEnabled(nextVal);
                  setAnimationFeedback(
                    nextVal
                      ? 'Global app animations and smooth transitions enabled.'
                      : 'App animations & transitions disabled across all pages (instant rendering).'
                  );
                  setTimeout(() => setAnimationFeedback(null), 4000);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  animationsEnabled
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {animationsEnabled ? 'motion_photos_off' : 'motion_photos_on'}
                </span>
                <span>{animationsEnabled ? 'Disable Animations' : 'Enable Animations'}</span>
              </button>
            </div>

            {animationFeedback && (
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-[#fe9832]/10 border border-indigo-200 dark:border-[#fe9832]/30 text-xs font-semibold text-indigo-800 dark:text-[#fe9832] flex items-center gap-2 animate-fadeIn">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{animationFeedback}</span>
              </div>
            )}
          </section>

          {/* SECTION 7: TUTORIALS & USER GUIDES */}
          <section className="bg-white dark:bg-[#1a202c] rounded-[24px] p-6 border border-slate-200 dark:border-[#2d3133] shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#2d3133] pb-3">
              <span className="material-symbols-outlined text-indigo-600 dark:text-[#fe9832] text-[22px]">menu_book</span>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Tutorials &amp; User Guides</h2>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Communicate Setup Manual</p>
                <p className="text-[10px] text-gray-500 dark:text-[#828796] mt-0.5 leading-relaxed">
                  {guideEnabled
                    ? 'Pop-up guide is active on start with camera distance & ISL tracking tips.'
                    : 'Tutorial removed. Guide will not automatically pop up on Communicate page.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const nextVal = !guideEnabled;
                  setGuideEnabled(nextVal);
                  setCommunicateGuideEnabled(nextVal);
                  setGuideFeedback(
                    nextVal
                      ? 'Communicate setup guide will show automatically when opening Communicate.'
                      : 'Communicate tutorial removed. You can still view it manually anytime from the header button.'
                  );
                  setTimeout(() => setGuideFeedback(null), 4000);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  guideEnabled
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {guideEnabled ? 'visibility_off' : 'visibility'}
                </span>
                <span>{guideEnabled ? 'Remove Tutorial' : 'Enable Tutorial'}</span>
              </button>
            </div>

            {guideFeedback && (
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-[#fe9832]/10 border border-indigo-200 dark:border-[#fe9832]/30 text-xs font-semibold text-indigo-800 dark:text-[#fe9832] flex items-center gap-2 animate-fadeIn">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{guideFeedback}</span>
              </div>
            )}
          </section>

        </div>

      </div>

      {/* Global Feedback & Rating Modal */}
      <FeedbackRatingModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        defaultTab={feedbackModalTab}
      />

    </div>
  );
};

export default ProfilePage;
