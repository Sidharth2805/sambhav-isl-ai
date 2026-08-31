import React from 'react';

interface DarkOverlayProps {
  className?: string;
  children?: React.ReactNode;
}

export const DarkOverlay: React.FC<DarkOverlayProps> = ({
  className = '',
  children,
}) => {
  return (
    <div className={`absolute inset-0 w-full h-full pointer-events-none z-1 ${className}`}>
      {/* Primary Cinematic Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030813]/90 via-[#030813]/80 to-[#030813]/95 backdrop-blur-[2px]" />

      {/* Radial Focus Spotlight Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(3,8,19,0.85)_100%)]" />

      {/* Subtle Indian Tricolor Ambient Header Glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff9933] via-white to-[#138808] opacity-80" />

      {/* Decorative Floating Ambient Soft Glow Orbs */}
      <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-[#fe9832]/10 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-[#138808]/10 blur-[120px]" />

      {children}
    </div>
  );
};

export default DarkOverlay;
