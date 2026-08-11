import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../hooks/useAccessibility';
import type { FontSize } from '../hooks/useAccessibility';

export const ProfilePage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { 
    fontSize, 
    setFontSize, 
    highContrast, 
    setHighContrast 
  } = useAccessibility();

  // Profile preferences
  const profile = user?.profile;
  const [language, setLanguage] = useState(profile?.preferredLanguage || 'English');
  const [signLanguage, setSignLanguage] = useState(profile?.preferredSignLanguage || 'ISL');
  const [commPreference, setCommPreference] = useState(profile?.communicationPreference || 'text');
  
  // Accessibility Needs lists
  const [needs, setNeeds] = useState<string[]>(profile?.accessibilityNeeds || []);
  
  // Local state managers
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleNeedToggle = (need: string) => {
    // Prevent conflicting settings
    if (need === 'DEAF' && needs.includes('HARD_OF_HEARING')) {
      setError('Cannot select both Deaf and Hard of Hearing simultaneously.');
      return;
    }
    if (need === 'HARD_OF_HEARING' && needs.includes('DEAF')) {
      setError('Cannot select both Deaf and Hard of Hearing simultaneously.');
      return;
    }
    if (need === 'BLIND' && needs.includes('LOW_VISION')) {
      setError('Cannot select both Blind and Low Vision simultaneously.');
      return;
    }
    if (need === 'LOW_VISION' && needs.includes('BLIND')) {
      setError('Cannot select both Blind and Low Vision simultaneously.');
      return;
    }

    setError(null);
    setSuccess(null);
    if (needs.includes(need)) {
      setNeeds(needs.filter((n) => n !== need));
    } else {
      setNeeds([...needs, need]);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Sync local preference storage values with Context
      await updateUserProfile({
        preferredLanguage: language,
        preferredSignLanguage: signLanguage,
        textSizePreference: fontSize,
        highContrastPreference: highContrast,
        communicationPreference: commPreference,
        accessibilityNeeds: needs,
      });

      setSuccess('Profile accessibility preferences updated successfully!');
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile. Please verify your fields.');
    } finally {
      setSaving(false);
    }
  };

  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size);
  };

  const handleContrastChange = (active: boolean) => {
    setHighContrast(active);
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Profile & Settings</h1>
        <p className="text-sm opacity-75">
          Manage your personal account details, configure accessibility needs, and customize font sizing and contrast.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-sm font-semibold text-red-700 dark:text-red-400" role="alert">
          <span>⚠️ {error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 text-sm font-semibold text-green-700 dark:text-green-400" role="status">
          <span>✓ {success}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left/Middle Column: Preferences & Checkboxes */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Section 1: Accessibility Options checkboxes */}
          <fieldset className="card flex flex-col gap-4">
            <legend className="text-lg font-bold mb-2">Accessibility Needs Profile</legend>
            <p className="text-xs opacity-70 mb-2">Select the options that describe your accessibility needs. This helps configure optimal presets.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'DEAF', label: 'Deaf' },
                { key: 'HARD_OF_HEARING', label: 'Hard of Hearing' },
                { key: 'NON_SPEAKING', label: 'Non-speaking' },
                { key: 'BLIND', label: 'Blind' },
                { key: 'LOW_VISION', label: 'Low Vision' },
                { key: 'OTHER', label: 'Other Needs' }
              ].map((item) => (
                <label 
                  key={item.key} 
                  className={`flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                    needs.includes(item.key) 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border bg-bg hover:border-primary'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={needs.includes(item.key)}
                    onChange={() => handleNeedToggle(item.key)}
                    className="w-5 h-5 rounded accent-primary"
                  />
                  <span className="text-sm font-semibold">{item.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Section 2: Preferences dropdowns */}
          <section className="card flex flex-col gap-4">
            <h2 className="text-lg font-bold border-b border-border pb-2">Workspace Preferences</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="flex flex-col gap-1">
                <label htmlFor="pref-lang" className="text-xs font-bold">Preferred Language</label>
                <select
                  id="pref-lang"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="min-h-[40px] px-3 rounded-lg border border-border bg-bg text-text text-sm font-semibold"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Bengali">Bengali</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="pref-sign" className="text-xs font-bold">Preferred Sign Language</label>
                <select
                  id="pref-sign"
                  value={signLanguage}
                  onChange={(e) => setSignLanguage(e.target.value)}
                  className="min-h-[40px] px-3 rounded-lg border border-border bg-bg text-text text-sm font-semibold"
                >
                  <option value="ISL">Indian Sign Language (ISL)</option>
                  <option value="ASL">American Sign Language (ASL)</option>
                  <option value="BSL">British Sign Language (BSL)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="pref-comm" className="text-xs font-bold">Primary Communication Method</label>
                <select
                  id="pref-comm"
                  value={commPreference}
                  onChange={(e) => setCommPreference(e.target.value)}
                  className="min-h-[40px] px-3 rounded-lg border border-border bg-bg text-text text-sm font-semibold"
                >
                  <option value="text">Text Conversational Input</option>
                  <option value="sign">Sign Language Gestures</option>
                  <option value="speech">Spoken Audio Output</option>
                </select>
              </div>

            </div>
          </section>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary min-h-[44px] flex items-center justify-center font-bold text-sm"
          >
            {saving ? 'Saving changes...' : 'Save Settings'}
          </button>
        </div>

        {/* Right Column: Account Meta & Visual Accessibility Controls */}
        <div className="flex flex-col gap-6">
          
          {/* Account information details */}
          <section className="card flex flex-col gap-3">
            <h2 className="text-base font-bold border-b border-border pb-1">Account Summary</h2>
            <ul className="text-xs flex flex-col gap-2 opacity-90">
              <li><strong>Name:</strong> {user?.name}</li>
              <li><strong>Email:</strong> {user?.email}</li>
              <li><strong>Phone:</strong> {user?.phone || 'Not provided'}</li>
              <li><strong>Account Type:</strong> <span className="font-mono font-bold uppercase">{user?.accountType}</span></li>
            </ul>
          </section>

          {/* Interactive Visual controls (Font scaling & contrast) */}
          <section className="card flex flex-col gap-4">
            <h2 className="text-base font-bold border-b border-border pb-1">Visual Settings</h2>
            
            {/* Font scaling selector */}
            <div className="flex flex-col gap-1">
              <label htmlFor="select-fontsize" className="text-xs font-bold">Text Size scaling</label>
              <select
                id="select-fontsize"
                value={fontSize}
                onChange={(e) => handleFontSizeChange(e.target.value as FontSize)}
                className="min-h-[40px] px-2.5 rounded-lg border border-border bg-bg text-text text-xs font-semibold"
              >
                <option value="small">Small scale (85%)</option>
                <option value="normal">Medium scale (Default)</option>
                <option value="large">Large scale (115%)</option>
                <option value="xlarge">Extra Large scale (130%)</option>
              </select>
            </div>

            {/* High Contrast toggle option */}
            <div className="flex flex-col gap-1">
              <label htmlFor="select-contrast" className="text-xs font-bold">High Contrast mode</label>
              <select
                id="select-contrast"
                value={highContrast ? 'true' : 'false'}
                onChange={(e) => handleContrastChange(e.target.value === 'true')}
                className="min-h-[40px] px-2.5 rounded-lg border border-border bg-bg text-text text-xs font-semibold"
              >
                <option value="false">Default colors</option>
                <option value="true">High Contrast (HC)</option>
              </select>
            </div>

          </section>

        </div>

      </form>
    </div>
  );
};
export default ProfilePage;
