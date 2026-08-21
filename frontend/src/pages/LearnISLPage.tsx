import React, { useState } from 'react';

interface VideoLesson {
  id: string;
  title: string;
  category: string;
  duration: string;
  youtubeLink: string;
  thumbnail: string;
  watched: boolean;
}

export const LearnISLPage: React.FC = () => {
  const [lessons, setLessons] = useState<VideoLesson[]>([
    {
      id: 'lesson-1',
      title: 'ISL Alphabet & Numbers 1-100',
      category: 'Beginner',
      duration: '12 mins',
      youtubeLink: 'DjMahi',
      thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
      watched: true,
    },
    {
      id: 'lesson-2',
      title: 'Daily Greetings & Common Expressions',
      category: 'Beginner',
      duration: '18 mins',
      youtubeLink: 'DjMahi',
      thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
      watched: true,
    },
    {
      id: 'lesson-3',
      title: 'Family, Relationships & Pronouns in ISL',
      category: 'Intermediate',
      duration: '22 mins',
      youtubeLink: 'DjMahi',
      thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80',
      watched: false,
    },
    {
      id: 'lesson-4',
      title: 'Emergency, Healthcare & Medical Signs',
      category: 'Essential',
      duration: '25 mins',
      youtubeLink: 'DjMahi',
      thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
      watched: false,
    },
    {
      id: 'lesson-5',
      title: 'Workplace, Technical & Technology Jargon',
      category: 'Advanced',
      duration: '30 mins',
      youtubeLink: 'DjMahi',
      thumbnail: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80',
      watched: false,
    },
  ]);

  const toggleWatched = (id: string) => {
    setLessons((prev) =>
      prev.map((item) => (item.id === id ? { ...item, watched: !item.watched } : item))
    );
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const newUrl = reader.result;
          setLessons((prev) =>
            prev.map((item) => (item.id === id ? { ...item, thumbnail: newUrl } : item))
          );
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const watchedCount = lessons.filter((l) => l.watched).length;
  const progressPercent = Math.round((watchedCount / lessons.length) * 100);

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
            Explore video tutorials, master vocabulary, and track your ISL learning journey.
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

      {/* Video Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-white dark:bg-[#1a202c] rounded-[24px] overflow-hidden border border-[#e0e3e5] dark:border-[#2d3133] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between"
          >
            {/* Thumbnail Header */}
            <div className="relative aspect-video bg-[#030813] overflow-hidden group">
              <img
                src={lesson.thumbnail}
                alt={lesson.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Play / Redirect Overlay */}
              <a
                href={lesson.youtubeLink}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                title={`Open lesson on YouTube (${lesson.youtubeLink})`}
              >
                <div className="w-12 h-12 rounded-full bg-[#fe9832] text-[#683700] flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-[28px]">play_arrow</span>
                </div>
              </a>

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
                <h3 className="text-base font-bold text-[#181c1e] dark:text-white leading-snug mb-1">
                  {lesson.title}
                </h3>
                <p className="text-xs text-[#45474c] dark:text-[#828796]">
                  Link Target: <code className="bg-[#f1f4f6] dark:bg-[#2d3133] px-1.5 py-0.5 rounded text-[#8f4e00] dark:text-[#fe9832] font-bold">{lesson.youtubeLink}</code>
                </p>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-[#e0e3e5] dark:border-[#2d3133] flex items-center justify-between gap-2">
                {/* Watched Toggle Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#45474c] dark:text-[#c1c6d7] hover:text-[#030813] dark:hover:text-white">
                  <input
                    type="checkbox"
                    checked={lesson.watched}
                    onChange={() => toggleWatched(lesson.id)}
                    className="w-4 h-4 rounded text-[#fe9832] focus:ring-[#fe9832] cursor-pointer"
                  />
                  <span>{lesson.watched ? 'Mark as Unwatched' : 'Mark as Watched'}</span>
                </label>

                {/* Upload Thumbnail Button */}
                <label className="px-2.5 py-1.5 bg-[#f1f4f6] dark:bg-[#2d3133] hover:bg-[#e0e3e5] dark:hover:bg-[#3d4346] text-[#030813] dark:text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">image</span>
                  <span>Upload Thumbnail</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleThumbnailUpload(e, lesson.id)}
                  />
                </label>
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default LearnISLPage;
