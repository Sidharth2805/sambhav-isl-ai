export interface TroubleshootingStep {
  stepNumber: number;
  question: string;
  options: {
    label: string;
    actionHint?: string;
    isPass: boolean;
  }[];
}

export interface SupportProblem {
  id: string;
  categoryId: string;
  title: string;
  summary: string;
  pipelineStage?: string;
  guidedSteps?: TroubleshootingStep[];
  solution: string[];
  multipleOptions?: {
    title: string;
    description?: string;
    steps: string[];
  }[];
  actionLabel?: string;
  actionRoute?: string;
  actionType?: 'navigate' | 'permission_check' | 'retry';
  keywords: string[];
}

export interface SupportCategory {
  id: string;
  name: string;
  icon: string;
  badge: string;
  color: string;
  isInfoOnly?: boolean;
  description: string;
  problems: SupportProblem[];
}

export const SUPPORT_CATEGORIES: SupportCategory[] = [
  // ---------------------------------------------------------------------------
  // 1. COMMUNICATION & CALLS (HIGHEST PRIORITY)
  // ---------------------------------------------------------------------------
  {
    id: 'communication',
    name: 'Communication & Calls',
    icon: 'video_call',
    badge: 'High Priority',
    color: 'from-red-500/20 to-orange-500/20 border-red-500/30 text-red-500',
    description: 'Instant calls, room codes, audio, video feeds, and WebRTC connection fixes',
    problems: [
      {
        id: 'call-start-failed',
        categoryId: 'communication',
        title: "I can't start a communication session",
        summary: 'Room initialization failed or microphone/camera permissions are currently blocked.',
        guidedSteps: [
          {
            stepNumber: 1,
            question: 'Did your browser ask for Camera and Microphone permissions?',
            options: [
              { label: 'Yes, but I denied it', isPass: false, actionHint: 'Click the padlock icon in the browser URL bar and set Camera & Mic to Allow.' },
              { label: 'Yes, I allowed it', isPass: true },
              { label: 'No prompt appeared', isPass: false, actionHint: 'Check your browser settings to ensure site permissions are not blocked globally.' },
            ],
          },
          {
            stepNumber: 2,
            question: 'Are you connected to the internet?',
            options: [
              { label: 'Yes, internet is active', isPass: true },
              { label: 'No / Unstable', isPass: false, actionHint: 'Please check your Wi-Fi or mobile data connection and try again.' },
            ],
          },
        ],
        multipleOptions: [
          {
            title: 'Option A: Instant Session Reset (In-App)',
            description: 'Generate a fresh WebRTC room code',
            steps: [
              'Navigate to the Communicate page.',
              'Click "Instant Session" to create a fresh 6-character room token.',
              'Wait 5-10 seconds for the cloud media gateway handshake.',
            ],
          },
          {
            title: 'Option B: Browser Media Permissions',
            description: 'Allow camera and microphone access',
            steps: [
              'Click the lock/tune icon on the left of the URL bar.',
              'Ensure Camera and Microphone are toggled to "Allow".',
              'Reload the browser tab.',
            ],
          },
          {
            title: 'Option C: Network & Firewall Check',
            description: 'Ensure WebRTC media traffic is permitted',
            steps: [
              'If connected to a corporate or restricted school network, switch to a mobile hotspot.',
              'Disable third-party VPNs or strict ad-block extensions temporarily.',
            ],
          },
        ],
        solution: [
          'Ensure camera and microphone access is set to "Allow" in your browser address bar.',
          'Verify that you have an active internet connection.',
          'Navigate to the Communicate hub and click "Instant Session" to create a fresh room code.',
          'If the server is waking up from idle, wait 10-15 seconds and try clicking Start again.',
        ],
        actionLabel: 'Open Communication',
        actionRoute: '/communicate',
        keywords: ['start call', 'create room', 'cant start session', 'instant call', 'room error', 'initiate'],
      },
      {
        id: 'call-join-failed',
        categoryId: 'communication',
        title: "I can't join a session",
        summary: 'The room code may be incorrect, expired, or the host may have left.',
        guidedSteps: [
          {
            stepNumber: 1,
            question: 'Did you enter a 6-character room code from your host?',
            options: [
              { label: 'Yes, I typed the code', isPass: true },
              { label: 'No, missing code', isPass: false, actionHint: 'Ask the session host to copy and send you their 6-character code.' },
            ],
          },
          {
            stepNumber: 2,
            question: 'Is the host currently online in the room?',
            options: [
              { label: 'Yes, they are waiting', isPass: true },
              { label: 'Not sure', isPass: false, actionHint: 'Ensure the host has created the session and has not closed the tab.' },
            ],
          },
        ],
        solution: [
          'Verify the 6-character alphanumeric room code with the meeting host.',
          'Ensure there are no extra spaces before or after the code.',
          'Check that camera and microphone permissions are enabled on your device.',
          'Click "Connect" on the Communicate page.',
        ],
        actionLabel: 'Go to Communicate',
        actionRoute: '/communicate',
        keywords: ['join session', 'cant join', 'enter code', 'room not found', 'connect call'],
      },
      {
        id: 'call-code-invalid',
        categoryId: 'communication',
        title: "My room code isn't working",
        summary: 'Room codes are case-insensitive 6-character tokens generated dynamically per call.',
        solution: [
          'Confirm that the host is currently in the active call room.',
          'If more than 15 minutes passed since room creation without connection, ask the host to generate a new instant session code.',
          'Refresh your browser and re-enter the code in the "Join Existing Session" field.',
        ],
        actionLabel: 'Join Session',
        actionRoute: '/communicate',
        keywords: ['room code', 'invalid code', 'code error', 'code not working', 'wrong code'],
      },
      {
        id: 'call-peer-connect-failed',
        categoryId: 'communication',
        title: "I can't connect to the other user",
        summary: 'WebRTC peer handshake timed out or network firewall is restricting UDP/WebSocket traffic.',
        solution: [
          'Ensure both participants have allowed Camera and Microphone permissions.',
          'If on a restricted corporate or school Wi-Fi, try switching to a personal mobile hotspot.',
          'Both participants should refresh their page and re-enter the room code.',
        ],
        actionLabel: 'Reconnect Call',
        actionRoute: '/communicate',
        keywords: ['peer connect', 'cannot connect', 'handshake', 'webrtc failed', 'connecting forever'],
      },
      {
        id: 'call-keeps-reconnecting',
        categoryId: 'communication',
        title: 'The call keeps reconnecting',
        summary: 'High packet loss or temporary bandwidth fluctuations are causing LiveKit SFU renegotiation.',
        solution: [
          'Move closer to your Wi-Fi router or switch from mobile data to broadband.',
          'Close heavy background downloads, streaming apps, or VPN connections.',
          'Click the mic toggle off and on again to stabilize audio throughput.',
        ],
        actionLabel: 'Open Communication',
        actionRoute: '/communicate',
        keywords: ['reconnecting', 'keeps dropping', 'disconnect loop', 'unstable call', 'call drop'],
      },
      {
        id: 'call-disconnected',
        categoryId: 'communication',
        title: 'The call disconnected',
        summary: 'Session lost connection due to network interruption or participant departure.',
        solution: [
          'SAMBHAV holds a 3-minute grace period when a disconnect occurs.',
          'Immediately click "Reconnect" or navigate to Communicate and re-enter the room code.',
          'If the host ended the room, you will need to start a new session.',
        ],
        actionLabel: 'Reconnect Now',
        actionRoute: '/communicate',
        keywords: ['disconnected', 'call ended', 'kicked out', 'lost connection', 'drop'],
      },
      {
        id: 'call-remote-video-blank',
        categoryId: 'communication',
        title: "I can't see the other person's video",
        summary: 'The remote participant has disabled their video or their camera is blocked.',
        solution: [
          'Ask the other participant to verify their camera toggle button is active (not muted).',
          'Ask them to ensure no other desktop app (like Zoom or Teams) is locking their webcam.',
          'Have both participants refresh the browser window.',
        ],
        actionLabel: 'Open Call Screen',
        actionRoute: '/communicate',
        keywords: ['blank video', 'black screen', 'cant see other person', 'video missing', 'no video'],
      },
      {
        id: 'call-remote-audio-silent',
        categoryId: 'communication',
        title: "I can't hear the other person",
        summary: 'Device speaker is muted, wrong output device selected, or other person is muted.',
        guidedSteps: [
          {
            stepNumber: 1,
            question: 'Is your computer / phone volume turned up and unmuted?',
            options: [
              { label: 'Yes, volume is high', isPass: true },
              { label: 'No / It was muted', isPass: false, actionHint: 'Unmute and turn up your device speakers/headphones.' },
            ],
          },
          {
            stepNumber: 2,
            question: 'Is the other person speaking into an active microphone?',
            options: [
              { label: 'Yes, their mic shows active', isPass: true },
              { label: 'Their mic icon is crossed out', isPass: false, actionHint: 'Ask them to click the microphone icon to unmute.' },
            ],
          },
        ],
        solution: [
          'Check your system volume and ensure your headphones/speakers are properly connected.',
          'Confirm that the other participant has unmuted their microphone (green indicator).',
          'If using browser auto-readout, check that the "Auto-Read Out" speaker toggle is enabled.',
        ],
        keywords: ['cant hear', 'no sound', 'silent', 'audio silent', 'speaker', 'hear other person'],
      },
      {
        id: 'call-local-audio-unheard',
        categoryId: 'communication',
        title: "The other person can't hear me",
        summary: 'Your microphone is either muted in-app or blocked by browser permissions.',
        solution: [
          'Click the microphone button in your bottom call controls to ensure it is unmuted (active state).',
          'Click the padlock icon next to the URL bar in Chrome/Edge and confirm Microphone is set to "Allow".',
          'Check Windows / macOS Sound Settings to make sure the correct microphone input device is selected.',
        ],
        keywords: ['other person cant hear', 'mic muted', 'voice not going', 'silent mic'],
      },
      {
        id: 'call-mic-broken',
        categoryId: 'communication',
        title: "My microphone isn't working",
        summary: 'Microphone hardware is busy, permission is denied, or Web Speech API needs a reset.',
        multipleOptions: [
          {
            title: 'Option A: In-App Quick Fix (Easiest)',
            description: 'Reset the speech engine inside the application',
            steps: [
              'Click the "Retry Mic" button in the Translation or Call view.',
              'Ensure the microphone button shows an active orange / green pulse state.',
              'Click the Language dropdown and re-select English (India) or Hindi.',
            ],
          },
          {
            title: 'Option B: Browser Permission Settings',
            description: 'Grant Chrome / Edge microphone permission to Sambhav',
            steps: [
              'Click the Padlock / Tune icon on the left side of the browser address bar.',
              'Locate "Microphone" and switch the toggle from Blocked to "Allow".',
              'Reload the browser page (F5) to apply changes.',
            ],
          },
          {
            title: 'Option C: Windows / Device Sound Settings',
            description: 'Fix microphone input selection on your computer',
            steps: [
              'Close any background apps (Zoom, Microsoft Teams, Discord, Skype) that may lock your microphone.',
              'Open Windows Settings → System → Sound → Input, and verify your microphone is selected as Default Device.',
              'Speak into the microphone and check if the blue volume bar moves under "Test your microphone".',
            ],
          },
        ],
        solution: [
          'Option A: Click "Retry Mic" in the Translate studio to reboot the speech engine.',
          'Option B: Allow microphone permissions via the padlock icon in your browser URL bar.',
          'Option C: Close other calling apps (Zoom, Teams) and check Windows Sound Input settings.',
          'Option D: Use Google Chrome or Microsoft Edge for optimal Web Speech API compatibility.',
        ],
        actionLabel: 'Open Translate Studio',
        actionRoute: '/translate',
        keywords: ['microphone broken', 'mic error', 'mic permission', 'audio input', 'no mic'],
      },
      {
        id: 'call-cam-broken',
        categoryId: 'communication',
        title: "My camera isn't working",
        summary: 'Webcam device is in use by another app or camera permission is blocked.',
        solution: [
          'Close any other software currently utilizing your webcam.',
          'Click the padlock icon in the browser address bar and toggle Camera to "Allow".',
          'Unplug and replug your external webcam if using USB, then refresh the page.',
        ],
        keywords: ['camera broken', 'webcam error', 'camera permission', 'camera not working'],
      },
      {
        id: 'call-video-frozen',
        categoryId: 'communication',
        title: 'My video is frozen',
        summary: 'Hardware video acceleration or momentary network packet drop paused the frame.',
        solution: [
          'Toggle your camera off and back on using the bottom toolbar button.',
          'If the issue persists, refresh the webpage and rejoin the session code.',
          'Ensure your device is not in Battery Saver mode, which may throttle video decoding.',
        ],
        keywords: ['frozen video', 'video stuck', 'video lag', 'camera freeze'],
      },
      {
        id: 'call-audio-breaking',
        categoryId: 'communication',
        title: 'My audio is breaking up',
        summary: 'Network jitter or CPU throttling is causing audio packet loss.',
        solution: [
          'Close bandwidth-heavy applications running in the background.',
          'Wear headphones to prevent audio feedback loop and acoustic echo cancellation stutter.',
          'Move closer to your Wi-Fi access point or switch to an Ethernet/Hotspot connection.',
        ],
        keywords: ['audio breaking', 'robotic voice', 'crackling', 'stutter', 'choppy audio'],
      },
      {
        id: 'call-lagging',
        categoryId: 'communication',
        title: 'The call is lagging',
        summary: 'High round-trip network latency or excessive browser background tabs.',
        solution: [
          'Close extra browser tabs to free up system memory and CPU cycles.',
          'Check that hardware acceleration is enabled in Chrome settings: System → Use hardware acceleration.',
          'Ensure you have a minimum 2 Mbps stable upload and download speed.',
        ],
        keywords: ['call lag', 'delay', 'latency', 'slow call', 'high ping'],
      },
      {
        id: 'call-accidental-leave',
        categoryId: 'communication',
        title: 'I accidentally left the session',
        summary: 'Accidentally closed the browser tab or clicked back button during an active call.',
        solution: [
          'SAMBHAV holds your participant seat for up to 3 minutes during sudden disconnects.',
          'Navigate to Communicate, paste the same 6-character room code, and click "Connect".',
          'You will automatically rejoin the same active room.',
        ],
        actionLabel: 'Rejoin Session',
        actionRoute: '/communicate',
        keywords: ['accidentally left', 'closed tab', 'rejoin', 'back button', 'left call'],
      },
      {
        id: 'call-cannot-end',
        categoryId: 'communication',
        title: "I can't end the session",
        summary: 'Call controls may be hidden or network connection was severed.',
        solution: [
          'Hover your mouse over the bottom of the video call workspace to reveal the call controls.',
          'Click the red "Leave Room" / "End Call" button.',
          'You can also safely close the browser tab or navigate to Dashboard to terminate the WebRTC peer.',
        ],
        actionLabel: 'Go to Dashboard',
        actionRoute: '/dashboard',
        keywords: ['cant end call', 'leave room', 'hang up', 'close call'],
      },
      {
        id: 'call-already-ended',
        categoryId: 'communication',
        title: 'The session says it has already ended',
        summary: 'The host ended the call or all participants disconnected beyond the grace window.',
        solution: [
          'Once all participants leave a room, the room is safely archived and cleaned up.',
          'Ask the host to start a new instant call session and share the new code.',
          'Or click "Instant Session" on Communicate to host a fresh room yourself.',
        ],
        actionLabel: 'Start New Session',
        actionRoute: '/communicate',
        keywords: ['session already ended', 'room expired', 'call finished', 'archived room'],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 2. ISL TRANSLATION & AVATAR (HIGH PRIORITY)
  // ---------------------------------------------------------------------------
  {
    id: 'avatar-isl',
    name: 'ISL Translation & Avatar',
    icon: 'sign_language',
    badge: 'Core Feature',
    color: 'from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-500',
    description: '3D avatar animation, sign sequence generation, gloss matching, and translation sync',
    problems: [
      {
        id: 'avatar-translation-not-appearing',
        categoryId: 'avatar-isl',
        title: "The ISL translation isn't appearing",
        summary: 'The translation pipeline is waiting for confirmed speech or text input.',
        pipelineStage: 'Speech Input → Speech-to-Text → ISL Grammar Analysis → Sign Sequencing → Avatar Rendering',
        guidedSteps: [
          {
            stepNumber: 1,
            question: 'Did your speech get recognized and transcribed into the text box?',
            options: [
              { label: 'Yes, text is visible', isPass: true },
              { label: 'No text appeared', isPass: false, actionHint: 'Check your microphone and click the mic button to start continuous listening.' },
            ],
          },
          {
            stepNumber: 2,
            question: 'Is the Translation mode set to Speech-to-ISL or Text-to-ISL?',
            options: [
              { label: 'Yes, ISL mode active', isPass: true },
              { label: 'Set to ISL-to-Text', isPass: false, actionHint: 'Switch to Speech-to-ISL or Text-to-ISL to see the avatar translate.' },
            ],
          },
        ],
        solution: [
          'In Translate studio, speak clearly or type a sentence into the input box and press Enter.',
          'Ensure the avatar window is not collapsed or minimized.',
          'If typing complex words, try using everyday conversational English/Hindi phrases for instant sign sequence generation.',
        ],
        actionLabel: 'Open Translate Studio',
        actionRoute: '/translate',
        keywords: ['translation not appearing', 'no translation', 'isl missing', 'avatar blank'],
      },
      {
        id: 'avatar-not-showing',
        categoryId: 'avatar-isl',
        title: "The avatar isn't showing",
        summary: 'Avatar rendering container failed to mount or WebGL acceleration is turned off.',
        solution: [
          'Verify WebGL is enabled in your browser: enter "chrome://gpu" in address bar.',
          'Refresh the Translate page to remount the 3D canvas avatar container.',
          'Ensure your device graphics drivers are up to date.',
        ],
        actionLabel: 'Open Translate Page',
        actionRoute: '/translate',
        keywords: ['avatar not showing', 'no avatar', 'black avatar screen', 'canvas error'],
      },
      {
        id: 'avatar-not-playing',
        categoryId: 'avatar-isl',
        title: "The avatar isn't playing",
        summary: 'Avatar sign sequence is in paused state or waiting for next token.',
        solution: [
          'Click the Play/Resume button on the avatar video playback controls.',
          'Type a simple test word like "Hello" or "Thank You" to trigger a fresh animation cycle.',
          'Ensure browser tab is active (background tabs may pause WebGL animations to save power).',
        ],
        actionLabel: 'Try Translation Studio',
        actionRoute: '/translate',
        keywords: ['avatar not playing', 'animation paused', 'stopped playing'],
      },
      {
        id: 'avatar-stuck',
        categoryId: 'avatar-isl',
        title: 'The avatar is stuck',
        summary: 'Sign player encountered an unsupported sign transition or buffer stall.',
        solution: [
          'Click the "Clear" or "Reset" button below the translation output box.',
          'Switch between translation modes (e.g. Speech-to-ISL → Text-to-ISL) to reset player state.',
          'Refresh the page to clear browser memory.',
        ],
        actionLabel: 'Reset Translate Studio',
        actionRoute: '/translate',
        keywords: ['avatar stuck', 'frozen avatar', 'animation freeze', 'avatar hanging'],
      },
      {
        id: 'avatar-sequence-not-loading',
        categoryId: 'avatar-isl',
        title: "The sign sequence isn't loading",
        summary: 'Sign dictionary assets are loading over the network or token gloss was unrecognized.',
        solution: [
          'Check your internet connection to allow downloading verified ISL video/motion clips.',
          'If a word is very rare or specialized, the system will fingerspell it letter-by-letter.',
          'Wait 2-3 seconds for dictionary caching.',
        ],
        actionLabel: 'Go to Learn ISL',
        actionRoute: '/learn-isl',
        keywords: ['sequence not loading', 'sign sequence error', 'gloss not loading'],
      },
      {
        id: 'avatar-partial-signs',
        categoryId: 'avatar-isl',
        title: 'Only some signs are appearing',
        summary: 'Complex compound words are split; recognized words are signed, unfamiliar words fingerspelled.',
        solution: [
          'SAMBHAV automatically falls back to fingerspelling for unrecognized proper nouns (names, places).',
          'Try breaking complex long paragraphs into shorter 3-5 word conversational sentences.',
          'Check the "Learn ISL" dictionary to verify available sign vocabulary.',
        ],
        actionLabel: 'Explore Sign Dictionary',
        actionRoute: '/learn-isl',
        keywords: ['partial signs', 'missing words', 'incomplete translation', 'some words signed'],
      },
      {
        id: 'avatar-sign-unavailable',
        categoryId: 'avatar-isl',
        title: 'A sign is unavailable',
        summary: 'Word is not in the verified standard dictionary and is being represented by alphabetical fingerspelling.',
        solution: [
          'When a specific domain sign is unavailable, SAMBHAV presents the standard ISL alphabet fingerspelling sequence.',
          'You can explore verified sign lessons in the Learn ISL portal.',
          'Submit requests for new sign additions via our Help inquiry form.',
        ],
        actionLabel: 'View Learn ISL',
        actionRoute: '/learn-isl',
        keywords: ['sign unavailable', 'word not found', 'unsupported sign', 'unknown word'],
      },
      {
        id: 'avatar-stopped-midway',
        categoryId: 'avatar-isl',
        title: 'The avatar stopped during translation',
        summary: 'Speech recognition detected a long silence pause or sentence delimiter.',
        solution: [
          'Click the microphone button to resume speaking or click "Translate" for typed text.',
          'Ensure continuous listening indicator (pulsing green soundwave) is active on screen.',
        ],
        keywords: ['stopped midway', 'paused midway', 'avatar stop', 'interrupted'],
      },
      {
        id: 'avatar-translation-delayed',
        categoryId: 'avatar-isl',
        title: 'The translation is delayed',
        summary: 'Natural language parsing waits for sentence completion before generating optimal ISL SOV grammar.',
        solution: [
          'ISL grammar uses Subject-Object-Verb (SOV) order; the AI processes the full clause before rearranging signs.',
          'Slight 1-2 second latency is normal to ensure grammatical correctness rather than literal word-by-word signing.',
        ],
        keywords: ['delayed translation', 'slow translation', 'lag translation', 'timing delay'],
      },
      {
        id: 'avatar-wrong-sign',
        categoryId: 'avatar-isl',
        title: 'The wrong sign appears',
        summary: 'Homonyms (words with multiple meanings, e.g. "bank" financial vs river) resolved by context.',
        solution: [
          'Provide more contextual words in your sentence so the NLP classifier picks the exact contextual sign.',
          'For example, instead of "park", say "walk in the green park" or "park the car".',
        ],
        keywords: ['wrong sign', 'incorrect gesture', 'bad translation', 'wrong meaning'],
      },
      {
        id: 'avatar-sentence-mismatch',
        categoryId: 'avatar-isl',
        title: "The translation doesn't match the spoken sentence",
        summary: 'ISL has a distinct visual grammar (SOV) that differs from English/Hindi word order.',
        solution: [
          'ISL does not translate word-for-word. Helping verbs (is, are, the) are dropped and time markers move to the beginning.',
          'This is standard linguistic behavior for authentic Indian Sign Language.',
        ],
        keywords: ['sentence mismatch', 'grammar difference', 'different word order', 'not matching'],
      },
      {
        id: 'avatar-idle-screen',
        categoryId: 'avatar-isl',
        title: 'The avatar is showing an idle screen',
        summary: 'Avatar is in standby posture waiting for incoming speech or message.',
        solution: [
          'Start speaking into the mic or type a phrase in the chat box to begin signing.',
          'The avatar returns to a relaxed neutral posture whenever no active sentence is being processed.',
        ],
        actionLabel: 'Go to Translate',
        actionRoute: '/translate',
        keywords: ['idle screen', 'avatar resting', 'avatar waiting', 'avatar idle'],
      },
      {
        id: 'avatar-video-not-playing',
        categoryId: 'avatar-isl',
        title: 'The sign video is not playing',
        summary: 'Browser autoplay policy or network connection blocked video playback.',
        solution: [
          'Click anywhere inside the video container to grant browser audio/video user activation.',
          'Check that your browser is not in Data Saver mode.',
        ],
        keywords: ['video not playing', 'sign video error', 'clip stuck'],
      },
      {
        id: 'avatar-stops-midway',
        categoryId: 'avatar-isl',
        title: 'The sign sequence stops midway',
        summary: 'Sequence stream finished the current sentence queue.',
        solution: [
          'Speak or type your next sentence to continue generating signs.',
          'Click "Retry Mic" if speech recognition auto-paused after a long silence.',
        ],
        keywords: ['stops midway', 'sequence cut off', 'finished early'],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 3. SPEECH & TRANSCRIPTION
  // ---------------------------------------------------------------------------
  {
    id: 'speech-transcription',
    name: 'Speech & Transcription',
    icon: 'mic',
    badge: 'Audio / STT',
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-500',
    description: 'Microphone speech detection, voice recognition accuracy, and real-time captioning',
    problems: [
      {
        id: 'stt-speech-not-detected',
        categoryId: 'speech-transcription',
        title: "Speech isn't being detected",
        summary: 'Microphone is either muted, input level is too low, or browser permissions are blocked.',
        guidedSteps: [
          {
            stepNumber: 1,
            question: 'Is the green pulsing soundwave indicator visible when you speak?',
            options: [
              { label: 'Yes, green pulses are visible', isPass: true },
              { label: 'No pulses / Grey badge', isPass: false, actionHint: 'Microphone is not capturing audio. Check physical mic switch and browser permissions.' },
            ],
          },
          {
            stepNumber: 2,
            question: 'Are you using Google Chrome or Microsoft Edge?',
            options: [
              { label: 'Yes, Chrome / Edge', isPass: true },
              { label: 'Other browser (Firefox / Safari)', isPass: false, actionHint: 'Web Speech API works best on Chrome and Edge on desktop and Android.' },
            ],
          },
        ],
        solution: [
          'Click the padlock icon in the browser URL bar and verify Microphone is set to "Allow".',
          'Speak closer to your microphone in a quiet environment.',
          'Click the "Retry Mic" button in the Translation Studio to reboot the speech recognition engine.',
        ],
        actionLabel: 'Test Microphone in Translate',
        actionRoute: '/translate',
        keywords: ['speech not detected', 'no voice detected', 'mic silent', 'no transcript'],
      },
      {
        id: 'stt-not-converting',
        categoryId: 'speech-transcription',
        title: "My speech isn't converting to text",
        summary: 'Web Speech API instance disconnected or network connection to speech servers timed out.',
        solution: [
          'Ensure your internet connection is active (Web Speech API requires active cloud verification in Chrome).',
          'Click the mic toggle off and on once to start a fresh speech recognition session.',
          'Check that your speech language is set to English (India) or Hindi depending on what you speak.',
        ],
        actionLabel: 'Open Translate Studio',
        actionRoute: '/translate',
        keywords: ['not converting to text', 'speech to text failed', 'stt error'],
      },
      {
        id: 'stt-transcript-incorrect',
        categoryId: 'speech-transcription',
        title: 'The transcript is incorrect',
        summary: 'Accent mismatch or background noise affecting speech-to-text acoustic scoring.',
        solution: [
          'In Translate Studio, click the language dropdown and select "English (India) [en-IN]" or "Hindi [hi-IN]".',
          'Speak at a steady, natural conversational pace without rushing.',
          'Reduce background noise such as loud fans, music, or television.',
        ],
        actionLabel: 'Adjust Speech Language',
        actionRoute: '/translate',
        keywords: ['transcript incorrect', 'wrong words', 'misheard', 'accuracy'],
      },
      {
        id: 'stt-transcript-delayed',
        categoryId: 'speech-transcription',
        title: 'The transcript is delayed',
        summary: 'Speech recognition waits for natural pauses to finalize phrase tokens.',
        solution: [
          'The speech engine streams interim results instantly and locks final sentences upon small speech pauses.',
          'Ensure low network latency for real-time speech tokenization.',
        ],
        keywords: ['transcript delayed', 'slow transcript', 'laggy speech'],
      },
      {
        id: 'stt-recognition-stopped',
        categoryId: 'speech-transcription',
        title: 'Speech recognition stopped',
        summary: 'Browsers automatically terminate speech listening after extended periods of silence.',
        solution: [
          'Our automatic recovery engine restarts within 250ms whenever speech stops.',
          'If listening was explicitly stopped, click the microphone button to resume listening.',
          'Click "Retry Mic" if a browser permission prompt temporarily suspended the mic.',
        ],
        actionLabel: 'Go to Translate',
        actionRoute: '/translate',
        keywords: ['speech recognition stopped', 'mic stopped', 'stt ended', 'auto stop'],
      },
      {
        id: 'stt-voice-not-recognized',
        categoryId: 'speech-transcription',
        title: "The system isn't recognizing my voice",
        summary: 'Input microphone volume is too low or wrong input device is selected in Windows/macOS.',
        solution: [
          'Open Windows Settings → Sound → Input, and test your microphone input volume.',
          'If using a headset, check that the hardware mute switch on the cable is off.',
        ],
        keywords: ['voice not recognized', 'cant hear voice', 'voice input error'],
      },
      {
        id: 'stt-wrong-words',
        categoryId: 'speech-transcription',
        title: 'The wrong words are appearing',
        summary: 'Speech recognition model predicted incorrect phonetic match due to ambient echo.',
        solution: [
          'Use headphones with an integrated mic to avoid echo from device speakers.',
          'Select the specific dialect (en-IN vs en-US) matching your pronunciation in the language selector.',
        ],
        actionLabel: 'Open Translate',
        actionRoute: '/translate',
        keywords: ['wrong words appearing', 'mistranscribed', 'typos in transcript'],
      },
      {
        id: 'stt-stopped-updating',
        categoryId: 'speech-transcription',
        title: 'The transcript stopped updating',
        summary: 'Microphone stream was interrupted or tab lost focus.',
        solution: [
          'Click the Microphone button twice (Off → On) in the Translate header to refresh recognition.',
          'Reload the page if your microphone was unplugged and reconnected.',
        ],
        actionLabel: 'Go to Translate',
        actionRoute: '/translate',
        keywords: ['transcript stopped updating', 'stuck transcript', 'frozen mic'],
      },
      {
        id: 'stt-restart-howto',
        categoryId: 'speech-transcription',
        title: 'How do I restart speech recognition?',
        summary: 'Quick guide on toggling and resetting the speech engine.',
        solution: [
          '1. On the Translate page, click the Microphone button in the center control bar.',
          '2. Click it again to start listening (the button will turn orange with a pulsing wave).',
          '3. Alternatively, click the "Retry Mic" banner if an error appears.',
        ],
        actionLabel: 'Go to Translate',
        actionRoute: '/translate',
        keywords: ['restart speech', 'how to restart mic', 'reset recognition'],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 4. NEWS PROBLEMS
  // ---------------------------------------------------------------------------
  {
    id: 'news',
    name: 'News & Information',
    icon: 'newspaper',
    badge: 'Content',
    color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-500',
    description: 'Accessible daily news articles, categories, and synchronized ISL video stories',
    problems: [
      {
        id: 'news-cant-open',
        categoryId: 'news',
        title: "I can't open the News section",
        summary: 'Navigation route issue or browser cache stall.',
        solution: [
          'Click "News" on the left navigation sidebar or open the top hamburger menu on mobile.',
          'You can also directly navigate using the action button below.',
        ],
        actionLabel: 'Open News',
        actionRoute: '/news',
        keywords: ['cant open news', 'open news', 'news missing', 'news link'],
      },
      {
        id: 'news-not-loading',
        categoryId: 'news',
        title: "News isn't loading",
        summary: 'Network connectivity delay while fetching accessibility articles.',
        solution: [
          'Check your internet connection.',
          'Hard refresh the page using Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac).',
        ],
        actionLabel: 'Go to News',
        actionRoute: '/news',
        keywords: ['news not loading', 'news blank', 'empty news'],
      },
      {
        id: 'news-slow',
        categoryId: 'news',
        title: 'News is taking too long to load',
        summary: 'Article images and video thumbnails are loading over a slow connection.',
        solution: [
          'Allow a few seconds for high-resolution educational thumbnails to finish loading.',
          'Ensure you are not on a throttled mobile network.',
        ],
        actionLabel: 'Open News Portal',
        actionRoute: '/news',
        keywords: ['news slow', 'loading long', 'news taking long'],
      },
      {
        id: 'news-content-missing',
        categoryId: 'news',
        title: "News content isn't appearing",
        summary: 'Article summary failed to expand or category filter returned empty list.',
        solution: [
          'Click on the news card title to expand the full summary and key highlights.',
          'Check all categories (Policy & Inclusion, Technology, Community).',
        ],
        actionLabel: 'Browse News',
        actionRoute: '/news',
        keywords: ['news content missing', 'empty article', 'no text in news'],
      },
      {
        id: 'news-how-to-access',
        categoryId: 'news',
        title: 'How do I access News?',
        summary: 'Simple steps to read daily accessibility bulletins.',
        solution: [
          'Click the "News" item with the newspaper icon on your main dashboard sidebar.',
          'Browse featured headlines or filter by topic.',
        ],
        actionLabel: 'Open News',
        actionRoute: '/news',
        keywords: ['how to access news', 'find news', 'where is news'],
      },
      {
        id: 'news-how-to-understand',
        categoryId: 'news',
        title: 'How do I understand a news article?',
        summary: 'Overview of SAMBHAV high-readability simplified news format.',
        solution: [
          'Every article includes: 1) Estimated reading time, 2) Plain-language summary, 3) Key bullet points, and 4) ISL video translation on featured stories.',
        ],
        actionLabel: 'View News Articles',
        actionRoute: '/news',
        keywords: ['understand news', 'simple language news', 'easy news'],
      },
      {
        id: 'news-in-isl',
        categoryId: 'news',
        title: 'Can news be presented using ISL?',
        summary: 'Selected featured articles offer synchronized sign language video summaries.',
        solution: [
          'Yes! Look for articles tagged with the "ISL Video" badge on the News page to watch verified native signers alongside text.',
        ],
        actionLabel: 'Explore News in ISL',
        actionRoute: '/news',
        keywords: ['news in isl', 'sign language news', 'video news'],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 5. ACCOUNT & PROFILE PROBLEMS
  // ---------------------------------------------------------------------------
  {
    id: 'account',
    name: 'Account & Profile',
    icon: 'manage_accounts',
    badge: 'Auth & Profile',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-500',
    description: 'Sign in, registration, password recovery, profile edits, avatars, and accessibility settings',
    problems: [
      {
        id: 'account-cant-login',
        categoryId: 'account',
        title: "I can't log in",
        summary: 'Invalid credentials or server session handshake issue.',
        solution: [
          'Double-check your email address and password for typos (passwords are case-sensitive).',
          'If you forgot your password, click "Forgot Password?" on the login page to receive an OTP reset code.',
          'If the server was idle, allow 20-30 seconds for backend wake-up and try again.',
        ],
        actionLabel: 'Go to Login',
        actionRoute: '/login',
        keywords: ['cant login', 'login error', 'sign in failed', 'invalid credentials'],
      },
      {
        id: 'account-password-invalid',
        categoryId: 'account',
        title: "My password isn't working",
        summary: 'Incorrect password entered.',
        solution: [
          'Click "Forgot Password" on the login screen.',
          'Enter your registered email address to receive an instant verification OTP.',
          'Enter the 6-digit OTP and set a new secure password.',
        ],
        actionLabel: 'Reset Password',
        actionRoute: '/forgot-password',
        keywords: ['password not working', 'forgot password', 'wrong password', 'reset pass'],
      },
      {
        id: 'account-cant-register',
        categoryId: 'account',
        title: "I can't register",
        summary: 'Email already exists or form validation requirements not met.',
        solution: [
          'Ensure your password is at least 8 characters long with a combination of letters and numbers.',
          'If the email is already registered, try logging in or resetting your password.',
        ],
        actionLabel: 'Go to Register',
        actionRoute: '/register',
        keywords: ['cant register', 'signup error', 'create account failed'],
      },
      {
        id: 'account-not-loading',
        categoryId: 'account',
        title: "My account isn't loading",
        summary: 'Account details are synchronizing from the database.',
        solution: [
          'Refresh your browser page. Your session is persisted locally.',
          'Check that your network is stable and not blocking API requests.',
        ],
        actionLabel: 'Open Profile',
        actionRoute: '/profile',
        keywords: ['account not loading', 'user data missing', 'loading user'],
      },
      {
        id: 'account-profile-not-opening',
        categoryId: 'account',
        title: "My profile isn't opening",
        summary: 'Navigation to profile settings page stalled.',
        solution: [
          'Click on your name / avatar card on the sidebar or click the action button below.',
        ],
        actionLabel: 'Open Profile Page',
        actionRoute: '/profile',
        keywords: ['profile not opening', 'cant view profile', 'settings link'],
      },
      {
        id: 'account-cant-update-profile',
        categoryId: 'account',
        title: "I can't update my profile",
        summary: 'Profile modification failed validation or session expired.',
        solution: [
          'Ensure your display name is not empty.',
          'Select your preferred sign language and text size on the Profile page and click "Save Changes".',
        ],
        actionLabel: 'Go to Profile Settings',
        actionRoute: '/profile',
        keywords: ['cant update profile', 'save profile failed', 'edit profile'],
      },
      {
        id: 'account-accessibility-missing',
        categoryId: 'account',
        title: "My accessibility settings aren't appearing",
        summary: 'Accessibility preference panel is located in the Profile & Settings page.',
        solution: [
          'Go to "Profile & Settings" on the left navigation bar.',
          'Scroll to "Accessibility Preferences" to customize High Contrast, Text Size, and Preferred Sign Language.',
        ],
        actionLabel: 'Open Accessibility Settings',
        actionRoute: '/profile',
        keywords: ['accessibility settings', 'high contrast', 'text size', 'preferences'],
      },
      {
        id: 'account-change-preferences',
        categoryId: 'account',
        title: 'How do I change my accessibility preferences?',
        summary: 'Step-by-step customization for themes and font sizes.',
        solution: [
          '1. Navigate to Profile & Settings.',
          '2. Toggle Dark Mode / Light Mode using the theme button in the sidebar or profile.',
          '3. Choose your text size (Standard, Large, Extra Large).',
          '4. Changes take effect across the entire application instantly.',
        ],
        actionLabel: 'Customize Settings',
        actionRoute: '/profile',
        keywords: ['change preferences', 'theme toggle', 'dark mode', 'font size'],
      },
      {
        id: 'account-logged-out-unexpectedly',
        categoryId: 'account',
        title: 'I was logged out unexpectedly',
        summary: 'Session token expired or cross-site cookie was cleared.',
        solution: [
          'Log in again with your credentials. Your session is now saved in local storage to prevent sudden logouts on page refresh.',
        ],
        actionLabel: 'Log In Again',
        actionRoute: '/login',
        keywords: ['logged out', 'unexpected logout', 'kicked to login'],
      },
      {
        id: 'account-session-expired',
        categoryId: 'account',
        title: 'My session expired',
        summary: 'Security tokens automatically refresh, but long inactivity requires re-authentication.',
        solution: [
          'Simply enter your password on the login screen to re-authenticate and continue.',
        ],
        actionLabel: 'Sign In',
        actionRoute: '/login',
        keywords: ['session expired', 'token expired', 'relogin'],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 6. DASHBOARD & APPLICATION PROBLEMS
  // ---------------------------------------------------------------------------
  {
    id: 'dashboard-app',
    name: 'Dashboard & Application',
    icon: 'dashboard',
    badge: 'Navigation',
    color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-500',
    description: 'Dashboard metrics, navigation links, sidebar collapse/expand, and responsive layouts',
    problems: [
      {
        id: 'dash-not-loading',
        categoryId: 'dashboard-app',
        title: "My dashboard isn't loading",
        summary: 'Dashboard shell is waiting for authentication verification.',
        solution: [
          'Ensure you are logged in. The dashboard automatically routes you to the Common or Accessibility dashboard.',
          'Refresh your browser if the loading spinner stays on screen for more than 5 seconds.',
        ],
        actionLabel: 'Go to Dashboard',
        actionRoute: '/dashboard',
        keywords: ['dashboard not loading', 'empty dashboard', 'dashboard blank'],
      },
      {
        id: 'dash-buttons-not-working',
        categoryId: 'dashboard-app',
        title: "Some buttons aren't working",
        summary: 'A modal or overlay may be blocking pointer events or scripts are rehydrating.',
        solution: [
          'Check if an open dialog, call modal, or video player is active.',
          'Refresh the page to reset all interactive event listeners.',
        ],
        keywords: ['buttons not working', 'unclickable', 'button frozen'],
      },
      {
        id: 'dash-page-not-opening',
        categoryId: 'dashboard-app',
        title: "A page isn't opening",
        summary: 'Single Page Application route was refreshed on an older server rule.',
        solution: [
          'We have configured client-side SPA routing across all pages.',
          'Click the desired navigation link on the left sidebar to navigate directly.',
        ],
        actionLabel: 'Return to Dashboard',
        actionRoute: '/dashboard',
        keywords: ['page not opening', 'cant navigate', 'link broken', 'not found error'],
      },
      {
        id: 'dash-missing-items',
        categoryId: 'dashboard-app',
        title: 'Something is missing from my dashboard',
        summary: 'Sidebar may be collapsed into mini icon mode.',
        solution: [
          'Click the 3-line hamburger menu icon at the top of the sidebar to expand labels.',
          'On mobile devices, tap the top-right hamburger icon to open the full navigation menu.',
        ],
        keywords: ['missing items', 'missing links', 'sidebar hidden', 'cant find feature'],
      },
      {
        id: 'dash-behaving-incorrectly',
        categoryId: 'dashboard-app',
        title: 'The application is behaving incorrectly',
        summary: 'Stale browser cache or outdated JavaScript bundle.',
        solution: [
          'Perform a hard refresh: Press Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac).',
          'Clear your browser cookies and site data for sambhav-isl.onrender.com.',
        ],
        keywords: ['behaving incorrectly', 'glitch', 'bug', 'weird behavior'],
      },
      {
        id: 'dash-stuck-loading',
        categoryId: 'dashboard-app',
        title: 'The page is stuck loading',
        summary: 'Network request timed out or backend cold start took longer than expected.',
        solution: [
          'Wait 15-20 seconds if accessing for the first time in a while (Render free-tier cold start).',
          'Refresh the page.',
        ],
        actionLabel: 'Reload Dashboard',
        actionRoute: '/dashboard',
        keywords: ['stuck loading', 'infinite spinner', 'loading forever'],
      },
      {
        id: 'dash-layout-broken',
        categoryId: 'dashboard-app',
        title: 'The application looks broken on my screen',
        summary: 'Browser zoom level is too high or responsive viewport miscalculated.',
        solution: [
          'Reset your browser zoom to 100% by pressing Ctrl + 0 (Windows) or Cmd + 0 (Mac).',
          'Rotate your mobile screen to portrait mode for the optimal vertical layout.',
        ],
        keywords: ['layout broken', 'zoomed in', 'overlapping text', 'css broken'],
      },
      {
        id: 'dash-how-to-navigate',
        categoryId: 'dashboard-app',
        title: 'How do I navigate Sambhav?',
        summary: 'Quick guide on the main app modules and shortcuts.',
        solution: [
          'Use the left sidebar on Desktop (or top menu on Mobile) to switch between:',
          '• Communicate: Two-way WebRTC video calls with live sign translation.',
          '• Translate: Standalone Speech-to-ISL and Text-to-ISL translation studio.',
          '• Learn ISL: Interactive lessons, video courses, and sign dictionary.',
          '• News: Daily accessible news bulletins.',
          '• Profile: Manage your theme, custom avatar, and accessibility preferences.',
        ],
        actionLabel: 'Explore Dashboard',
        actionRoute: '/dashboard',
        keywords: ['how to navigate', 'navigation guide', 'how to use app', 'main menu'],
      },
      {
        id: 'dash-how-to-use-features',
        categoryId: 'dashboard-app',
        title: 'How do I use the main features?',
        summary: 'Comprehensive feature overview for new users.',
        solution: [
          '1. To translate spoken words to signs: Click "Translate" → Speak into microphone.',
          '2. To call a deaf or hearing friend: Click "Communicate" → Start Instant Session → Share code.',
          '3. To learn sign language: Click "Learn ISL" → Pick a lesson series.',
        ],
        actionLabel: 'Open Translate Studio',
        actionRoute: '/translate',
        keywords: ['use features', 'feature tutorial', 'getting started'],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 7. CONNECTION & TECHNICAL PROBLEMS
  // ---------------------------------------------------------------------------
  {
    id: 'technical',
    name: 'Connection & Technical',
    icon: 'wifi_off',
    badge: 'Network & System',
    color: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-500',
    description: 'Server status, WebSocket connections, offline mode, and network diagnostics',
    problems: [
      {
        id: 'tech-cant-connect',
        categoryId: 'technical',
        title: "Sambhav isn't connecting",
        summary: 'Backend server is starting up or device network is offline.',
        solution: [
          'Check your internet connection by opening another website.',
          'Our backend runs on cloud infrastructure; if it was asleep, it may take 20-30 seconds to wake up on first visit.',
          'Refresh your browser and retry.',
        ],
        keywords: ['cant connect', 'server down', 'offline', 'connecting error'],
      },
      {
        id: 'tech-internet-unstable',
        categoryId: 'technical',
        title: 'Internet connection is unstable',
        summary: 'Fluctuating Wi-Fi signal or high latency cellular network.',
        solution: [
          'Switch from 2.4 GHz to 5 GHz Wi-Fi if available.',
          'Disable background torrents, games, or large downloads on your local network.',
          'The Real-time Translation module can function on-device even with low bandwidth.',
        ],
        actionLabel: 'Open Translate Studio',
        actionRoute: '/translate',
        keywords: ['unstable internet', 'slow network', 'packet loss', 'wifi weak'],
      },
      {
        id: 'tech-keeps-reconnecting',
        categoryId: 'technical',
        title: 'The application keeps reconnecting',
        summary: 'WebSocket connection was reset by firewall or ISP.',
        solution: [
          'If using a VPN or proxy, try disconnecting it to allow direct WebSockets.',
          'Ensure your firewall allows outgoing WebSocket traffic on port 443 (WSS).',
        ],
        keywords: ['keeps reconnecting', 'websocket error', 'connection loop'],
      },
      {
        id: 'tech-page-unresponsive',
        categoryId: 'technical',
        title: "The page isn't responding",
        summary: 'High memory usage on the client browser.',
        solution: [
          'Close unused tabs and reload the SAMBHAV page.',
          'Restart your browser (Google Chrome or Microsoft Edge recommended).',
        ],
        keywords: ['page unresponsive', 'browser freeze', 'tab crashed', 'not responding'],
      },
      {
        id: 'tech-app-stuck',
        categoryId: 'technical',
        title: 'The application is stuck',
        summary: 'Component state deadlock or unhandled network failure.',
        solution: [
          'Press F5 or Ctrl + R to perform a fresh reload.',
          'Your session and preferences are safely saved in local storage.',
        ],
        actionLabel: 'Go to Dashboard',
        actionRoute: '/dashboard',
        keywords: ['app stuck', 'hanging', 'frozen screen'],
      },
      {
        id: 'tech-something-not-loading',
        categoryId: 'technical',
        title: "Something isn't loading",
        summary: 'Individual asset or media thumbnail failed to fetch.',
        solution: [
          'Verify your adblocker or privacy extension is not blocking required media scripts.',
          'Reload the specific page.',
        ],
        keywords: ['something not loading', 'asset error', 'media failed'],
      },
      {
        id: 'tech-call-disconnecting',
        categoryId: 'technical',
        title: 'The communication session keeps disconnecting',
        summary: 'WebRTC keep-alive ping timed out.',
        solution: [
          'Ensure both callers remain in active browser tabs.',
          'Do not minimize the browser window for extended periods on mobile devices.',
        ],
        actionLabel: 'Open Communicate',
        actionRoute: '/communicate',
        keywords: ['session keeps disconnecting', 'call drops constantly', 'webrtc timeout'],
      },
      {
        id: 'tech-live-comm-failed',
        categoryId: 'technical',
        title: "Live communication isn't working",
        summary: 'Media server connection failed.',
        solution: [
          'Verify your camera and microphone permissions are granted.',
          'Generate a new room code on the Communicate page.',
          'If issue persists, contact our support helpline below.',
        ],
        actionLabel: 'Go to Communicate',
        actionRoute: '/communicate',
        keywords: ['live communication failed', 'call broken', 'comm failed'],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 8. GENERAL SAMBHAV INFORMATION (SECONDARY / INFO)
  // ---------------------------------------------------------------------------
  {
    id: 'general-info',
    name: 'General Sambhav Info',
    icon: 'info',
    badge: 'Information',
    color: 'from-slate-500/20 to-gray-500/20 border-slate-500/30 text-slate-400',
    isInfoOnly: true,
    description: 'Overview of the platform, features, vision, and accessibility impact',
    problems: [
      {
        id: 'info-what-is-sambhav',
        categoryId: 'general-info',
        title: 'What is Sambhav?',
        summary: 'India\'s AI-powered bi-directional Indian Sign Language accessibility bridge.',
        solution: [
          'SAMBHAV (also known as SignBridge ISL AI) is a digital platform designed to bridge the communication gap between the Deaf/Hard-of-Hearing community and hearing individuals across India through real-time AI translation and 3D avatar gestures.',
        ],
        actionLabel: 'Explore Dashboard',
        actionRoute: '/dashboard',
        keywords: ['what is sambhav', 'about sambhav', 'platform overview', 'mission'],
      },
      {
        id: 'info-features-list',
        categoryId: 'general-info',
        title: 'What features does Sambhav have?',
        summary: 'Complete suite of accessibility, communication, and learning tools.',
        solution: [
          '1. Real-Time Speech-to-ISL and Text-to-ISL Studio with 3D avatar animations.',
          '2. Two-Way Live Video Calls with real-time captioning and sign streaming.',
          '3. Learn ISL Video Academy and interactive gesture dictionary.',
          '4. Cultural ISL: National Anthem (Jana Gana Mana) in ISL.',
          '5. Accessible Daily News portal with sign summaries.',
          '6. High Contrast and Accessibility Personalization profiles.',
        ],
        actionLabel: 'View Dashboard',
        actionRoute: '/dashboard',
        keywords: ['features list', 'what features', 'capabilities', 'all tools'],
      },
      {
        id: 'info-who-can-use',
        categoryId: 'general-info',
        title: 'Who can use Sambhav?',
        summary: 'Built for everyone seeking seamless accessibility.',
        solution: [
          'SAMBHAV is built for Deaf and Hard-of-Hearing individuals, hearing family and friends, special educators, sign language interpreters, healthcare professionals, public service counters, and anyone learning ISL.',
        ],
        keywords: ['who can use', 'target audience', 'eligibility', 'users'],
      },
      {
        id: 'info-accessibility-help',
        categoryId: 'general-info',
        title: 'How does Sambhav help accessibility?',
        summary: 'Empowering independent communication in education, healthcare, and daily life.',
        solution: [
          'By providing instant automated translation without requiring a human interpreter for daily conversations, SAMBHAV fosters self-reliance, emergency communication, inclusive classrooms, and workplace equity.',
        ],
        keywords: ['how helps accessibility', 'impact', 'inclusion', 'empowerment'],
      },
      {
        id: 'info-how-comm-works',
        categoryId: 'general-info',
        title: 'How does the communication system work?',
        summary: 'WebRTC-powered live audio, video, and sign gloss streaming.',
        solution: [
          'Hearing users speak into their microphone; the audio is transcribed and translated into animated signs on the deaf user’s workspace. The deaf user signs or types, and the text is automatically read aloud to the hearing participant.',
        ],
        actionLabel: 'Open Communicate',
        actionRoute: '/communicate',
        keywords: ['how communication works', 'how call works', 'bi directional call'],
      },
      {
        id: 'info-how-avatar-works',
        categoryId: 'general-info',
        title: 'How does the ISL avatar work?',
        summary: 'Natural language grammar parser and 3D sign sequence rendering engine.',
        solution: [
          'Spoken sentences are analyzed for grammar, restructured into ISL Subject-Object-Verb order, mapped to verified sign glossary tokens, and rendered seamlessly through 3D avatar animations and hand gestures.',
        ],
        actionLabel: 'Try Translation Studio',
        actionRoute: '/translate',
        keywords: ['how avatar works', 'avatar technology', 'sign rendering'],
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 9. BASIC ISL INFORMATION (SECONDARY / INFO)
  // ---------------------------------------------------------------------------
  {
    id: 'isl-info',
    name: 'Basic ISL Information',
    icon: 'school',
    badge: 'Linguistics',
    color: 'from-teal-500/20 to-cyan-500/20 border-teal-500/30 text-teal-400',
    isInfoOnly: true,
    description: 'Foundations, linguistic rules, grammar structure, and learning paths for ISL',
    problems: [
      {
        id: 'isl-info-what-is',
        categoryId: 'isl-info',
        title: 'What is Indian Sign Language?',
        summary: 'The formal, visual-spatial language of India\'s Deaf community.',
        solution: [
          'Indian Sign Language (ISL) is a complete visual language with its own distinct grammar, syntax, spatial references, and non-manual facial markers, recognized across India.',
        ],
        actionLabel: 'Go to Learn ISL',
        actionRoute: '/learn-isl',
        keywords: ['what is isl', 'about indian sign language', 'definition of isl'],
      },
      {
        id: 'isl-info-how-works',
        categoryId: 'isl-info',
        title: 'How does ISL work?',
        summary: 'Manual hand gestures, spatial orientation, and facial expressions.',
        solution: [
          'ISL uses handshapes, positions in front of the body, movements, orientations, and facial expressions (eyebrows, mouth movements) to convey complete thoughts and emotions simultaneously.',
        ],
        keywords: ['how isl works', 'handshapes', 'facial markers', 'visual language'],
      },
      {
        id: 'isl-info-why-important',
        categoryId: 'isl-info',
        title: 'Why is ISL important?',
        summary: 'Fundamental human right and mother tongue for millions of deaf Indians.',
        solution: [
          'Over 18 million individuals in India benefit from ISL. It enables equal access to literacy, higher education, employment, legal rights, and social connectivity.',
        ],
        keywords: ['why is isl important', 'importance of isl', 'rights'],
      },
      {
        id: 'isl-info-can-learn',
        categoryId: 'isl-info',
        title: 'Can I learn ISL using Sambhav?',
        summary: 'Curated self-learning courses and verified video series.',
        solution: [
          'Yes! Our "Learn ISL" module offers organized video lessons ranging from basic fingerspelling alphabets and numbers to everyday greetings and conversations.',
        ],
        actionLabel: 'Start Learning ISL',
        actionRoute: '/learn-isl',
        keywords: ['can i learn isl', 'study isl', 'learn sign language'],
      },
      {
        id: 'isl-info-sign-sequence',
        categoryId: 'isl-info',
        title: 'What is an ISL sign sequence?',
        summary: 'The structured chain of sign glosses that form an ISL sentence.',
        solution: [
          'A sign sequence is a series of linked sign gestures arranged in ISL grammatical order (Time → Topic/Subject → Object → Verb → Negation/Question) to express a complete sentence.',
        ],
        actionLabel: 'View Translation Studio',
        actionRoute: '/translate',
        keywords: ['what is sign sequence', 'sign gloss', 'sentence formation'],
      },
    ],
  },
];

// Helper to flatten all problems for search
export const ALL_SUPPORT_PROBLEMS: SupportProblem[] = SUPPORT_CATEGORIES.flatMap((c) => c.problems);

// Quick common problems for top badges
export const MOST_COMMON_PROBLEMS = [
  { id: 'call-mic-broken', label: '🎤 Microphone isn’t working', categoryId: 'communication' },
  { id: 'avatar-not-showing', label: '🤟 Avatar isn’t showing', categoryId: 'avatar-isl' },
  { id: 'stt-speech-not-detected', label: '🗣️ Speech not detected', categoryId: 'speech-transcription' },
  { id: 'tech-keeps-reconnecting', label: '🔄 Connection keeps dropping', categoryId: 'technical' },
  { id: 'call-peer-connect-failed', label: '📹 Video call not connecting', categoryId: 'communication' },
  { id: 'account-password-invalid', label: '🔑 Password reset / Login', categoryId: 'account' },
];

/**
 * Intelligent search function to find problems matching user queries
 */
export function searchSupportProblems(query: string): SupportProblem[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  const queryWords = clean
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const scored = ALL_SUPPORT_PROBLEMS.map((problem) => {
    let score = 0;
    const title = problem.title.toLowerCase();
    const summary = problem.summary.toLowerCase();

    // Exact match in title
    if (title.includes(clean)) score += 50;

    // Exact match in keywords
    if (problem.keywords.some((k) => clean.includes(k.toLowerCase()) || k.toLowerCase().includes(clean))) {
      score += 30;
    }

    // Word matches
    for (const word of queryWords) {
      if (title.includes(word)) score += 10;
      if (summary.includes(word)) score += 5;
      if (problem.keywords.some((k) => k.toLowerCase().includes(word))) score += 8;
    }

    return { problem, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.problem);
}
