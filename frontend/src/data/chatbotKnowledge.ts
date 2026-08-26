export interface ChatQuestion {
  id: string;
  question: string;
  answer: string;
  actionLabel?: string;
  actionRoute?: string;
  keywords?: string[];
}

export interface ChatTopic {
  id: string;
  name: string;
  icon: string;
  description: string;
  questions: ChatQuestion[];
}

export const CHATBOT_TOPICS: ChatTopic[] = [
  {
    id: 'isl-accessibility',
    name: 'ISL & Accessibility',
    icon: 'accessibility_new',
    description: 'Learn about Indian Sign Language and accessibility features',
    questions: [
      {
        id: 'isl-what-is',
        question: 'What is Indian Sign Language?',
        answer: 'Indian Sign Language (ISL) is the natural, complete visual-spatial language used by the Deaf community across India. It has its own unique grammar, syntax, hand gestures, facial expressions, and spatial reference systems distinct from spoken languages like English or Hindi.',
        keywords: ['what', 'isl', 'indian sign language', 'definition', 'language', 'basics'],
      },
      {
        id: 'isl-avatar-work',
        question: 'How does the ISL avatar work?',
        answer: 'The SAMBHAV ISL avatar converts spoken or written text into verified sign language animations in real-time. It analyzes grammar, breaks text into semantic sign glosses, and smoothly renders the corresponding 3D gestures and facial cues to facilitate seamless communication.',
        actionLabel: 'Try Translation Studio',
        actionRoute: '/translate',
        keywords: ['avatar', '3d', 'how it works', 'animation', 'render', 'conversion'],
      },
      {
        id: 'isl-importance',
        question: 'Why is Indian Sign Language important?',
        answer: 'ISL is essential for ensuring constitutional equity, educational access, and social inclusion for over 18 million deaf and hard-of-hearing individuals in India. It empowers independent communication in education, healthcare, workplaces, and public governance.',
        keywords: ['importance', 'why', 'significance', 'inclusion', 'rights', 'deaf community'],
      },
      {
        id: 'isl-who-can-use',
        question: 'Who can use Sambhav?',
        answer: 'SAMBHAV is designed for everyone: deaf & hard-of-hearing individuals, hearing friends & family, educators, interpreters, doctors, workplace colleagues, and anyone passionate about learning and bridging communication gaps with ISL.',
        actionLabel: 'Explore Dashboard',
        actionRoute: '/dashboard',
        keywords: ['who', 'users', 'audience', 'sambhav', 'eligibility', 'everyone'],
      },
      {
        id: 'isl-signbridge-help',
        question: 'How does SignBridge help deaf or hard-of-hearing users?',
        answer: 'SignBridge provides bi-directional communication: it translates spoken voice from hearing callers into instant ISL video/avatar signs for deaf users, and converts signs or quick text from deaf users into spoken synthesized audio.',
        actionLabel: 'Start Communication Call',
        actionRoute: '/communicate',
        keywords: ['help', 'signbridge', 'benefit', 'hearing', 'deaf', 'call'],
      },
      {
        id: 'isl-diff-spoken',
        question: 'What is the difference between spoken language and ISL?',
        answer: 'Spoken languages rely on auditory-vocal channels and linear word order (e.g., Subject-Verb-Object). ISL is a visual-spatial language with its own rich grammar (often Subject-Object-Verb or Topic-Comment), utilizing simultaneous manual signs, body posture, and non-manual facial markers.',
        keywords: ['difference', 'spoken', 'comparison', 'grammar', 'visual', 'auditory'],
      },
    ],
  },
  {
    id: 'learn-isl',
    name: 'Learn ISL',
    icon: 'school',
    description: 'Explore sign tutorials, lessons, and interactive practice',
    questions: [
      {
        id: 'learn-can-i',
        question: 'Can I learn ISL using Sambhav?',
        answer: 'Yes! SAMBHAV includes a dedicated Learn ISL module featuring curated categories (Alphabets, Numbers, Daily Greetings, Emergency Signs, and Cultural signs) with high-definition video demonstrations and practice quizzes.',
        actionLabel: 'Go to Learn ISL',
        actionRoute: '/learn-isl',
        keywords: ['can i learn', 'study', 'education', 'learning', 'courses'],
      },
      {
        id: 'learn-how-start',
        question: 'How can I start learning ISL?',
        answer: 'Start by visiting our "Learn ISL" page. We recommend beginning with the ISL Fingerspelling Alphabets (A-Z) and Number signs (0-9), followed by Common Everyday Greetings before progressing to conversational sentences.',
        actionLabel: 'Start Learning Now',
        actionRoute: '/learn-isl',
        keywords: ['start', 'how to begin', 'first steps', 'alphabets', 'basics'],
      },
      {
        id: 'learn-resources',
        question: 'Does Sambhav provide ISL learning resources?',
        answer: 'Yes. You have access to verified video libraries, category filters, interactive sign search, practice modes, and real-time translation tools to test your signing skills.',
        actionLabel: 'View ISL Resources',
        actionRoute: '/learn-isl',
        keywords: ['resources', 'dictionary', 'videos', 'materials', 'library'],
      },
      {
        id: 'learn-beginners',
        question: 'Can beginners use the platform?',
        answer: 'Absolutely. SAMBHAV is built with intuitive visual guides, adjustable playback speeds, high contrast settings, and step-by-step breakdowns designed specifically for complete beginners.',
        actionLabel: 'Browse Lessons',
        actionRoute: '/learn-isl',
        keywords: ['beginners', 'easy', 'newbie', 'starter', 'starting out'],
      },
      {
        id: 'learn-avatar-help',
        question: 'How does the avatar help me understand signs?',
        answer: 'The avatar lets you view signs from multiple angles, pause motion, and observe exact hand shapes and finger placements, making it much easier to practice and master complex signing movements.',
        actionLabel: 'Try Translation Studio',
        actionRoute: '/translate',
        keywords: ['avatar help', 'understand signs', 'angles', 'motion', 'practice'],
      },
    ],
  },
  {
    id: 'national-culture',
    name: 'National & Culture',
    icon: 'flag',
    description: 'National Anthem, Vande Mataram, and Indian cultural heritage in ISL',
    questions: [
      {
        id: 'culture-jana-gana-what',
        question: 'What is Jana Gana Mana?',
        answer: 'Jana Gana Mana is the National Anthem of India, originally composed in Bengali by Nobel laureate Rabindranath Tagore. It celebrates the geographic and cultural diversity of India and unites all citizens under a common patriotic spirit.',
        keywords: ['jana gana mana', 'national anthem', 'tagore', 'india', 'anthem'],
      },
      {
        id: 'culture-vande-mataram-what',
        question: 'Tell me about Vande Mataram',
        answer: 'Vande Mataram is the National Song of India, composed by Bankim Chandra Chatterjee in 1882. It played a pivotal role in the Indian Independence Movement, inspiring millions as an ode to the Motherland.',
        keywords: ['vande mataram', 'national song', 'bankim', 'history', 'patriotism'],
      },
      {
        id: 'culture-jana-gana-isl',
        question: 'Show Jana Gana Mana in ISL',
        answer: 'Explore our dedicated Cultural ISL module to experience the Indian National Anthem "Jana Gana Mana" translated into Indian Sign Language with verified stanza-by-stanza gestures and national motifs.',
        actionLabel: 'View Jana Gana Mana in ISL',
        actionRoute: '/cultural-isl',
        keywords: ['show jana gana mana', 'anthem in isl', 'national anthem sign', 'video'],
      },
      {
        id: 'culture-vande-mataram-isl',
        question: 'Show Vande Mataram in ISL',
        answer: 'Experience the National Song "Vande Mataram" in Indian Sign Language on our Cultural ISL page, showcasing expressive gestures honoring the Motherland.',
        actionLabel: 'View Vande Mataram in ISL',
        actionRoute: '/cultural-isl',
        keywords: ['show vande mataram', 'national song sign', 'vande mataram in isl'],
      },
      {
        id: 'culture-anthem-importance',
        question: 'What is the importance of the Indian National Anthem?',
        answer: 'Jana Gana Mana embodies the unity, sovereignty, and rich pluralism of India. Presenting it in ISL guarantees that every deaf citizen can participate in national celebrations with dignity and pride.',
        keywords: ['importance of anthem', 'significance', 'national pride', 'unity'],
      },
      {
        id: 'culture-vande-importance',
        question: 'What is the cultural importance of Vande Mataram?',
        answer: 'Vande Mataram symbolizes sacrifice, devotion, and collective identity. Sign language renditions bring its poetic devotion alive for the deaf community across the nation.',
        keywords: ['importance of vande mataram', 'culture', 'heritage', 'devotion'],
      },
    ],
  },
  {
    id: 'news-info',
    name: 'News & Information',
    icon: 'newspaper',
    description: 'Accessible daily news, policy updates, and community bulletins',
    questions: [
      {
        id: 'news-today',
        question: "Show me today's news",
        answer: 'You can read top national, policy, technology, and community accessibility headlines on our dedicated News page, updated regularly with easy-to-read summaries.',
        actionLabel: 'Go to News',
        actionRoute: '/news',
        keywords: ['today news', 'latest news', 'headlines', 'updates', 'current events'],
      },
      {
        id: 'news-simple-language',
        question: 'How can I understand news in simple language?',
        answer: 'Our News section presents complex reports in simplified, high-readability language with highlighted bullet points, clear timestamps, and visual category tags.',
        actionLabel: 'Go to News',
        actionRoute: '/news',
        keywords: ['simple language', 'easy news', 'readability', 'summaries'],
      },
      {
        id: 'news-in-isl',
        question: 'Show this news in ISL',
        answer: 'Selected news articles feature synchronized ISL translation videos so you can watch stories signed by verified native signers alongside text captions.',
        actionLabel: 'Go to News',
        actionRoute: '/news',
        keywords: ['news in isl', 'sign language news', 'video news', 'isl bulletin'],
      },
      {
        id: 'news-how-works',
        question: 'How does the news section work?',
        answer: 'The News section aggregates verified accessibility, disability rights, education, and technology stories, formatting each with key summaries and reading time estimates.',
        actionLabel: 'Go to News',
        actionRoute: '/news',
        keywords: ['how news works', 'feed', 'articles', 'curation'],
      },
      {
        id: 'news-categories',
        question: 'Can I access different categories of news?',
        answer: 'Yes! You can explore articles across Policy & Inclusion, Assistive Technology, Community Events, and Education.',
        actionLabel: 'Go to News',
        actionRoute: '/news',
        keywords: ['categories', 'topics', 'policy', 'technology', 'events'],
      },
    ],
  },
  {
    id: 'help-guide',
    name: 'Help & App Guide',
    icon: 'help',
    description: 'Step-by-step guides for calls, translation, audio, and settings',
    questions: [
      {
        id: 'help-use-avatar',
        question: 'How do I use the ISL avatar?',
        answer: 'Go to the "Translate" page, select "Speech-to-ISL" or "Text-to-ISL", click the microphone or type your sentence, and watch the avatar translate your input in real-time.',
        actionLabel: 'Go to Translate',
        actionRoute: '/translate',
        keywords: ['use avatar', 'how to translate', 'translate page', 'avatar instructions'],
      },
      {
        id: 'help-access-news',
        question: 'How do I access the news section?',
        answer: 'Click "News" on the left navigation sidebar (or top menu on mobile) to view the latest accessibility stories and video updates.',
        actionLabel: 'Go to News',
        actionRoute: '/news',
        keywords: ['access news', 'find news', 'open news'],
      },
      {
        id: 'help-features-list',
        question: 'What features does Sambhav have?',
        answer: 'SAMBHAV includes: 1) Real-time Speech-to-ISL Translation, 2) Two-way Live Video Calling with sign streaming, 3) Learn ISL Dictionary, 4) Accessible News, 5) Cultural ISL Anthems, and 6) High-contrast accessibility settings.',
        actionLabel: 'Explore Dashboard',
        actionRoute: '/dashboard',
        keywords: ['features', 'capabilities', 'what can sambhav do', 'all features'],
      },
      {
        id: 'help-start-call',
        question: 'How do I start a communication session?',
        answer: 'Navigate to "Communicate", choose "Instant Session", copy the generated Room Code, and share it with your participant to begin a live video call.',
        actionLabel: 'Start Call',
        actionRoute: '/communicate',
        keywords: ['start session', 'start call', 'create room', 'instant call'],
      },
      {
        id: 'help-join-code',
        question: 'How do I join a session using a code?',
        answer: 'Go to the "Communicate" page, enter the 6-character room code provided by your host in the "Join Existing Session" input, and click "Connect".',
        actionLabel: 'Join Session',
        actionRoute: '/communicate',
        keywords: ['join call', 'room code', 'join session', 'enter code'],
      },
      {
        id: 'help-enable-cam-mic',
        question: 'How do I enable my camera and microphone?',
        answer: 'When prompted by your browser, click "Allow" for Camera & Microphone permissions. If previously blocked, click the padlock/tune icon on the left of your browser address bar and enable permissions.',
        keywords: ['enable camera', 'enable microphone', 'permissions', 'allow mic'],
      },
      {
        id: 'help-cam-not-working',
        question: 'What should I do if my camera is not working?',
        answer: '1) Ensure no other app (like Zoom, Teams) is using your webcam. 2) Check browser permissions via the padlock icon in the address bar. 3) Reconnect the webcam and refresh the page.',
        keywords: ['camera not working', 'camera broken', 'webcam error', 'black screen'],
      },
      {
        id: 'help-mic-not-working',
        question: 'What should I do if my microphone is not working?',
        answer: '1) Verify your mic is selected as the default input device in Windows settings. 2) Click the "Retry Mic" button on the Translate page. 3) Make sure you are using Chrome or Edge for the Web Speech API.',
        actionLabel: 'Open Translate Studio',
        actionRoute: '/translate',
        keywords: ['microphone not working', 'mic error', 'speech not recognized', 'mic broken'],
      },
      {
        id: 'help-end-session',
        question: 'How do I end a communication session?',
        answer: 'Click the red "Leave Room" or "End Call" button in the bottom call control toolbar. You will be redirected back to the Communicate hub with a call summary.',
        keywords: ['end call', 'leave room', 'disconnect', 'hang up'],
      },
      {
        id: 'help-realtime-how',
        question: 'How does real-time communication work?',
        answer: 'SignBridge connects both users over low-latency WebRTC. The hearing user speaks, their audio is converted into text and matched to ISL gestures on the deaf user’s screen, while deaf users reply via signs or live chat read out loud automatically.',
        actionLabel: 'Go to Communicate',
        actionRoute: '/communicate',
        keywords: ['how communication works', 'webrtc', 'live call', 'realtime'],
      },
    ],
  },
  {
    id: 'others',
    name: 'Others (Custom Query)',
    icon: 'search',
    description: 'Type a custom question to search our knowledge base',
    questions: [],
  },
];

/**
 * Intelligent keyword and fuzzy matcher to find suitable predefined answers
 * for custom user queries in the 'Others' section.
 */
export function matchQuestionInKnowledgeBase(query: string): ChatQuestion | null {
  const clean = query.trim().toLowerCase();
  if (!clean || clean.length < 2) return null;

  const queryWords = clean
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['the', 'and', 'for', 'with', 'that', 'this', 'how', 'what', 'why', 'can'].includes(w));

  let bestMatch: ChatQuestion | null = null;
  let highestScore = 0;

  for (const topic of CHATBOT_TOPICS) {
    for (const q of topic.questions) {
      let score = 0;
      const questionText = q.question.toLowerCase();
      const answerText = q.answer.toLowerCase();

      // Exact substring match in question
      if (questionText.includes(clean)) {
        score += 50;
      }

      // Keyword matches
      if (q.keywords) {
        for (const kw of q.keywords) {
          if (clean.includes(kw.toLowerCase())) {
            score += 20;
          }
        }
      }

      // Individual word matches
      for (const word of queryWords) {
        if (questionText.includes(word)) {
          score += 8;
        }
        if (answerText.includes(word)) {
          score += 3;
        }
        if (q.keywords?.some((k) => k.toLowerCase().includes(word))) {
          score += 10;
        }
      }

      if (score > highestScore && score >= 12) {
        highestScore = score;
        bestMatch = q;
      }
    }
  }

  return bestMatch;
}
