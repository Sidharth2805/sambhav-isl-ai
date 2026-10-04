import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Compass, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Left side brand banner (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 border-r border-slate-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Compass className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              MyCareerMap
            </span>
          </Link>

          <div className="mt-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-medium text-blue-400 mb-6">
              <Compass className="w-3.5 h-3.5" /> Career Intelligence and Roadmapping
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 sm:text-4xl leading-tight">
              Bridge the gap between education, skills, and real opportunities.
            </h1>
            <p className="mt-4 text-base text-slate-400 leading-relaxed">
              Analyze your profile against industry careers, compute deterministic skill overlaps, and get an actionable progression roadmap.
            </p>

            <div className="mt-8 space-y-3.5">
              {[
                'Deterministic matching engine without blackbox hallucinations',
                'Comprehensive 23-domain relational schema',
                'Dynamic skill gap analysis & actionable roadmaps',
                'Government & industry recruitment pathway integration',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          MyCareerMap &copy; {new Date().getFullYear()} &middot; Step 1 Foundation
        </div>
      </div>

      {/* Right side form container */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-12">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-white">MyCareerMap</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
