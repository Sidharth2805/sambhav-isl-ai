import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Scale, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';
import Card from '../components/common/Card';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-500">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">Terms and Conditions</h1>
            <p className="text-xs text-slate-400">Effective Date: October 4, 2026 | Version 1.0</p>
          </div>
        </div>
      </div>

      <Card className="p-6 sm:p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">1. Acceptance of Terms</h2>
          <p>
            By accessing or using MyCareerMap ("the Platform"), you agree to be bound by these Terms and Conditions and
            our Privacy Policy. If you do not agree with any part of these terms, you must not use the Platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">2. Description of Service</h2>
          <p>
            MyCareerMap provides deterministic career matching calculations, skill-gap analysis, personalized progression
            roadmaps, and cataloged recruitment pathway information. All match scores and recommendations are advisory tools
            designed to assist users in educational and professional planning.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">3. User Responsibilities and Accounts</h2>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>You agree to provide accurate, current, and truthful information during profile setup and skill self-assessment.</li>
            <li>You are responsible for maintaining the confidentiality of your authentication credentials.</li>
            <li>You agree not to upload malicious files, copyrighted materials without authorization, or automated scraping scripts.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">4. Recruitment and Opportunity Information Disclaimer</h2>
          <p>
            While MyCareerMap catalogs official recruitment cycles, examination dates, and industry opportunities from
            verified sources, eligibility rules, cutoff marks, and deadlines are determined solely by the respective conducting
            authorities and employers. Users must verify all critical notifications on the official issuing organization portal.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">5. Intellectual Property</h2>
          <p>
            The software architecture, deterministic matching algorithms, taxonomy definitions, and user interface designs
            are the proprietary property of MyCareerMap. Users retain full ownership of their personal resumes, profile
            submissions, and self-authored portfolio data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">6. Limitation of Liability</h2>
          <p>
            MyCareerMap and its maintainers shall not be liable for any direct, indirect, incidental, or consequential damages
            resulting from reliance on career recommendations, roadmap milestones, or recruitment cycle changes announced by
            third-party examination boards or employers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">7. Modifications to Terms</h2>
          <p>
            We reserve the right to revise these terms at any time. Continued use of the platform following any modifications
            constitutes your acceptance of the updated terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">8. Contact Information</h2>
          <p>
            Questions regarding these Terms and Conditions should be directed to:
            <span className="text-blue-400 font-mono block mt-1">legal@mycareermap.org</span>
          </p>
        </section>
      </Card>
    </div>
  );
}
