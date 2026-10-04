import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Card from '../components/common/Card';

export default function PrivacyPolicyPage() {
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
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-slate-400">Effective Date: October 4, 2026 | Version 1.0</p>
          </div>
        </div>
      </div>

      <Card className="p-6 sm:p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">1. Overview and Scope</h2>
          <p>
            MyCareerMap ("we", "our", or "the Platform") is committed to protecting your personal information and
            maintaining complete transparency regarding data processing. This Privacy Policy details how we collect,
            utilize, store, and safeguard your profile information, academic records, uploaded resumes, and skill
            assessments.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li><strong className="text-slate-200">Account Credentials:</strong> Name, email address, and encrypted authentication tokens.</li>
            <li><strong className="text-slate-200">Educational History:</strong> Completed degrees, institutions, streams, year of completion, and academic scores.</li>
            <li><strong className="text-slate-200">Skill and Competency Data:</strong> Self-reported or extracted technical, professional, and practical competencies with self-assessed proficiency levels.</li>
            <li><strong className="text-slate-200">Resume and Document Text:</strong> Text extracted from uploaded PDF or DOCX files for skill normalization and matching calculation.</li>
            <li><strong className="text-slate-200">Career and Work Preferences:</strong> Preferred work styles (Remote, Hybrid, In-Office), target sectors, and career priorities.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">3. Deterministic Processing and AI Transparency</h2>
          <p>
            Career match percentages and skill-gap calculations on MyCareerMap are generated through deterministic backend
            mathematical scoring models based on exact skill weights, category alignment, education requirements, and work
            style criteria. Resume text extraction uses structured NLP algorithms strictly to identify skills and
            qualifications; uploaded documents are never used to train public models or shared with third-party data brokers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">4. Data Storage and Security</h2>
          <p>
            All network communication is encrypted in transit via Transport Layer Security (TLS 1.3). Passwords are
            hashed using salted bcrypt cryptographic functions. User data is stored in isolated database schemas with strict
            row-level access controls.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">5. User Rights and Data Control</h2>
          <p>
            You retain complete ownership of your data. You may at any time:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Access and export your complete profile and skill data.</li>
            <li>Update, modify, or delete specific skills, educational credentials, and roadmap milestones.</li>
            <li>Request permanent deletion of your account and associated database records.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">6. Third-Party Links and Official Portals</h2>
          <p>
            The Platform provides direct links to verified external recruitment portals, government examination bodies,
            and learning resources. We do not control and are not responsible for the privacy practices or content of
            external third-party websites.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">7. Contact Information</h2>
          <p>
            For privacy inquiries, data deletion requests, or technical support, please contact the administration team at:
            <span className="text-blue-400 font-mono block mt-1">support@mycareermap.org</span>
          </p>
        </section>
      </Card>
    </div>
  );
}
