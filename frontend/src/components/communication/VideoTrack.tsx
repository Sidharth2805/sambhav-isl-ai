/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from 'react';

export interface VideoTrackProps {
  trackRef?: any;
  track?: MediaStreamTrack | null;
  className?: string;
  style?: React.CSSProperties;
  'data-self-view'?: boolean | string;
  'data-remote'?: boolean | string;
}

export const VideoTrack: React.FC<VideoTrackProps> = ({
  trackRef,
  track,
  className = '',
  style,
  ...props
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isSelfView = props['data-self-view'] === true || props['data-self-view'] === 'true';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let mediaTrack: MediaStreamTrack | null = track || null;
    let stream: MediaStream | null = null;

    if (trackRef instanceof MediaStream) {
      stream = trackRef;
    } else if (trackRef instanceof MediaStreamTrack) {
      mediaTrack = trackRef;
    } else if (trackRef?.mediaStream) {
      stream = trackRef.mediaStream;
    } else if (trackRef?.track?.mediaStreamTrack) {
      mediaTrack = trackRef.track.mediaStreamTrack;
    } else if (trackRef?.publication?.track?.mediaStreamTrack) {
      mediaTrack = trackRef.publication.track.mediaStreamTrack;
    } else if (trackRef?.track) {
      mediaTrack = trackRef.track;
    }

    let targetSrc: MediaStream | null = null;
    if (stream) {
      targetSrc = stream;
    } else if (mediaTrack) {
      targetSrc = new MediaStream([mediaTrack]);
    }

    if (targetSrc) {
      video.srcObject = targetSrc;
      const playVideo = () => {
        if (video && video.srcObject && video.paused) {
          video.play().catch(() => {});
        }
      };

      playVideo();
      video.onloadedmetadata = playVideo;
      video.onloadeddata = playVideo;
      video.oncanplay = playVideo;

      // Handle async track addition and unmute
      targetSrc.onaddtrack = () => {
        if (video) {
          video.srcObject = targetSrc;
          playVideo();
        }
      };

      targetSrc.getVideoTracks().forEach((vt) => {
        vt.onunmute = () => {
          if (video) {
            video.srcObject = targetSrc;
            playVideo();
          }
        };
      });
    } else {
      video.srcObject = null;
    }

    const handleUserInteraction = () => {
      if (video && video.srcObject && video.paused) {
        video.play().catch(() => {});
      }
    };

    window.addEventListener('click', handleUserInteraction, { once: true });
    window.addEventListener('touchstart', handleUserInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      if (video) {
        video.onloadedmetadata = null;
        video.onloadeddata = null;
        video.oncanplay = null;
      }
    };
  }, [trackRef, track]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={true}
      data-self-view={isSelfView ? 'true' : undefined}
      data-remote={props['data-remote'] ? 'true' : undefined}
      className={`${className} ${isSelfView ? 'scale-x-[-1]' : ''}`}
      style={style}
    />
  );
};

export default VideoTrack;
