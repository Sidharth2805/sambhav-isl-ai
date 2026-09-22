export class WebRTCMediaManager {
  private localStream: MediaStream | null = null;
  private audioDevices: MediaDeviceInfo[] = [];
  private videoDevices: MediaDeviceInfo[] = [];
  private speakerDevices: MediaDeviceInfo[] = [];
  private activeAudioDeviceId: string = '';
  private activeVideoDeviceId: string = '';
  private activeSpeakerDeviceId: string = '';

  public async initializeMedia(initialVideo: boolean = true, initialAudio: boolean = true): Promise<MediaStream | null> {
    try {
      await this.enumerateDevices();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      this.localStream = stream;
      this.setAudioEnabled(initialAudio);
      this.setVideoEnabled(initialVideo);

      // Track active device ids
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      if (videoTrack) this.activeVideoDeviceId = videoTrack.getSettings().deviceId || '';
      if (audioTrack) this.activeAudioDeviceId = audioTrack.getSettings().deviceId || '';

      return stream;
    } catch (err) {
      console.warn('[WEBRTC Media] Media capture warning:', err);
      return null;
    }
  }

  public async enumerateDevices(): Promise<{ audio: MediaDeviceInfo[]; video: MediaDeviceInfo[]; speaker: MediaDeviceInfo[] }> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.audioDevices = devices.filter((d) => d.kind === 'audioinput');
      this.videoDevices = devices.filter((d) => d.kind === 'videoinput');
      this.speakerDevices = devices.filter((d) => d.kind === 'audiooutput');
      return { audio: this.audioDevices, video: this.videoDevices, speaker: this.speakerDevices };
    } catch (err) {
      console.warn('[WEBRTC Media] Enumerate devices error:', err);
      return { audio: [], video: [], speaker: [] };
    }
  }

  public setAudioEnabled(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((t) => (t.enabled = enabled));
    }
  }

  public setVideoEnabled(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((t) => (t.enabled = enabled));
    }
  }

  public async switchAudioDevice(deviceId: string): Promise<MediaStreamTrack | null> {
    this.activeAudioDeviceId = deviceId;
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
      });
      const newTrack = newStream.getAudioTracks()[0];
      if (newTrack && this.localStream) {
        const oldTrack = this.localStream.getAudioTracks()[0];
        if (oldTrack) {
          this.localStream.removeTrack(oldTrack);
          oldTrack.stop();
        }
        this.localStream.addTrack(newTrack);
        return newTrack;
      }
    } catch (e) {
      console.warn('[WEBRTC Media] Error switching audio device:', e);
    }
    return null;
  }

  public async switchVideoDevice(deviceId: string): Promise<MediaStreamTrack | null> {
    this.activeVideoDeviceId = deviceId;
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });
      const newTrack = newStream.getVideoTracks()[0];
      if (newTrack && this.localStream) {
        const oldTrack = this.localStream.getVideoTracks()[0];
        if (oldTrack) {
          this.localStream.removeTrack(oldTrack);
          oldTrack.stop();
        }
        this.localStream.addTrack(newTrack);
        return newTrack;
      }
    } catch (e) {
      console.warn('[WEBRTC Media] Error switching video device:', e);
    }
    return null;
  }

  public get stream(): MediaStream | null {
    return this.localStream;
  }

  public get devices() {
    return {
      audio: this.audioDevices,
      video: this.videoDevices,
      speaker: this.speakerDevices,
      activeAudioDeviceId: this.activeAudioDeviceId,
      activeVideoDeviceId: this.activeVideoDeviceId,
      activeSpeakerDeviceId: this.activeSpeakerDeviceId,
    };
  }

  public stopAll() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
  }
}
