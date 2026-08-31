import React, { useState, useRef, useCallback, useEffect } from 'react';

interface DraggableCameraWindowProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraActive: boolean;
  className?: string;
}

export const DraggableCameraWindow: React.FC<DraggableCameraWindowProps> = ({
  videoRef,
  cameraActive,
  className = '',
}) => {
  const [position, setPosition] = useState({ x: 12, y: 12 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 12, y: 12 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Initialize camera window docked at top-right corner inside parent camera/avatar area
  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (parent && containerRef.current) {
      const parentW = parent.clientWidth;
      const selfW = containerRef.current.offsetWidth || 160;
      const initialX = Math.max(12, parentW - selfW - 12);
      setPosition({ x: initialX, y: 12 });
    }
  }, []);

  const handlePointerDown = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStartRef.current = { x: clientX, y: clientY };
    initialPosRef.current = { ...position };
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handlePointerDown(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (clientX: number, clientY: number) => {
      const deltaX = clientX - dragStartRef.current.x;
      const deltaY = clientY - dragStartRef.current.y;
      
      const parent = containerRef.current?.parentElement;
      const parentW = parent ? parent.clientWidth : window.innerWidth;
      const parentH = parent ? parent.clientHeight : window.innerHeight;
      const selfW = containerRef.current ? containerRef.current.offsetWidth : 160;
      const selfH = containerRef.current ? containerRef.current.offsetHeight : 120;

      const minX = 8;
      const minY = 8;
      const maxX = Math.max(minX, parentW - selfW - 8);
      const maxY = Math.max(minY, parentH - selfH - 8);

      const calculatedX = initialPosRef.current.x + deltaX;
      const calculatedY = initialPosRef.current.y + deltaY;

      const newX = Math.min(Math.max(minX, calculatedX), maxX);
      const newY = Math.min(Math.max(minY, calculatedY), maxY);

      setPosition({ x: newX, y: newY });
    };

    const handleMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      className={`absolute z-30 w-36 h-28 sm:w-44 sm:h-32 bg-[#0a0f1d] rounded-2xl overflow-hidden border-2 ${
        isDragging ? 'border-[#fe9832] scale-105 shadow-2xl' : 'border-white/25 shadow-xl hover:border-white/50'
      } transition-shadow duration-150 group select-none ${className}`}
    >
      {/* Drag Handle Top Bar */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-black/80 to-transparent z-20 cursor-grab active:cursor-grabbing flex items-center justify-between px-2 text-[10px] font-bold text-white/90"
      >
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px] text-[#fe9832]">drag_indicator</span>
          <span>Reposition</span>
        </span>
        <span className={`w-1.5 h-1.5 rounded-full ${cameraActive ? 'bg-[#8dfc75] animate-pulse' : 'bg-gray-400'}`} />
      </div>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover transform -scale-x-100"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
        <span className="flex items-center gap-1 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded-md backdrop-blur-xs">
          <span>{cameraActive ? 'Camera Live' : 'Off'}</span>
        </span>
      </div>
    </div>
  );
};
