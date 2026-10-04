import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowUpRight, Scale, CheckCircle2, Sparkles, Compass, RotateCcw } from 'lucide-react';
import { careerService } from '../services/careerService';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import GuidedCareerFinderModal from '../components/common/GuidedCareerFinderModal';

export default function CareerExplorerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [careers, setCareers] = useState([]);
  const [careerTypes, setCareerTypes] = useState([]);
  const [userMatches, setUserMatches] = useState({});
  const [loading, setLoading] = useState(true);
  const [matcherModalOpen, setMatcherModalOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDemand, setSelectedDemand] = useState('');
  const [selectedEnvironment, setSelectedEnvironment] = useState('');
  const [minMatch, setMinMatch] = useState(0);

  // Multi-compare selection
  const [compareIds, setCompareIds] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [careersData, typesData] = await Promise.all([
          careerService.getCareers({ limit: 150 }),
          careerService.getCareerTypes().catch(() => []),
        ]);
        setCareers(careersData);
        setCareerTypes(typesData);

        if (user) {
          const matches = await careerService.getMatches().catch(() => []);
          const matchMap = {};
          matches.forEach((m) => {
            matchMap[m.career_id] = m;
          });
          setUserMatches(matchMap);
        }
      } catch (err) {
        console.error('Failed to load careers catalog', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleToggleCompare = (id) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter((x) => x !== id));
    } else {
      if (compareIds.length >= 4) {
        alert('You can select up to 4 careers to compare simultaneously.');
        return;
      }
      setCompareIds([...compareIds, id]);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedDemand('');
    setSelectedEnvironment('');
    setMinMatch(0);
  };

  // Filtered careers logic
  const filteredCareers = careers.filter((c) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = (c.description || '').toLowerCase().includes(q);
      const matchCode = (c.code || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCode) return false;
    }
    if (selectedType && c.career_type_id !== Number(selectedType)) return false;
    if (selectedDemand && c.demand_level !== selectedDemand) return false;
    if (selectedEnvironment) {
      const envs = c.work_environments || [];
      if (!envs.some((e) => e.toLowerCase().includes(selectedEnvironment.toLowerCase()))) {
        return false;
      }
    }
    if (user && minMatch > 0) {
      const score = userMatches[c.id]?.match_score || 0;
      if (score < minMatch) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 border border-slate-700 text-xs font-semibold text-blue-400 mb-2">
            <Compass className="w-3.5 h-3.5" /> 152+ Verified Career Tracks
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Career Pathways Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse structured industry roles with standardized competency weights, market benchmarks, and deterministic matching.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="primary"
            size="sm"
            icon={Sparkles}
            onClick={() => setMatcherModalOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-bold"
          >
            Launch Guided Matcher
          </Button>

          {compareIds.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={Scale}
              onClick={() => navigate(`/compare?ids=${compareIds.join(',')}`)}
            >
              Compare ({compareIds.length}) Selected
            </Button>
          )}
        </div>
      </div>

      {/* Multi-facet Filter Controls */}
      <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2">
            <Input
              placeholder="Search by title, code, or skill keyword..."
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sector / Type */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs font-medium bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Career Sectors</option>
              {careerTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Demand Level */}
          <div>
            <select
              value={selectedDemand}
              onChange={(e) => setSelectedDemand(e.target.value)}
              className="w-full text-xs font-medium bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Demand Levels</option>
              <option value="High">High Demand</option>
              <option value="Moderate">Moderate Demand</option>
              <option value="Emerging">Emerging</option>
            </select>
          </div>

          {/* Work Environment */}
          <div>
            <select
              value={selectedEnvironment}
              onChange={(e) => setSelectedEnvironment(e.target.value)}
              className="w-full text-xs font-medium bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Environments</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Office">Office</option>
              <option value="Field Work">Field Work</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Hospital">Hospital</option>
            </select>
          </div>
        </div>

        {/* Minimum Match Filter for logged-in users & Reset button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-300">Minimum Profile Match:</span>
              <input
                type="range"
                min="0"
                max="90"
                step="10"
                value={minMatch}
                onChange={(e) => setMinMatch(Number(e.target.value))}
                className="w-32 accent-indigo-500 cursor-pointer"
              />
              <span className="font-bold text-indigo-400">{minMatch}%+</span>
            </div>
          ) : (
            <span className="text-slate-500 italic">Sign in to filter tracks by your profile match score</span>
          )}

          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              Showing <strong className="text-slate-200">{filteredCareers.length}</strong> of {careers.length} tracks
            </span>
            {(searchQuery || selectedType || selectedDemand || selectedEnvironment || minMatch > 0) && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 underline font-semibold"
              >
                <RotateCcw className="w-3 h-3" /> Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Career Grid */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" label="Loading career catalog..." />
        </div>
      ) : filteredCareers.length === 0 ? (
        <div className="bg-slate-900/60 p-12 rounded-2xl border border-slate-800 text-center space-y-3">
          <h3 className="text-base font-bold text-slate-200">No matching careers found</h3>
          <p className="text-xs text-slate-400">Try adjusting your search query or reset filters.</p>
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCareers.map((c) => {
            const matchObj = userMatches[c.id];
            const isComparing = compareIds.includes(c.id);

            return (
              <Card
                key={c.id}
                hoverEffect
                className={`p-5 flex flex-col justify-between space-y-4 border transition-all ${
                  isComparing ? 'border-indigo-500 bg-indigo-950/20 ring-2 ring-indigo-500/30' : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-slate-400 font-bold">{c.code}</span>
                    <div className="flex items-center gap-1.5">
                      {matchObj && (
                        <span className="text-xs font-black px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                          {Math.round(matchObj.match_score)}% Match
                        </span>
                      )}
                      <Badge variant={c.demand_level === 'High' ? 'green' : 'amber'} size="xs">
                        {c.demand_level}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 tracking-tight">{c.title}</h3>
                  <div className="text-xs text-indigo-400 font-medium mt-0.5">{c.career_type?.name || 'Industry Track'}</div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {c.summary || c.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Salary Benchmark:</span>
                    <span className="font-bold text-slate-200">
                      ₹{((c.salary_range_min || 0) / 100000).toFixed(1)}L - ₹{((c.salary_range_max || 0) / 100000).toFixed(1)}L
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleToggleCompare(c.id)}
                      className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                        isComparing
                          ? 'bg-indigo-950 text-indigo-300 border-indigo-600'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isComparing ? 'text-indigo-400' : 'text-slate-500'}`} />
                      {isComparing ? 'Comparing' : 'Compare'}
                    </button>

                    <Link
                      to={`/careers/${c.id}`}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      View Details <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Comparison Drawer */}
      {compareIds.length >= 2 && (
        <div className="fixed bottom-6 inset-x-0 z-40 max-w-xl mx-auto px-4">
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-indigo-500/50 flex items-center justify-between backdrop-blur-md">
            <div>
              <span className="text-[11px] text-indigo-400 uppercase tracking-wider font-bold block">
                Side-by-Side Matrix Comparison
              </span>
              <span className="text-sm font-bold text-white">{compareIds.length} Careers Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCompareIds([])}
                className="text-xs text-slate-400 hover:text-white px-2 py-1"
              >
                Clear
              </button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/compare?ids=${compareIds.join(',')}`)}
              >
                Compare Now &rarr;
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Guided Matcher Modal */}
      <GuidedCareerFinderModal
        isOpen={matcherModalOpen}
        onClose={() => setMatcherModalOpen(false)}
      />
    </div>
  );
}
