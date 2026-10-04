import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Compass,
  UploadCloud,
  Route,
  Briefcase,
  Layers,
  ArrowRight,
  X,
} from 'lucide-react';
import { careerService } from '../../services/careerService';

export default function CommandPalette({ isOpen, onClose, onOpenResume, onOpenMatcher }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [careers, setCareers] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Load careers for instant search
  useEffect(() => {
    if (isOpen) {
      careerService.getCareers({ limit: 100 })
        .then((data) => setCareers(data || []))
        .catch(() => {});
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const quickActions = [
    {
      id: 'action-matcher',
      title: 'Job & Career Match Finder',
      subtitle: '4-step deterministic discovery wizard',
      category: 'Actions',
      icon: Compass,
      action: () => {
        onClose();
        if (onOpenMatcher) onOpenMatcher();
      },
    },
    {
      id: 'action-resume',
      title: 'Upload Resume / CV',
      subtitle: 'Extract skills and evaluate career matches',
      category: 'Actions',
      icon: UploadCloud,
      action: () => {
        onClose();
        if (onOpenResume) onOpenResume();
      },
    },
    {
      id: 'action-careers',
      title: 'Career Catalog',
      subtitle: 'Explore all 152 standard career tracks and competencies',
      category: 'Navigation',
      icon: Compass,
      action: () => {
        onClose();
        navigate('/careers');
      },
    },
    {
      id: 'action-compare',
      title: 'Career Comparison',
      subtitle: 'Compare side-by-side competencies, salaries and outlook',
      category: 'Navigation',
      icon: Layers,
      action: () => {
        onClose();
        navigate('/compare');
      },
    },
    {
      id: 'action-roadmap',
      title: 'My Personalized Roadmaps',
      subtitle: 'Track active career progression milestones',
      category: 'Navigation',
      icon: Route,
      action: () => {
        onClose();
        navigate('/roadmap');
      },
    },
    {
      id: 'action-opps',
      title: 'Verified Opportunities & Pathways',
      subtitle: 'Explore government & industry openings',
      category: 'Navigation',
      icon: Briefcase,
      action: () => {
        onClose();
        navigate('/opportunities');
      },
    },
  ];

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return quickActions;

    const matchedActions = quickActions.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.subtitle.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );

    const matchedCareers = careers
      .filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          (c.summary && c.summary.toLowerCase().includes(q))
      )
      .slice(0, 8)
      .map((c) => ({
        id: `career-${c.id}`,
        title: c.title,
        subtitle: `${c.code} · ${c.demand_level || 'Growing'} Demand · ${c.required_education_level || 'Degree'}`,
        category: 'Careers',
        icon: Compass,
        action: () => {
          onClose();
          navigate(`/careers/${c.id}`);
        },
      }));

    return [...matchedActions, ...matchedCareers];
  }, [query, careers]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, career track, or skill (e.g., Software, CA, Data)..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No matching commands or careers found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-600/15 border border-blue-500/30 text-white'
                      : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100 truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
                ↑
              </kbd>{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
                ↓
              </kbd>{' '}
              navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
                Enter
              </kbd>{' '}
              select
            </span>
          </div>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">
              Esc
            </kbd>{' '}
            close
          </span>
        </div>
      </div>
    </div>
  );
}
