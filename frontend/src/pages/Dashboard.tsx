import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../hooks/useAccessibility';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useAccessibility();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting.morning', 'Good morning');
    if (hour < 18) return t('dashboard.greeting.afternoon', 'Good afternoon');
    return t('dashboard.greeting.evening', 'Good evening');
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Friend';

  const featureCards = [
    {
      id: 'translate',
      title: t('dashboard.card.translate.title', 'Translate ISL'),
      desc: t('dashboard.card.translate.desc', 'Real-time 2-way translation across Speech ↔ ISL, Text → ISL, and Camera gesture recognition.'),
      icon: 'translate',
      iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-[#fe9832]/20 dark:border dark:border-[#fe9832]/30 dark:text-[#fe9832]',
      hoverBorder: 'hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-500/10 dark:hover:border-[#fe9832]',
      actionColor: 'text-emerald-600 dark:text-[#fe9832]',
      image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=600&q=80',
      badge: t('dashboard.card.translate.badge', 'Neural AI'),
      badgeColor: 'bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-[#fe9832] dark:to-[#fe9832]',
      route: '/translate',
    },
    {
      id: 'video',
      title: t('dashboard.card.video.title', '1-on-1 Video Call'),
      desc: t('dashboard.card.video.desc', 'Start or join a private online video call with room codes, rejoin recovery, and live ISL avatar translation.'),
      icon: 'forum',
      iconBg: 'bg-sky-100 text-sky-700 dark:bg-[#fe9832] dark:text-[#683700]',
      hoverBorder: 'hover:border-sky-400 hover:shadow-md hover:shadow-sky-500/10 dark:hover:border-[#fe9832]',
      actionColor: 'text-sky-600 dark:text-[#fe9832]',
      image: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=600&q=80',
      badge: t('dashboard.card.video.badge', 'Live Call'),
      badgeColor: 'bg-gradient-to-r from-sky-500 to-blue-600 dark:from-emerald-500 dark:to-emerald-500',
      route: '/communicate',
    },
    {
      id: 'learn',
      title: t('dashboard.card.learn.title', 'Learn ISL'),
      desc: t('dashboard.card.learn.desc', 'Curated video lessons, vocabulary tutorials, and personal watch progress tracking.'),
      icon: 'school',
      iconBg: 'bg-amber-100 text-amber-800 dark:bg-[#8dfc75]/20 dark:text-[#8dfc75]',
      hoverBorder: 'hover:border-amber-400 hover:shadow-md hover:shadow-amber-500/10 dark:hover:border-[#8dfc75]',
      actionColor: 'text-amber-600 dark:text-[#fe9832]',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
      badge: t('dashboard.card.learn.badge', 'Lessons'),
      badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-600 dark:from-[#012700] dark:to-[#012700]',
      route: '/learn-isl',
    },
    {
      id: 'notes-reader',
      title: t('dashboard.card.notesReader.title', 'Prescription & Notes Reader'),
      desc: t('dashboard.card.notesReader.desc', 'Capture doctor prescriptions or handwritten notes with OCR and convert them instantly to ISL 3D animation and speech.'),
      icon: 'document_scanner',
      iconBg: 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:border dark:border-teal-700/50 dark:text-teal-300',
      hoverBorder: 'hover:border-teal-400 hover:shadow-md hover:shadow-teal-500/10 dark:hover:border-teal-400',
      actionColor: 'text-teal-600 dark:text-teal-400',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
      badge: t('dashboard.card.notesReader.badge', 'OCR Scanner'),
      badgeColor: 'bg-gradient-to-r from-teal-500 to-emerald-600 dark:from-teal-600 dark:to-emerald-600',
      route: '/translate?scan=true',
    },
    {
      id: 'cultural',
      title: t('dashboard.card.cultural.title', 'Cultural ISL'),
      desc: t('dashboard.card.cultural.desc', 'Experience India\'s National Anthem "Jana Gana Mana" in ISL with 3D avatar animation.'),
      icon: 'flag',
      iconBg: 'bg-rose-100 text-rose-700 dark:bg-[#fe9832]/20 dark:border dark:border-[#fe9832]/30 dark:text-[#fe9832]',
      hoverBorder: 'hover:border-amber-400 hover:shadow-md hover:shadow-amber-500/10 dark:hover:border-[#fe9832]',
      actionColor: 'text-amber-600 dark:text-[#fe9832]',
      image: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=600&q=80',
      badge: t('dashboard.card.cultural.badge', 'National Anthem'),
      badgeColor: 'bg-gradient-to-r from-[#fe9832] to-[#138808] dark:from-[#fe9832] dark:to-[#fe9832]',
      route: '/cultural-isl',
    },
  ];

  const latestNews = [
    {
      id: 'news-1',
      title: 'National ISL Curriculum Standard 2026 Announced by Education Ministry',
      category: 'Education & Policy',
      categoryBadge: 'text-indigo-600 bg-indigo-50 border border-indigo-200/70 dark:bg-[#fe9832]/10 dark:border dark:border-[#fe9832]/25 dark:text-[#fe9832]',
      date: 'Today',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      summary: 'Standardized ISL sign syntax approved for 5,000+ national schools.',
    },
    {
      id: 'news-2',
      title: 'SAMBHAV 2.0 Launches Offline Hardware-Accelerated Translation Pipeline',
      category: 'Tech & Platform',
      categoryBadge: 'text-sky-600 bg-sky-50 border border-sky-200/70 dark:bg-[#fe9832]/10 dark:border dark:border-[#fe9832]/25 dark:text-[#fe9832]',
      date: 'Yesterday',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      summary: 'Edge AI models now process 21-hand-keypoint streams with zero latency.',
    },
    {
      id: 'news-3',
      title: 'Hospital Emergency Wards Deploy 24/7 AI-Assisted ISL Interpretation',
      category: 'Healthcare Accessibility',
      categoryBadge: 'text-emerald-600 bg-emerald-50 border border-emerald-200/70 dark:bg-[#fe9832]/10 dark:border dark:border-[#fe9832]/25 dark:text-[#fe9832]',
      date: '3 days ago',
      image: '/images/healthcare.jpg',
      summary: 'Zero-latency emergency medical triage kiosks active across 50 cities.',
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fadeIn font-['Inter',sans-serif]">

      {/* Top Welcome Header Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0d121d] p-5 sm:p-6 rounded-3xl border border-[#e2e8f0] dark:border-[#2d3133] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0f172a] dark:text-white flex items-center gap-2">
              <span>{getGreeting()}, {firstName}</span>
              <span>👋</span>
            </h1>
            <span className="text-xl">🇮🇳</span>
          </div>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#828796] mt-1 font-medium">
            {t('dashboard.subtitle', 'AI-driven Indian Sign Language interpretation, learning, and accessibility tools.')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* User Profile Pill */}
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 bg-[#f8fafc] dark:bg-[#151c28] border border-[#e2e8f0] dark:border-[#243044] hover:border-indigo-400 dark:hover:border-[#fe9832] p-1.5 pr-4 rounded-2xl cursor-pointer transition-all duration-200 group text-left shadow-2xs"
            title="Open Account Profile & Settings"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || 'User'}
                className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-[#151c28] shadow-xs shrink-0 group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 dark:bg-gradient-to-br dark:from-[#fe9832] dark:via-[#e8872b] dark:to-[#012700] text-white flex items-center justify-center font-bold text-sm border-2 border-white dark:border-[#151c28] shadow-xs shrink-0 group-hover:scale-105 transition-transform select-none">
                {(user?.name || 'User').trim().charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex flex-col text-left pr-0.5">
              <span className="text-sm font-bold text-[#030813] dark:text-white group-hover:text-indigo-600 dark:group-hover:text-[#fe9832] transition-colors truncate max-w-[150px]">
                {user?.name || 'My Profile'}
              </span>
            </div>

            <span className="material-symbols-outlined text-[18px] text-[#64748b] dark:text-[#828796] group-hover:text-indigo-600 dark:group-hover:text-[#fe9832] group-hover:translate-x-0.5 transition-all">
              chevron_right
            </span>
          </button>
        </div>
      </header>

      {/* Main Bento Grid: Equal Column Length */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* Left: Feature Cards (8 cols) */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">{t('dashboard.section.workspace', 'Workspace Capabilities')}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            {featureCards.map((card) => (
              <div
                key={card.id}
                onClick={() => navigate(card.route)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(card.route)}
                tabIndex={0}
                role="button"
                aria-label={card.title}
                className={`group bg-white dark:bg-[#151c28] rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col border border-[#e2e8f0] dark:border-[#243044] ${card.hoverBorder} transition-all duration-200 overflow-hidden text-left`}
              >
                {/* Image Banner */}
                <div className="relative h-32 overflow-hidden rounded-t-2xl">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
                  <span className={`absolute top-2.5 left-2.5 ${card.badgeColor} text-white text-[10px] font-black px-2.5 py-0.5 rounded-md shadow-xs`}>
                    {card.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className={`${card.iconBg} w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs`}>
                        <span className="material-symbols-outlined text-[18px]">{card.icon}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#0f172a] dark:text-white group-hover:text-indigo-600 dark:group-hover:text-[#fe9832] transition-colors">
                        {card.title}
                      </h4>
                    </div>
                    <p className="text-xs text-[#475569] dark:text-[#828796] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className={`flex items-center justify-between text-xs font-bold ${card.actionColor} pt-2 border-t border-[#f1f5f9] dark:border-white/5`}>
                    <span>{t('dashboard.card.open', 'Open Feature')}</span>
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: News Panel (4 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#0f172a] dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 dark:text-[#fe9832] text-[20px]">newspaper</span>
              <span>{t('sidebar.news', 'News')}</span>
            </h3>
          </div>

          <div className="bg-white dark:bg-[#151c28] rounded-2xl p-4 shadow-xs border border-[#e2e8f0] dark:border-[#243044] flex flex-col justify-between gap-3 flex-1">
            <div className="flex flex-col gap-3 divide-y divide-[#e2e8f0] dark:divide-[#243044]">
              {latestNews.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate('/news')}
                  className="group cursor-pointer flex gap-3 pt-3 first:pt-0 hover:opacity-95 transition-all text-left"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden relative shadow-2xs border border-[#e2e8f0] dark:border-[#243044] shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex flex-col justify-between min-w-0">
                    <div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider inline-block px-1.5 py-0.5 rounded ${item.categoryBadge}`}>
                        {item.category}
                      </span>
                      <h4 className="text-xs font-bold text-[#0f172a] dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-[#fe9832] transition-colors leading-snug mt-1">
                        {item.title}
                      </h4>
                    </div>
                    <span className="text-[10px] text-[#475569] dark:text-[#828796] mt-1">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/news')}
              className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 dark:bg-none dark:[background-image:none] dark:bg-[#1a2333] dark:hover:bg-[#223046] dark:border-[#2d3a50] dark:hover:border-[#fe9832]/50 dark:text-[#fe9832] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 mt-1 cursor-pointer shadow-2xs active:scale-[0.99] group"
            >
              <span>{t('dashboard.news.explore', 'Explore All Updates')}</span>
              <span className="material-symbols-outlined text-[15px] text-indigo-700 dark:text-[#fe9832] transition-transform group-hover:translate-x-0.5">arrow_forward</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;

