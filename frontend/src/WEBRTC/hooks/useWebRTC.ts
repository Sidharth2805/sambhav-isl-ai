/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef, useCallback } from 'react';
import { WebRTCClient } from '../communication/WebRTCClient';
import type { SignalingRole } from '../types/communication';
import { CallConnectionState } from '../types/communication';

export interface UseWebRTCOptions {
  roomId: string;
  role: SignalingRole;
  isCreator: boolean;
  initialVideo?: boolean;
  initialAudio?: boolean;
  onDataMessage?: (data: any) => void;
  onRemoteLeave?: () => void;
}

export function useWebRTC(options: UseWebRTCOptions) {
  const {
    roomId,
    role,
    isCreator,
    initialVideo = true,
    initialAudio = true,
    onDataMessage,
    onRemoteLeave,
  } = options;

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<CallConnectionState>(CallConnectionState.Connecting);
  const [micState, setMicState] = useState<boolean>(initialAudio);
  const [cameraState, setCameraState] = useState<boolean>(initialVideo);
  const [screenShareState, setScreenShareState] = useState<boolean>(false);
  const [remoteLeftNotice, setRemoteLeftNotice] = useState<boolean>(false);

  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [speakerDevices, setSpeakerDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeAudioDeviceId, setActiveAudioDeviceId] = useState<string>('');
  const [activeVideoDeviceId, setActiveVideoDeviceId] = useState<string>('');
  const [activeSpeakerDeviceId, setActiveSpeakerDeviceId] = useState<string>('');

  const clientRef = useRef<WebRTCClient | null>(null);
  const onDataMessageRef = useRef(onDataMessage);
  onDataMessageRef.current = onDataMessage;
  const onRemoteLeaveRef = useRef(onRemoteLeave);
  onRemoteLeaveRef.current = onRemoteLeave;

  useEffect(() => {
    let isCleanedUp = false;

    const client = new WebRTCClient({
      onLocalStream: (stream) => {
        if (!isCleanedUp) setLocalStream(stream);
      },
      onRemoteStream: (stream) => {
        if (!isCleanedUp) {
          setRemoteStream(stream);
          setRemoteLeftNotice(false);
        }
      },
      onConnectionStateChange: (state) => {
        if (!isCleanedUp) setConnectionState(state);
      },
      onDataMessage: (data) => {
        if (onDataMessageRef.current) {
          onDataMessageRef.current(data);
        }
      },
      onRemoteLeave: () => {
        if (!isCleanedUp) {
          setRemoteStream(null);
          setRemoteLeftNotice(true);
        }
        if (onRemoteLeaveRef.current) {
          onRemoteLeaveRef.current();
        }
      },
      onScreenShareChange: (active) => {
        if (!isCleanedUp) setScreenShareState(active);
      },
    });

    clientRef.current = client;

    client
      .start(roomId, role, isCreator, initialVideo, initialAudio)
      .then(() => {
        if (!isCleanedUp) {
          const devs = client.getDevices();
          setAudioDevices(devs.audio);
          setVideoDevices(devs.video);
          setSpeakerDevices(devs.speaker);
          setActiveAudioDeviceId(devs.activeAudioDeviceId);
          setActiveVideoDeviceId(devs.activeVideoDeviceId);
          setActiveSpeakerDeviceId(devs.activeSpeakerDeviceId);
        }
      })
      .catch((e) => {
        console.warn('[WEBRTC Hook] Client start error:', e);
      });

    return () => {
      isCleanedUp = true;
      client.close();
      clientRef.current = null;
    };
  }, [roomId, role, isCreator, initialVideo, initialAudio]);

  const toggleMic = useCallback(async () => {
    if (clientRef.current) {
      const active = await clientRef.current.toggleMic();
      setMicState(active);
      return active;
    }
    return micState;
  }, [micState]);

  const toggleCamera = useCallback(async () => {
    if (clientRef.current) {
      const active = await clientRef.current.toggleCamera();
      setCameraState(active);
      return active;
    }
    return cameraState;
  }, [cameraState]);

  const toggleScreen = useCallback(async () => {
    if (clientRef.current) {
      const active = await clientRef.current.toggleScreenShare();
      setScreenShareState(active);
      return active;
    }
    return screenShareState;
  }, [screenShareState]);

  const switchAudioDevice = useCallback(async (deviceId: string) => {
    setActiveAudioDeviceId(deviceId);
    await clientRef.current?.switchAudioDevice(deviceId);
  }, []);

  const switchVideoDevice = useCallback(async (deviceId: string) => {
    setActiveVideoDeviceId(deviceId);
    await clientRef.current?.switchVideoDevice(deviceId);
  }, []);

  const switchSpeakerDevice = useCallback((deviceId: string) => {
    setActiveSpeakerDeviceId(deviceId);
  }, []);

  const sendAppData = useCallback((payload: Record<string, any>) => {
    clientRef.current?.sendData(payload);
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.close();
    clientRef.current = null;
  }, []);

  return {
    localStream,
    remoteStream,
    connectionState,
    micState,
    cameraState,
    screenShareState,
    remoteLeftNotice,
    audioDevices,
    videoDevices,
    speakerDevices,
    activeAudioDeviceId,
    activeVideoDeviceId,
    activeSpeakerDeviceId,
    toggleMic,
    toggleCamera,
    toggleScreen,
    switchAudioDevice,
    switchVideoDevice,
    switchSpeakerDevice,
    sendAppData,
    disconnect,
  };
}
