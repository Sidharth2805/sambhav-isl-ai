import React, { useRef, useEffect } from 'react';

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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        console.log('[BackgroundVideo] Autoplay initiated or pending user gesture');
      });
    }
  }, [videoSrc]);

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0 ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        poster={posterSrc}
        className="w-full h-full object-cover object-center transform scale-105 filter brightness-90 contrast-105"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Fallback ambient background if video is loading or missing */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#030813] via-[#091326] to-[#040f1a] -z-10" />
    </div>
  );
};

export default BackgroundVideo;
