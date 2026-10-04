import React, { useState } from 'react';
import {
  GitBranch,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code2,
  Star,
  Layers,
  X,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { evidenceService } from '../../services/evidenceService';
import { profileService } from '../../services/profileService';
import Button from './Button';
import Badge from './Badge';
import Card from './Card';
import LoadingSpinner from './LoadingSpinner';

export default function GitHubVerifierModal({ isOpen, onClose, onSkillsVerified }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleScan = async (e) => {
    e?.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError('');
    setScanResult(null);
    setSuccessMessage('');

    try {
      const data = await evidenceService.scanGitHubProfile(username.trim());
      setScanResult(data);
      setSelectedSkills(data.extracted_skills || []);
    } catch (err) {
      setError(err.message || 'Failed to scan GitHub profile. Please check the username.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skillName) => {
    setSelectedSkills((prev) =>
      prev.some((s) => s.name === skillName)
        ? prev.filter((s) => s.name !== skillName)
        : [...prev, scanResult.extracted_skills.find((s) => s.name === skillName)]
    );
  };

  const handleSaveToProfile = async () => {
    if (!scanResult || selectedSkills.length === 0) return;

    setSaving(true);
    setError('');
    try {
      // 1. Save external evidence record
      await evidenceService.addExternalEvidence({
        evidence_type: 'github',
        file_url: `https://github.com/${scanResult.username}`,
        description: `Verified GitHub profile (${scanResult.public_repos} repos, ${scanResult.total_stars} stars, top languages: ${scanResult.top_languages.join(', ')})`,
      });

      // 2. Add each skill to profile
      for (const skill of selectedSkills) {
        try {
          await profileService.addUserSkill({
            skill_id: Date.now() + Math.floor(Math.random() * 1000),
            skill_name: skill.name,
            proficiency_level: skill.proficiency,
            years_of_experience: skill.repoCount >= 3 ? 2.0 : 1.0,
            source: 'github',
            verified: true,
          });
        } catch {
          // Ignore duplicate skill errors
        }
      }

      setSuccessMessage(`Successfully verified and added ${selectedSkills.length} competencies to your profile.`);
      if (onSkillsVerified) {
        onSkillsVerified(selectedSkills);
      }
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err) {
      setError('Failed to save verified evidence. Please ensure you are logged in.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                GitHub Repository &amp; Code Verifier
                <Badge variant="green" size="xs">
                  Live Proof
                </Badge>
              </h3>
              <p className="text-xs text-slate-400">
                Scan public repositories to verify coding competencies and boost evidence confidence.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-lg flex items-center gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-lg flex items-center gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Search Bar */}
          <form onSubmit={handleScan} className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-xs font-mono">
                github.com/
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username (e.g. torvalds, gaearon)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-28 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Search}
              disabled={!username.trim() || loading}
              loading={loading}
            >
              Scan Profile
            </Button>
          </form>

          {/* Loading Indicator */}
          {loading && (
            <div className="py-12 flex justify-center">
              <LoadingSpinner size="md" label="Analyzing repositories, language distributions & commits..." />
            </div>
          )}

          {/* Results Display */}
          {scanResult && !loading && (
            <div className="space-y-4 animate-fade-in">
              {/* Profile Card */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={scanResult.avatar_url}
                    alt={scanResult.name}
                    className="w-11 h-11 rounded-lg border border-slate-700 object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      {scanResult.name}
                      <span className="text-[11px] text-slate-400 font-normal">(@{scanResult.username})</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{scanResult.bio || 'Public Developer'}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                      <span>{scanResult.public_repos} Public Repos</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {scanResult.total_stars} Stars
                      </span>
                    </div>
                  </div>
                </div>

                <a
                  href={`https://github.com/${scanResult.username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-xs text-blue-400 hover:text-blue-300 rounded hover:bg-slate-900 flex items-center gap-1 shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Detected Skills */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Verified Technical Skills ({selectedSkills.length} selected):
                  </h5>
                  <span className="text-[10px] text-slate-400">Click to select/deselect</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {scanResult.extracted_skills.map((skill) => {
                    const isSelected = selectedSkills.some((s) => s.name === skill.name);
                    return (
                      <div
                        key={skill.name}
                        onClick={() => toggleSkill(skill.name)}
                        className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-950/40 border-blue-500/60 ring-1 ring-blue-500/50'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-200">{skill.name}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                          <span className="capitalize">{skill.proficiency}</span>
                          <span>{skill.repoCount} repo{skill.repoCount > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Repositories */}
              <div>
                <h5 className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-blue-400" />
                  Analyzed Codebases:
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {scanResult.repos.map((repo) => (
                    <div
                      key={repo.name}
                      className="p-2.5 rounded-md bg-slate-950 border border-slate-800 text-xs flex flex-col justify-between"
                    >
                      <div>
                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-blue-400 hover:underline flex items-center justify-between"
                        >
                          <span className="truncate">{repo.name}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 ml-1 text-slate-500" />
                        </a>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{repo.description}</p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                        <span className="font-mono text-slate-400">{repo.language || 'Code'}</span>
                        <span>{repo.stars} ★</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-10">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>

          {scanResult && (
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              onClick={handleSaveToProfile}
              disabled={selectedSkills.length === 0 || saving}
              loading={saving}
            >
              Verify &amp; Add {selectedSkills.length} Skills
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
