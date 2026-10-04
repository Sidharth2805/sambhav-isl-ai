import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Scale, CheckCircle2, ArrowRight, Compass } from 'lucide-react';
import { careerService } from '../services/careerService';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function CareerComparisonPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [allCareers, setAllCareers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load career catalog for selector
  useEffect(() => {
    async function loadCatalog() {
      try {
        const careers = await careerService.getCareers({ limit: 150 });
        setAllCareers(careers);

        const idsParam = searchParams.get('ids');
        if (idsParam) {
          const parsed = idsParam.split(',').map(Number).filter(Boolean);
          if (parsed.length >= 2) {
            setSelectedIds(parsed);
          } else if (parsed.length === 1 && careers.length > 1) {
            setSelectedIds([parsed[0], careers[1].id]);
          }
        } else if (careers.length >= 2) {
          setSelectedIds([careers[0].id, careers[1].id]);
        }
      } catch (err) {
        console.error('Failed to load career catalog', err);
      }
    }
    loadCatalog();
  }, []);

  // Run comparison whenever selectedIds change
  useEffect(() => {
    async function runCompare() {
      if (selectedIds.length < 2) {
        setComparisonData(null);
        return;
      }
      try {
        setLoading(true);
        const data = await careerService.compareCareers(selectedIds);
        setComparisonData(data);
        setSearchParams({ ids: selectedIds.join(',') });
      } catch (err) {
        console.error('Failed to compare careers', err);
      } finally {
        setLoading(false);
      }
    }
    runCompare();
  }, [selectedIds]);

  const handleToggleCareer = (id) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 2) {
        alert('Please keep at least 2 careers selected for comparison.');
        return;
      }
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      if (selectedIds.length >= 4) {
        alert('You can compare up to 4 careers at once.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 border border-slate-700 text-xs font-semibold text-blue-400 mb-2">
            <Scale className="w-3.5 h-3.5" /> Side-by-Side Comparison Matrix
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Objective Career Path Comparison
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Compare skills, market benchmarks, work styles, and profile fit across multiple paths without subjective winner rankings.
          </p>
        </div>

        <Link to="/careers">
          <Button variant="outline" size="sm" icon={Compass}>
            Browse All Tracks
          </Button>
        </Link>
      </div>

      {/* Career Selector Pills */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
          Select Careers to Compare (2 - 4 roles):
        </label>
        <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-2">
          {allCareers.map((c) => {
            const isSelected = selectedIds.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => handleToggleCareer(c.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
                {c.title}
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="py-16 flex justify-center">
          <LoadingSpinner size="lg" label="Generating objective comparison matrix..." />
        </div>
      )}

      {/* Comparison Matrix Table */}
      {!loading && comparisonData && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800">
                  <th className="p-4 font-bold text-slate-400 w-48 sticky left-0 bg-slate-950 z-10">Attribute</th>
                  {comparisonData.careers.map((col) => (
                    <th key={col.career_id} className="p-4 font-bold text-slate-100 border-l border-slate-800">
                      <div className="text-sm sm:text-base">{col.title}</div>
                      <div className="text-xs text-indigo-400 font-normal mt-0.5">{col.category || col.career_type}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {/* Sector / Domain */}
                <tr>
                  <td className="p-4 font-semibold text-slate-400 sticky left-0 bg-slate-900 z-10">Career Sector</td>
                  {comparisonData.careers.map((col) => (
                    <td key={col.career_id} className="p-4 border-l border-slate-800">
                      <Badge variant="indigo">{col.career_type}</Badge>
                    </td>
                  ))}
                </tr>

                {/* Demand Level & Growth */}
                <tr>
                  <td className="p-4 font-semibold text-slate-400 sticky left-0 bg-slate-900 z-10">Market Demand</td>
                  {comparisonData.careers.map((col) => (
                    <td key={col.career_id} className="p-4 border-l border-slate-800">
                      <div className="flex items-center gap-2">
                        <Badge variant={col.demand_level === 'High' ? 'green' : 'amber'}>
                          {col.demand_level} Demand
                        </Badge>
                        <span className="text-xs text-emerald-400 font-medium">{col.growth_rate}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Salary Range */}
                <tr>
                  <td className="p-4 font-semibold text-slate-400 sticky left-0 bg-slate-900 z-10">Salary Benchmark</td>
                  {comparisonData.careers.map((col) => (
                    <td key={col.career_id} className="p-4 border-l border-slate-800 font-bold text-slate-200">
                      ₹{((col.salary_range_min || 0) / 100000).toFixed(1)}L - ₹{((col.salary_range_max || 0) / 100000).toFixed(1)}L / yr
                    </td>
                  ))}
                </tr>

                {/* Education Prerequisites */}
                <tr>
                  <td className="p-4 font-semibold text-slate-400 sticky left-0 bg-slate-900 z-10">Min Education Level</td>
                  {comparisonData.careers.map((col) => (
                    <td key={col.career_id} className="p-4 border-l border-slate-800">
                      {col.required_education_level || 'Undergraduate'}
                    </td>
                  ))}
                </tr>

                {/* Work Environments */}
                <tr>
                  <td className="p-4 font-semibold text-slate-400 sticky left-0 bg-slate-900 z-10">Work Format</td>
                  {comparisonData.careers.map((col) => (
                    <td key={col.career_id} className="p-4 border-l border-slate-800">
                      <div className="flex flex-wrap gap-1">
                        {col.work_environments.map((env, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-300">
                            {env}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Key Skills */}
                <tr>
                  <td className="p-4 font-semibold text-slate-400 sticky left-0 bg-slate-900 z-10">Core Competencies</td>
                  {comparisonData.careers.map((col) => (
                    <td key={col.career_id} className="p-4 border-l border-slate-800">
                      <div className="flex flex-wrap gap-1.5">
                        {col.key_skills.map((sk, i) => (
                          <span key={i} className="text-[11px] px-2 py-0.5 bg-indigo-950/60 text-indigo-300 border border-indigo-900/60 rounded-md">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* User Match Metrics (If Authenticated) */}
                {user && (
                  <>
                    <tr className="bg-indigo-950/20">
                      <td className="p-4 font-bold text-indigo-300 sticky left-0 bg-slate-900 z-10">
                        Profile Match Score
                      </td>
                      {comparisonData.careers.map((col) => (
                        <td key={col.career_id} className="p-4 border-l border-slate-800">
                          {col.match_score !== null ? (
                            <span className="text-lg font-extrabold text-emerald-400">{Math.round(col.match_score)}%</span>
                          ) : (
                            <span className="text-xs text-slate-500">Not computed</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="p-4 font-semibold text-slate-400 sticky left-0 bg-slate-900 z-10">Skill Alignment</td>
                      {comparisonData.careers.map((col) => (
                        <td key={col.career_id} className="p-4 border-l border-slate-800 text-xs font-semibold text-slate-200">
                          {col.skill_score !== null ? `${Math.round(col.skill_score)}%` : '-'}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="p-4 font-semibold text-slate-400 sticky left-0 bg-slate-900 z-10">Eligibility Status</td>
                      {comparisonData.careers.map((col) => (
                        <td key={col.career_id} className="p-4 border-l border-slate-800">
                          {col.eligibility_status ? (
                            <Badge variant={col.eligibility_status === 'eligible' ? 'green' : 'amber'} size="xs">
                              {col.eligibility_status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          ) : '-'}
                        </td>
                      ))}
                    </tr>
                  </>
                )}

                {/* Action Row */}
                <tr>
                  <td className="p-4 font-semibold text-slate-400 sticky left-0 bg-slate-900 z-10">Actions</td>
                  {comparisonData.careers.map((col) => (
                    <td key={col.career_id} className="p-4 border-l border-slate-800">
                      <Link
                        to={`/careers/${col.career_id}`}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                      >
                        View Full Details &rarr;
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Factual Shared Competencies Box */}
          {comparisonData.shared_skills && comparisonData.shared_skills.length > 0 && (
            <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-2xl p-6 space-y-3">
              <h4 className="text-xs uppercase font-bold text-indigo-300 tracking-wider">
                Shared Foundational Competencies
              </h4>
              <p className="text-xs text-slate-300">
                Skills required across all currently selected roles. Mastering these competencies creates transferrable versatility:
              </p>
              <div className="flex flex-wrap gap-2">
                {comparisonData.shared_skills.map((sk, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 bg-slate-900 border border-indigo-700/60 text-indigo-200 rounded-lg font-medium">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
