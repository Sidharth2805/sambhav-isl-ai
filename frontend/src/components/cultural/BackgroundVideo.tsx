import React, { useRef, useEffect, useState } from 'react';

interface BackgroundVideoProps {
  /**
   * Source path for the background video.
   * Easily replaceable: Pass a custom URL/path or update the default fallback.
   */
  videoSrc?: string;
  posterSrc?: string;
  className?: string;
}

export const BackgroundVideo: React.FC<BackgroundVideoProps> = ({
  videoSrc = '/assets/videos/jana_gana_mana_bg.mp4',
  posterSrc,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setVideoLoaded(true);
      }).catch(() => {
        console.log('[BackgroundVideo] Video autoplay fallback active');
      });
    }
  }, [videoSrc]);

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0 ${className}`}>
      
      {/* 1. Animated Indian Flag Tricolor Wave & Ashoka Chakra Canvas/CSS Fallback */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060d1b] via-[#091428] to-[#040914] overflow-hidden">
        
        {/* Animated Tricolor Silk Waves */}
        <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
          {/* Saffron Top Wave */}
          <div className="absolute -top-32 left-0 right-0 h-96 bg-gradient-to-b from-[#ff9933]/60 via-[#ff9933]/30 to-transparent blur-3xl animate-pulse" />
          
          {/* White Center Glow */}
          <div className="absolute top-1/3 left-0 right-0 h-64 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-2xl transform -skew-y-3" />

          {/* India Green Bottom Wave */}
          <div className="absolute -bottom-32 left-0 right-0 h-96 bg-gradient-to-t from-[#138808]/60 via-[#138808]/30 to-transparent blur-3xl animate-pulse" />
        </div>

        {/* Floating Ashoka Chakra 24-Spoke Watermark Motif */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 sm:w-[500px] sm:h-[500px] rounded-full border border-blue-400/10 flex items-center justify-center pointer-events-none animate-spin-slow opacity-25">
          <div className="w-full h-full rounded-full border-2 border-blue-500/20 flex items-center justify-center relative">
            {/* 24 Spokes */}
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-[1px] bg-blue-400/20"
                style={{ transform: `rotate(${i * 15}deg)` }}
              />
            ))}
            <div className="w-16 h-16 rounded-full border-2 border-blue-400/30" />
          </div>
        </div>

        {/* Floating Light Sparkles */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-15" />
      </div>

      {/* 2. Replaceable HTML5 Video Element */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        poster={posterSrc}
        onLoadedData={() => setVideoLoaded(true)}
        className={`w-full h-full object-cover object-center transform scale-105 filter brightness-90 contrast-105 transition-opacity duration-1000 ${
          videoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    </div>
  );
};

export default BackgroundVideo;
