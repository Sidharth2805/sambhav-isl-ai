import React, { useEffect, useState } from 'react';
import { Briefcase, Building, ExternalLink, Calendar, MapPin, Search, ShieldCheck, AlertCircle } from 'lucide-react';
import { careerService } from '../services/careerService';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';

const OPPORTUNITY_TYPES = [
  'All Types',
  'Government Recruitment',
  'Private Jobs',
  'Internships',
  'Apprenticeships',
  'Freelance',
  'Contract',
  'Research Internships',
  'Teaching Opportunities',
  'Scholarships/Programs',
  'Entrepreneurship Programs',
  'Competitions',
  'Industry Projects',
];

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [pathways, setPathways] = useState([]);
  const [activeView, setActiveView] = useState('opportunities');
  const [selectedType, setSelectedType] = useState('All Types');
  const [searchQuery, setSearchQuery] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [oppData, pathData] = await Promise.all([
          careerService.getOpportunities({
            opportunity_type: selectedType !== 'All Types' ? selectedType : undefined,
            search: searchQuery || undefined,
            is_remote: remoteOnly ? true : undefined,
            limit: 100,
          }),
          careerService.getRecruitmentPathways().catch(() => []),
        ]);
        setOpportunities(oppData);
        setPathways(pathData);
      } catch (err) {
        console.error('Failed to fetch opportunities', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedType, searchQuery, remoteOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          Opportunities & Recruitment Pathways
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Explore structured jobs, internships, apprenticeships, and verified government recruitment entrance cycles.
        </p>
      </div>

      {/* Main View Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveView('opportunities')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeView === 'opportunities'
              ? 'bg-indigo-600 text-white shadow-lg ring-1 ring-indigo-400/40'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/80 border border-slate-800'
          }`}
        >
          Active Opportunities ({opportunities.length})
        </button>
        <button
          onClick={() => setActiveView('pathways')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeView === 'pathways'
              ? 'bg-indigo-600 text-white shadow-lg ring-1 ring-indigo-400/40'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/80 border border-slate-800'
          }`}
        >
          Official Pathways ({pathways.length})
        </button>
      </div>

      {activeView === 'opportunities' && (
        <>
          {/* 12 Opportunity Types Horizontal Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {OPPORTUNITY_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                  selectedType === type
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search & Remote Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 shadow-xl">
            <div className="w-full sm:w-80">
              <Input
                placeholder="Search by title, company, or keyword..."
                icon={Search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer self-start sm:self-auto">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-indigo-500 focus:ring-indigo-500 w-4 h-4"
              />
              Remote Opportunities Only
            </label>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : opportunities.length === 0 ? (
            <div className="bg-slate-900/60 backdrop-blur-md p-12 rounded-2xl border border-slate-800 text-center">
              <Briefcase className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <h3 className="font-bold text-slate-200">No matching opportunities found</h3>
              <p className="text-xs text-slate-400 mt-1">Try selecting another opportunity type or resetting filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opportunities.map((opp) => (
                <Card key={opp.id} hoverEffect className="p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="primary" size="xs">
                          {opp.opportunity_type}
                        </Badge>
                        {opp.is_remote && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                            Remote
                          </span>
                        )}
                      </div>

                      {/* Demo vs Verified Badge */}
                      {opp.is_demo ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-400" /> Demo Opportunity
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-indigo-400" /> Official Source
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-100 tracking-tight">{opp.title}</h3>
                    
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="font-semibold text-slate-200">{opp.organization_name}</span>
                      {opp.conducting_body && (
                        <span>&middot; Authority: {opp.conducting_body}</span>
                      )}
                      {opp.location && (
                        <span>&middot; <MapPin className="w-3 h-3 inline text-slate-500" /> {opp.location}</span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mt-2.5 line-clamp-3 leading-relaxed">
                      {opp.description}
                    </p>

                    {opp.eligibility_summary && (
                      <div className="mt-2.5 p-2 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] text-slate-300">
                        <span className="font-bold text-indigo-300">Eligibility:</span> {opp.eligibility_summary}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    {opp.deadline ? (
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Deadline: {new Date(opp.deadline).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-slate-500">Rolling applications</span>
                    )}

                    {opp.application_url && (
                      <a
                        href={opp.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
                      >
                        <span>Apply Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeView === 'pathways' && (
        <div className="space-y-4">
          {pathways.map((pw) => (
            <Card key={pw.id} className="p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-100">{pw.title}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Conducting Body: <span className="font-semibold text-slate-200">{pw.conducting_body || 'National Authority'}</span> &middot; Cycle: {pw.cycle_frequency || 'Annual'}
                  </div>
                </div>
                <Badge variant="teal" size="sm">
                  {pw.pathway_type?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              {pw.eligibility_description && (
                <p className="text-xs text-slate-300 p-3 rounded-xl bg-slate-950/60 border border-slate-800 leading-relaxed">
                  <span className="font-bold text-indigo-300 block mb-0.5">Eligibility Framework:</span>
                  {pw.eligibility_description}
                </p>
              )}

              {pw.selection_stages && pw.selection_stages.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Structured Selection Stages
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {pw.selection_stages.map((stg, i) => (
                      <span key={i} className="text-xs bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300 font-medium">
                        {i + 1}. {stg}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {pw.source_url && (
                <div className="pt-2">
                  <a
                    href={pw.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center gap-1"
                  >
                    View Official Notification Portal <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
