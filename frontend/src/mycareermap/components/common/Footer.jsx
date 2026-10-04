import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Shield, Cpu, Layers, FileText, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sm text-slate-100">MyCareerMap</span>
            </div>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed">
              Deterministic career discovery, skill-gap analysis, and verified recruitment pathways.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <Link to="/careers" className="hover:text-slate-200 transition-colors">
              Career Catalog
            </Link>
            <Link to="/compare" className="hover:text-slate-200 transition-colors">
              Career Comparison
            </Link>
            <Link to="/opportunities" className="hover:text-slate-200 transition-colors">
              Recruitment Pathways
            </Link>
            <Link to="/privacy" className="hover:text-slate-200 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-slate-200 transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} MyCareerMap. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-slate-500" /> Deterministic Backend Engine</span>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-slate-500" /> End-to-End Encryption</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
