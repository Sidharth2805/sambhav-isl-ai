import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

interface SignAssetDto {
  assetId: string;
  conceptId: string;
  language: string;
  assetType: string;
  assetReference: string;
  durationMs: number;
  version: string;
  status: string;
  source: string;
}

interface SignStepDto {
  sequenceIndex: number;
  conceptId: string;
  displayToken: string;
  durationMs: number;
  confidence: number;
  asset: SignAssetDto | null;
  resolutionStatus: 'FOUND' | 'MISSING' | 'UNSUPPORTED' | 'INVALID';
  sourceConcept: string;
}

interface SignSequenceDto {
  sequenceId: string;
  sourceSessionId: string;
  sourceText: string;
  language: string;
  createdAt: number;
  steps: SignStepDto[];
  totalDurationMs: number;
  overallConfidence: number;
  status: string;
}

interface SignSequencePlayerProps {
  sequence: SignSequenceDto | null;
  onComplete?: () => void;
  onStepStart?: (index: number) => void;
}

export const SignSequencePlayer: React.FC<SignSequencePlayerProps> = ({
  sequence,
  onComplete,
  onStepStart,
}) => {
  const { accessToken } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [signedUrls, setSignedUrls] = useState<Record<number, string>>({});
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unsupportedPauseMs, setUnsupportedPauseMs] = useState<number>(1500);

  // Fetch backend pause configuration on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await apiRequest('/api/communication/sessions/config', 'GET', null, accessToken);
        if (config && typeof config.unsupportedPauseMs === 'number') {
          setUnsupportedPauseMs(config.unsupportedPauseMs);
        }
      } catch (err) {
        console.warn('Failed to load application pause configurations, falling back to 1500ms:', err);
      }
    };
    fetchConfig();
  }, [accessToken]);

  // Fetch all signed URLs for sequence steps on mount/change
  useEffect(() => {
    if (!sequence || !sequence.steps || sequence.steps.length === 0) {
      setSignedUrls({});
      setCurrentStepIndex(-1);
      setIsPlaying(false);
      return;
    }

    const fetchAllUrls = async () => {
      setIsLoading(true);
      setError(null);
      setSignedUrls({});
      setCurrentStepIndex(-1);
      
      const urlsMap: Record<number, string> = {};
      try {
        for (let i = 0; i < sequence.steps.length; i++) {
          const step = sequence.steps[i];
          if (step.resolutionStatus === 'FOUND' && step.asset) {
            try {
              const data = await apiRequest(`/api/isl/assets/${step.asset.assetId}/media`, 'GET', null, accessToken);
              urlsMap[i] = data.signedUrl;
            } catch (err) {
              console.warn(`Failed to resolve media for step index ${i}:`, err);
              urlsMap[i] = ''; // Mark as missing/inaccessible
            }
          } else {
            urlsMap[i] = ''; // Missing/unsupported fallback
          }
        }
        setSignedUrls(urlsMap);
        setCurrentStepIndex(0);
        setIsPlaying(true);
      } catch (err: any) {
        console.error('Failed to load signed media URLs:', err);
        setError('Error loading sequence media clips.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllUrls();
  }, [sequence, accessToken]);

  // Handle step start callbacks
  useEffect(() => {
    if (currentStepIndex >= 0 && onStepStart) {
      onStepStart(currentStepIndex);
    }
  }, [currentStepIndex, onStepStart]);

  // Skip missing/unsupported steps after a configured pause duration
  useEffect(() => {
    if (currentStepIndex === -1 || isLoading || !sequence) return;

    const isStepMissing = !signedUrls[currentStepIndex];
    if (isStepMissing) {
      const timer = setTimeout(() => {
        handleNext();
      }, unsupportedPauseMs);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, signedUrls, isLoading, sequence, unsupportedPauseMs]);

  const handleNext = () => {
    if (!sequence) return;
    if (currentStepIndex + 1 < sequence.steps.length) {
      setCurrentStepIndex((prev) => prev + 1);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      if (onComplete) onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setIsPlaying(true);
    }
  };

  const handleReplay = () => {
    setCurrentStepIndex(0);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((err) => console.log('Replay playback error:', err));
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch((err) => console.log('Toggle play error:', err));
      setIsPlaying(true);
    }
  };

  if (!sequence || sequence.steps.length === 0) {
    return (
      <div className="w-full aspect-video bg-black rounded-lg flex flex-col items-center justify-center text-center p-4">
        <div className="w-12 h-12 rounded-full bg-[#1A237E]/10 border border-[#1A237E]/20 flex items-center justify-center text-xl text-[#00BCD4] animate-pulse select-none mb-2">
          🤖
        </div>
        <h2 className="text-[11px] font-bold text-white uppercase tracking-wide">Signing Avatar Workspace</h2>
        <p className="text-[9px] text-white/60 mt-0.5">Ready for translation sequence streams...</p>
      </div>
    );
  }

  const currentStep = sequence.steps[currentStepIndex];
  const currentUrl = signedUrls[currentStepIndex];
  const isMissing = !currentUrl;

  return (
    <div className="w-full h-full bg-[#1e1e24] flex flex-col relative select-none">
      
      {/* Sequencer Playback Video Display */}
      <div className="flex-grow w-full relative bg-black flex items-center justify-center min-h-0">
        {isLoading ? (
          <div className="text-white text-xs animate-pulse">Loading sign sequences...</div>
        ) : error ? (
          <div className="text-red-400 text-xs p-3 text-center">❌ {error}</div>
        ) : isMissing && currentStep ? (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <span className="text-[#FFD700] text-sm font-black uppercase">⚠️ {currentStep.conceptId}</span>
            <span className="text-white text-[10px] opacity-75 mt-1">Sign asset missing or unverified</span>
          </div>
        ) : currentUrl ? (
          <video
            ref={videoRef}
            src={currentUrl}
            autoPlay={isPlaying}
            onEnded={handleNext}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full h-full object-contain"
            aria-label={`Playing sign step for concept ${currentStep?.conceptId}`}
          >
            <track kind="captions" src="" label="No captions" />
          </video>
        ) : null}

        {/* Top Floating Step Indicator */}
        {currentStep && !isLoading && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-white text-[9px] font-bold flex items-center gap-1.5 z-10">
            <span className="text-[#00BCD4] font-black">{currentStepIndex + 1}/{sequence.steps.length}</span>
            <span className="opacity-80">|</span>
            <span className="uppercase tracking-wider">{currentStep.conceptId}</span>
          </div>
        )}
      </div>

      {/* Control Panel Area */}
      <div className="p-3 bg-[#141419] flex items-center justify-between gap-3 border-t border-white/10 flex-shrink-0">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-white font-bold text-xs truncate uppercase">
            {currentStep?.conceptId || 'No active step'}
          </span>
          <span className="text-[8px] text-white/50">
            Resolution: {currentStep?.resolutionStatus || 'UNKNOWN'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex <= 0}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-bold disabled:opacity-40 disabled:hover:bg-white/5 transition-colors"
          >
            ⏮
          </button>
          
          <button
            onClick={togglePlay}
            disabled={isMissing || isLoading}
            className="px-3 py-1 bg-[#00BCD4] hover:bg-[#0097A7] text-black rounded text-[10px] font-black transition-colors"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          
          <button
            onClick={handleNext}
            disabled={!sequence || currentStepIndex + 1 >= sequence.steps.length}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-bold disabled:opacity-40 disabled:hover:bg-white/5 transition-colors"
          >
            ⏭
          </button>
          
          <button
            onClick={handleReplay}
            disabled={isLoading}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-bold transition-colors"
          >
            🔄
          </button>
        </div>
      </div>
    </div>
  );
};
