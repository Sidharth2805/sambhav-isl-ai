import React, { useState, useRef } from 'react';

interface VideoLesson {
  id: string;
  title: string;
  category: string;
  duration: string;
  creator: string;
  youtubeLink: string;
  thumbnail: string;
  watched: boolean;
}

export const LearnISLPage: React.FC = () => {
  const playerStageRef = useRef<HTMLDivElement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [lessons, setLessons] = useState<VideoLesson[]>([
    {
      id: 'lesson-1',
      title: 'Indian Sign Language 101 (Complete Series)',
      category: 'Playlist',
      duration: 'Series',
      creator: 'Pragya Gupta',
      youtubeLink: 'https://youtube.com/playlist?list=PLxYMaKXKMMcMgg4f47WkG7AM0bb3AyjTi&si=15iv2Nxfv-M-mFvi',
      thumbnail: 'https://i.ytimg.com/vi/JPV-vboWfhY/hqdefault.jpg',
      watched: true,
    },
    {
      id: 'lesson-2',
      title: 'Basic ISL Course in Self Learning Mode',
      category: 'Course Playlist',
      duration: 'Full Course',
      creator: 'ISLRTC / Deaf Education',
      youtubeLink: 'https://youtube.com/playlist?list=PLFjydPMg4DapfRTBMokl09Ht-fhMOAYf6&si=1WF2zJ8OWbsZZOMY',
      thumbnail: 'https://i.ytimg.com/vi/5PF6JXzYyUI/hqdefault.jpg',
      watched: true,
    },
    {
      id: 'lesson-3',
      title: 'Basic 25 Words in Indian Sign Language (Part I)',
      category: 'Vocabulary',
      duration: '11 mins',
      creator: 'BUMPER CLAP',
      youtubeLink: 'https://youtu.be/OK7ppVdau8M?si=YVxi9LuzJG1m9b1D',
      thumbnail: 'https://i.ytimg.com/vi/OK7ppVdau8M/hqdefault.jpg',
      watched: false,
    },
    {
      id: 'lesson-4',
      title: 'ISL 201: Basic Everyday Conversations 1',
      category: 'Conversations',
      duration: '8 mins',
      creator: 'Pragya Gupta',
      youtubeLink: 'https://youtu.be/aOL-yBRQHmM?si=hVazCvcZGMT5cCCw',
      thumbnail: 'https://i.ytimg.com/vi/aOL-yBRQHmM/hqdefault.jpg',
      watched: false,
    },
    {
      id: 'lesson-5',
      title: 'ISL 201: Grammar & Sentence Formation',
      category: 'Grammar',
      duration: '10 mins',
      creator: 'Pragya Gupta',
      youtubeLink: 'https://youtu.be/LpLM-8Uj1Bc?si=14K2bk8zuYM7Nzgv',
      thumbnail: 'https://i.ytimg.com/vi/LpLM-8Uj1Bc/hqdefault.jpg',
      watched: false,
    },
    {
      id: 'lesson-6',
      title: 'ISL 201: Daily Expressions & Dialogues',
      category: 'Practice',
      duration: '8 mins',
      creator: 'Pragya Gupta',
      youtubeLink: 'https://youtu.be/aOL-yBRQHmM?si=XgR9KaBrwWy572DO',
      thumbnail: 'https://i.ytimg.com/vi/aOL-yBRQHmM/hqdefault.jpg',
      watched: false,
    },
  ]);

  const [activeLesson, setActiveLesson] = useState<VideoLesson>(lessons[0]);

  const toggleWatched = (id: string) => {
    setLessons((prev) =>
      prev.map((item) => (item.id === id ? { ...item, watched: !item.watched } : item))
    );
  };

  const selectLesson = (lesson: VideoLesson) => {
    setActiveLesson(lesson);
    if (playerStageRef.current) {
      playerStageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('playlist?list=')) {
      const listId = url.split('list=')[1]?.split('&')[0];
      return `https://www.youtube-nocookie.com/embed/videoseries?list=${listId}&autoplay=1`;
    }
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1]?.split('&')[0];
    }
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1` : url;
  };

  const watchedCount = lessons.filter((l) => l.watched).length;
  const progressPercent = Math.round((watchedCount / lessons.length) * 100);

  const categories = ['All', 'Playlists', 'Vocabulary', 'Conversations', 'Grammar', 'Practice'];

  const filteredLessons = lessons.filter((lesson) => {
    const matchesCat =
      selectedCategory === 'All' ||
      lesson.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesQuery =
      searchQuery.trim() === '' ||
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="flex flex-col gap-8 w-full animate-fadeIn font-['Inter',sans-serif]">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#e0e3e5] dark:border-[#2d3133] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#fe9832] dark:text-[#8dfc75] text-[28px]">sign_language</span>
            <h1 className="text-3xl font-bold text-[#030813] dark:text-white tracking-tight">Learn Indian Sign Language</h1>
          </div>
          <p className="text-sm text-[#45474c] dark:text-[#c1c6d7] mt-1">
            Watch curated video lessons directly inside SAMBHAV, master vocabulary, and track your ISL journey.
          </p>
        </div>

        {/* Global Progress Widget */}
        <div className="bg-white dark:bg-[#1a202c] rounded-2xl p-4 shadow-sm border border-[#e0e3e5] dark:border-[#2d3133] flex items-center gap-4 min-w-[240px]">
          <div className="flex-1">
            <div className="flex justify-between items-center text-xs font-bold mb-1.5">
              <span className="text-[#181c1e] dark:text-white">Course Progress</span>
              <span className="text-[#012700] dark:text-[#8dfc75] font-black">{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#e0e3e5] dark:bg-[#2d3133] rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#fe9832] to-[#8dfc75] h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-[#45474c] dark:text-[#828796] mt-1 block">
              {watchedCount} of {lessons.length} lessons completed
            </span>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* FEATURED IN-APP VIDEO PLAYER STAGE                        */}
      {/* ========================================================= */}
      <section ref={playerStageRef} className="w-full bg-[#030813] text-white rounded-[28px] overflow-hidden border border-white/10 shadow-2xl flex flex-col">
        {/* Stage Header */}
        <div className="p-4 sm:px-6 bg-[#0d121d] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#fe9832] animate-ping" />
            <span className="text-xs uppercase tracking-widest text-[#fe9832] font-black">
              Now Playing
            </span>
            <span className="px-2.5 py-0.5 bg-white/10 text-white rounded-full text-[10px] font-bold">
              {activeLesson.category}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => toggleWatched(activeLesson.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                lessons.find((l) => l.id === activeLesson.id)?.watched
                  ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                  : 'bg-[#fe9832] hover:bg-[#e8872b] text-[#683700]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {lessons.find((l) => l.id === activeLesson.id)?.watched ? 'check_circle' : 'done'}
              </span>
              <span>
                {lessons.find((l) => l.id === activeLesson.id)?.watched ? 'Completed' : 'Mark as Watched'}
              </span>
            </button>

            <a
              href={activeLesson.youtubeLink}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
            >
              <span>YouTube</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          </div>
        </div>

        {/* 16:9 HD Embedded YouTube Video Frame */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            key={activeLesson.id}
            src={getEmbedUrl(activeLesson.youtubeLink)}
            title={activeLesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>

        {/* Stage Footer Info */}
        <div className="p-4 sm:px-6 bg-[#0d121d] border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
              {activeLesson.title}
            </h2>
            <p className="text-xs text-[#828796] mt-0.5">
              Instructor / Source: <span className="text-white font-semibold">{activeLesson.creator}</span> • Duration: <span className="text-white font-semibold">{activeLesson.duration}</span>
            </p>
          </div>

          {/* Quick Switch to Next Video */}
          <button
            type="button"
            onClick={() => {
              const currentIndex = lessons.findIndex((l) => l.id === activeLesson.id);
              const nextIndex = (currentIndex + 1) % lessons.length;
              selectLesson(lessons[nextIndex]);
            }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Next Lesson</span>
            <span className="material-symbols-outlined text-[16px]">skip_next</span>
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FILTER & SEARCH BAR                                       */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#fe9832] text-[#683700] shadow-sm'
                  : 'bg-white dark:bg-[#1a202c] text-[#45474c] dark:text-[#c1c6d7] border border-[#e0e3e5] dark:border-[#2d3133] hover:bg-gray-50 dark:hover:bg-[#2d3133]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#828796] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ISL lessons..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1a202c] border border-[#e0e3e5] dark:border-[#2d3133] rounded-xl text-xs text-[#030813] dark:text-white placeholder-[#828796] focus:outline-none focus:border-[#fe9832]"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* ALL VIDEO LESSONS GRID                                    */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => {
          const isCurrentlyActive = lesson.id === activeLesson.id;
          return (
            <div
              key={lesson.id}
              className={`bg-white dark:bg-[#1a202c] rounded-[24px] overflow-hidden border transition-all flex flex-col justify-between group shadow-sm ${
                isCurrentlyActive
                  ? 'border-[#fe9832] ring-2 ring-[#fe9832]/30 shadow-md'
                  : 'border-[#e0e3e5] dark:border-[#2d3133] hover:shadow-lg hover:-translate-y-1'
              }`}
            >
              {/* Thumbnail Header with Interactive Play Trigger */}
              <div
                onClick={() => selectLesson(lesson)}
                className="relative aspect-video bg-[#030813] overflow-hidden cursor-pointer"
              >
                <img
                  src={lesson.thumbnail}
                  alt={lesson.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Play Button / Now Playing Overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 flex items-center justify-center transition-all">
                  {isCurrentlyActive ? (
                    <div className="px-4 py-2 rounded-full bg-[#fe9832] text-[#683700] font-black text-xs flex items-center gap-1.5 shadow-xl">
                      <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                      <span>Now Playing</span>
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#fe9832] text-[#683700] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[28px]">play_arrow</span>
                    </div>
                  )}
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-0.5 bg-black/60 backdrop-blur-sm text-white rounded-full text-[10px] font-bold">
                    {lesson.category}
                  </span>
                  {lesson.watched && (
                    <span className="px-2.5 py-0.5 bg-green-600/90 text-white rounded-full text-[10px] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span>
                      <span>Completed</span>
                    </span>
                  )}
                </div>

                <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/70 text-white text-[10px] font-mono font-bold rounded">
                  {lesson.duration}
                </span>
              </div>

              {/* Content Body */}
              <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                <div>
                  <h3
                    onClick={() => selectLesson(lesson)}
                    className="text-base font-bold text-[#181c1e] dark:text-white leading-snug mb-1 cursor-pointer hover:text-[#fe9832] transition-colors"
                  >
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-[#45474c] dark:text-[#828796] flex items-center gap-1.5">
                    <span>Instructor:</span>
                    <span className="font-semibold text-[#030813] dark:text-white">{lesson.creator}</span>
                  </p>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-[#e0e3e5] dark:border-[#2d3133] flex items-center justify-between gap-2">
                  {/* Watched Toggle Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#45474c] dark:text-[#c1c6d7] hover:text-[#030813] dark:hover:text-white select-none">
                    <input
                      type="checkbox"
                      checked={lesson.watched}
                      onChange={() => toggleWatched(lesson.id)}
                      className="w-4 h-4 rounded text-[#fe9832] focus:ring-[#fe9832] cursor-pointer"
                    />
                    <span>{lesson.watched ? 'Completed' : 'Mark as Watched'}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => selectLesson(lesson)}
                    className="px-3.5 py-1.5 bg-[#fe9832] hover:bg-[#e8872b] text-[#683700] rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">play_circle</span>
                    <span>{isCurrentlyActive ? 'Playing' : 'Play Lesson'}</span>
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default LearnISLPage;
