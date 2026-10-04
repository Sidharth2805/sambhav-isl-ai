import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 mb-6">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white">404</h1>
      <h2 className="text-xl font-bold text-slate-200 mt-2">Page Not Found</h2>
      <p className="text-sm text-slate-400 max-w-sm mt-1 mb-6">
        The destination or pathway you are looking for does not exist in the platform.
      </p>
      <Link to="/">
        <Button icon={Home} size="sm">
          Return Home
        </Button>
      </Link>
    </div>
  );
}
