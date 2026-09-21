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

    if (stream) {
      video.srcObject = stream;
    } else if (mediaTrack) {
      const ms = new MediaStream([mediaTrack]);
      video.srcObject = ms;
    } else {
      video.srcObject = null;
    }

    video.play().catch(() => {});

    return () => {
      if (video) video.srcObject = null;
    };
  }, [trackRef, track]);

  const isSelfView = props['data-self-view'] === true || props['data-self-view'] === 'true';

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isSelfView}
      data-self-view={isSelfView ? 'true' : undefined}
      data-remote={props['data-remote'] ? 'true' : undefined}
      className={`${className} ${isSelfView ? 'scale-x-[-1]' : ''}`}
      style={style}
    />
  );
};

export default VideoTrack;
