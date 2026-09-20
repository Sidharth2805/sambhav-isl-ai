import React, { useRef, useState, useEffect, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onCancel: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Check camera devices
  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices().then((devices) => {
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setHasMultipleCameras(videoInputs.length > 1);
    }).catch(() => {});
  }, []);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      setErrorMsg(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setErrorMsg('Unable to access camera. Please ensure camera permissions are granted.');
    }
  }, [cameraFacing]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraFacing]);

  // Capture Snapshot
  const handleSnap = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      onCapture(dataUrl);
    }
    setIsCapturing(false);
  };

  const toggleCameraFacing = () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white rounded-2xl overflow-hidden relative">
      {/* Top Camera Controls */}
      <div className="flex items-center justify-between p-3 bg-black/60 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#fe9832] text-xl">photo_camera</span>
          <span className="text-xs font-bold uppercase tracking-wider">Prescription / Note Scanner</span>
        </div>

        <div className="flex items-center gap-2">
          {hasMultipleCameras && (
            <button
              type="button"
              onClick={toggleCameraFacing}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center cursor-pointer"
              title="Switch Camera"
            >
              <span className="material-symbols-outlined text-lg">flip_camera_ios</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (stream) stream.getTracks().forEach((t) => t.stop());
              onCancel();
            }}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center cursor-pointer"
            title="Close Camera"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </div>

      {/* Viewfinder Frame */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
        {errorMsg ? (
          <div className="p-6 text-center max-w-sm flex flex-col items-center gap-3 text-rose-300">
            <span className="material-symbols-outlined text-4xl text-rose-500">no_photography</span>
            <p className="text-sm font-semibold">{errorMsg}</p>
            <button
              onClick={() => startCamera()}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Retry Camera
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Document / Prescription Framing Overlay */}
            <div className="absolute inset-6 sm:inset-10 border-2 border-dashed border-emerald-400/70 rounded-2xl pointer-events-none flex flex-col justify-between p-4 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
              {/* Corner markers */}
              <div className="flex justify-between items-start">
                <div className="w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
              </div>

              <div className="text-center bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full self-center text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                Align note, letter, document, or prescription inside box
              </div>


              <div className="flex justify-between items-end">
                <div className="w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Shutter Action Bar */}
      <div className="p-4 bg-black/80 backdrop-blur-md flex items-center justify-around z-10">
        <button
          type="button"
          onClick={() => {
            if (stream) stream.getTracks().forEach((t) => t.stop());
            onCancel();
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition cursor-pointer"
        >
          Cancel
        </button>

        {/* Shutter Button */}
        <button
          type="button"
          disabled={!!errorMsg || isCapturing}
          onClick={handleSnap}
          className="w-16 h-16 rounded-full border-4 border-white/80 p-1 flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition shadow-lg shadow-emerald-500/40 cursor-pointer disabled:opacity-40"
          title="Take Snapshot"
        >
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <span className="material-symbols-outlined text-emerald-700 text-2xl">photo_camera</span>
          </div>
        </button>

        <div className="w-16" />
      </div>
    </div>
  );
};
