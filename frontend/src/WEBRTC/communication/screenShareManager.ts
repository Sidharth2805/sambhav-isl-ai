export class WebRTCScreenShareManager {
  private screenStream: MediaStream | null = null;
  private onEndedCallback: (() => void) | null = null;

  public async startScreenShare(onEnded?: () => void): Promise<{ stream: MediaStream; videoTrack: MediaStreamTrack } | null> {
    try {
      this.onEndedCallback = onEnded || null;
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      this.screenStream = stream;
      const videoTrack = stream.getVideoTracks()[0];

      if (videoTrack) {
        videoTrack.onended = () => {
          this.stopScreenShare();
          if (this.onEndedCallback) {
            this.onEndedCallback();
          }
        };
        return { stream, videoTrack };
      }
    } catch (err) {
      console.warn('[WEBRTC Screen] Screen share start cancelled or failed:', err);
    }
    return null;
  }

  public stopScreenShare() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop());
      this.screenStream = null;
    }
  }

  public get isSharing(): boolean {
    return !!this.screenStream && this.screenStream.active;
  }
}
