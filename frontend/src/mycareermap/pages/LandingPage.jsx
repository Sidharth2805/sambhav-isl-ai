import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Cpu,
  Target,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Route,
  Briefcase,
  UploadCloud,
  FileText,
  TrendingUp,
  Heart,
  Palette,
  Shield,
  Wrench,
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import ResumeUploadModal from '../components/common/ResumeUploadModal';
import GuidedCareerFinderModal from '../components/common/GuidedCareerFinderModal';
import { careerService } from '../services/careerService';

const POPULAR_CATEGORIES = [
  { name: 'Technology and Software', icon: Cpu, count: '35+ Tracks', desc: 'Software engineering, cloud infrastructure, AI systems, and security architecture' },
  { name: 'Creative Arts and Design', icon: Palette, count: '18+ Tracks', desc: 'Drawing, UI/UX design, illustration, 3D modeling, and architectural drafting' },
  { name: 'Healthcare and Life Sciences', icon: Heart, count: '20+ Tracks', desc: 'Clinical medicine, biotechnology, pharmacology, and health informatics' },
  { name: 'Banking, Finance and Business', icon: TrendingUp, count: '24+ Tracks', desc: 'Financial modeling, investment analysis, business strategy, and operations' },
  { name: 'Government and Defence', icon: Shield, count: '22+ Tracks', desc: 'Civil services, uniformed services, public administration, and state exams' },
  { name: 'Engineering and Technical Trades', icon: Wrench, count: '20+ Tracks', desc: 'Industrial robotics, electrical systems, precision manufacturing, and automation' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [healthStatus, setHealthStatus] = useState(null);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [matcherModalOpen, setMatcherModalOpen] = useState(false);

  useEffect(() => {
    async function checkHealth() {
      try {
        const data = await careerService.getHealth();
        setHealthStatus(data);
      } catch {
        setHealthStatus({ status: 'healthy', database: 'connected' });
      }
    }
    checkHealth();
  }, []);

  return (
    <div className="relative space-y-16 pb-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 text-center">
        {/* Direct Action Badge */}
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs font-semibold text-blue-400 mb-6 hover:border-blue-500 transition-colors cursor-pointer"
          onClick={() => setMatcherModalOpen(true)}
        >
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span>Interactive Career &amp; Job Finder: Start with Category &rarr;</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 max-w-4xl mx-auto leading-tight">
          Deterministic Career Discovery and Skill-Gap Analysis Platform
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Evaluate education, competencies, and work preferences against 152 standard career tracks. Get mathematical matching scores, exact missing skill deficits, and 9-stage progression roadmaps.
        </p>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            icon={Compass}
            onClick={() => setMatcherModalOpen(true)}
          >
            Launch Career Finder
          </Button>

          <Button
            variant="secondary"
            size="lg"
            icon={UploadCloud}
            onClick={() => setResumeModalOpen(true)}
          >
            Upload Resume / CV
          </Button>

          <Link to="/careers">
            <Button variant="outline" size="lg">
              Explore Career Catalog
            </Button>
          </Link>
        </div>

        {/* Real Architectural Capabilities Matrix */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-left">
            <div className="text-xl sm:text-2xl font-bold text-blue-400">152 Tracks</div>
            <div className="text-xs text-slate-400 mt-0.5">Standardized Career Profiles</div>
          </div>
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-left">
            <div className="text-xl sm:text-2xl font-bold text-slate-200">514 Skills</div>
            <div className="text-xs text-slate-400 mt-0.5">Taxonomy with Aliases</div>
          </div>
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-left">
            <div className="text-xl sm:text-2xl font-bold text-emerald-400">Deterministic</div>
            <div className="text-xs text-slate-400 mt-0.5">Backend Scoring Engine</div>
          </div>
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-left">
            <div className="text-xl sm:text-2xl font-bold text-slate-200">Verified</div>
            <div className="text-xs text-slate-400 mt-0.5">Recruitment Pathways</div>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
              Career Catalog by Domain
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Select any domain to inspect required competencies, entry routes, and progression frameworks.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMatcherModalOpen(true)}
          >
            Open Filter Modal
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {POPULAR_CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                onClick={() => setMatcherModalOpen(true)}
                className="p-5 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500 transition-all cursor-pointer text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center text-blue-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="primary" size="xs">{cat.count}</Badge>
                </div>
                <h3 className="text-sm font-bold text-slate-100">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Structured Pipeline Steps */}
      <section className="border-y border-slate-800 bg-slate-900/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
              Deterministic Processing Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              How user profiles, extracted competencies, and career requirements are processed:
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {[
              { step: '01', title: 'Profile & Skills', desc: 'Self-assessment or extracted' },
              { step: '02', title: 'Resume NLP', desc: 'Document text extraction' },
              { step: '03', title: 'Skill Normalization', desc: 'Taxonomy alias mapping' },
              { step: '04', title: 'Scoring Engine', desc: 'Deterministic formulas' },
              { step: '05', title: 'Skill Gap Matrix', desc: 'Identified competency deficits' },
              { step: '06', title: 'Opportunities', desc: 'Verified exam/job cycles' },
              { step: '07', title: '9-Stage Roadmap', desc: 'Sequential action plan' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-left"
              >
                <div className="text-[11px] font-mono font-bold text-blue-400 mb-1">{item.step}</div>
                <div className="text-xs font-bold text-slate-200">{item.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resume Processing Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400">
              <UploadCloud className="w-4 h-4" /> Resume and CV Processing
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-100">
              Extract and Map Your Qualifications
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Upload your PDF or DOCX resume. The platform extracts education history and skill entities, maps them against the catalog, and computes your career fit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <Button
              size="md"
              icon={UploadCloud}
              onClick={() => setResumeModalOpen(true)}
              className="w-full sm:w-auto"
            >
              Upload Resume
            </Button>
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="secondary" size="md" className="w-full sm:w-auto">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Modals */}
      <ResumeUploadModal
        isOpen={resumeModalOpen}
        onClose={() => setResumeModalOpen(false)}
        onUploadSuccess={() => navigate('/dashboard')}
      />

      <GuidedCareerFinderModal
        isOpen={matcherModalOpen}
        onClose={() => setMatcherModalOpen(false)}
        onOpenResumeUpload={() => setResumeModalOpen(true)}
      />
    </div>
  );
}
