import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Compass, 
  Map, 
  Briefcase, 
  Scale, 
  Sparkles, 
  FileText, 
  ArrowLeft
} from 'lucide-react';
import CareerExplorerPage from './CareerExplorerPage';
import RoadmapPage from './RoadmapPage';
import OpportunitiesPage from './OpportunitiesPage';
import CareerComparisonPage from './CareerComparisonPage';
import GuidedCareerFinderModal from '../components/common/GuidedCareerFinderModal';
import ResumeUploadModal from '../components/common/ResumeUploadModal';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';

const MyCareerMapInner: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'explore';

  const [guidedFinderOpen, setGuidedFinderOpen] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const tabs = [
    { id: 'explore', label: 'Career Explorer', icon: Compass, count: '152 Careers' },
    { id: 'roadmaps', label: 'Milestone Roadmaps', icon: Map, count: '5 Roadmaps' },
    { id: 'opportunities', label: 'Jobs & Pathways', icon: Briefcase, count: '110 Pathways' },
    { id: 'compare', label: 'Career Comparison', icon: Scale, count: 'Matrix' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 selection:bg-amber-500 selection:text-slate-950 font-['Inter',sans-serif]">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Back to SAMBHAV */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Return to SAMBHAV Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-sm">
                <Compass className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>MyCareerMap</span>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    AI Vocational Hub
                  </span>
                </h1>
              </div>
            </div>
          </div>

          {/* Quick Action Utilities */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setGuidedFinderOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs sm:text-sm hover:opacity-95 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Guided Career AI</span>
            </button>

            <button
              onClick={() => setResumeModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Resume Skills Scanner</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-3 pt-2 border-t border-slate-800/80 flex overflow-x-auto no-scrollbar gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap border ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-slate-950/20 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {activeTab === 'explore' && <CareerExplorerPage />}
        {activeTab === 'roadmaps' && <RoadmapPage />}
        {activeTab === 'opportunities' && <OpportunitiesPage />}
        {activeTab === 'compare' && <CareerComparisonPage />}
      </main>

      {/* Modals */}
      {guidedFinderOpen && (
        <GuidedCareerFinderModal
          isOpen={guidedFinderOpen}
          onClose={() => setGuidedFinderOpen(false)}
          onOpenResumeUpload={() => {
            setGuidedFinderOpen(false);
            setResumeModalOpen(true);
          }}
        />
      )}

      {resumeModalOpen && (
        <ResumeUploadModal
          isOpen={resumeModalOpen}
          onClose={() => setResumeModalOpen(false)}
          onUploadSuccess={() => {
            setResumeModalOpen(false);
            setTab('explore');
          }}
        />
      )}
    </div>
  );
};

export const MyCareerMapPage: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MyCareerMapInner />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default MyCareerMapPage;
