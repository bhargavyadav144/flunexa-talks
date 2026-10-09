export interface ReadAloudPrompt {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  text: string;
  targetWpm: number;
  keyPhoneticWords: string[];
}

export interface RepeatAfterAiPrompt {
  id: string;
  sentence: string;
  intonationNotes: string;
  focusSound: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface ReadAndSpeakPrompt {
  id: string;
  title: string;
  prepTimeSeconds: number;
  speakTimeSeconds: number;
  passage: string;
  guidingQuestions: string[];
}

export interface PictureDescriptionPrompt {
  id: string;
  title: string;
  category: string;
  prepTimeSeconds: number;
  speakTimeSeconds: number;
  svgScene: string;
  sceneDescription: string;
  vocabularyToUse: string[];
  keyQuestions: string[];
}

export const READ_ALOUD_PROMPTS: ReadAloudPrompt[] = [
  {
    id: 'ra-1',
    title: 'The Morning Rhythm',
    difficulty: 'Beginner',
    text: 'Every morning brings a brand new opportunity to learn something fascinating. When the sun rises, the birds begin to sing cheerfully outside my bedroom window. Starting the day with gratitude and a warm cup of tea makes every challenge feel easy and manageable.',
    targetWpm: 110,
    keyPhoneticWords: ['fascinating', 'gratitude', 'manageable', 'opportunity'],
  },
  {
    id: 'ra-2',
    title: 'The Power of Consistency',
    difficulty: 'Intermediate',
    text: 'Consistent practice is undeniably the single greatest secret behind mastering any spoken language. Speaking aloud for just ten focused minutes each day sharpens your cognitive pronunciation reflexes, eliminates hesitation, and transforms timid speakers into articulate communicators.',
    targetWpm: 125,
    keyPhoneticWords: ['undeniably', 'cognitive', 'hesitation', 'articulate', 'communicators'],
  },
  {
    id: 'ra-3',
    title: 'Global Connectivity',
    difficulty: 'Advanced',
    text: 'Technological innovations have irrevocably altered the tapestry of human interaction. Across disparate time zones and geographical boundaries, individuals collaborate with unprecedented agility, exchanging nuanced perspectives and cultivating empathetic, cross-cultural alliances.',
    targetWpm: 140,
    keyPhoneticWords: ['irrevocably', 'unprecedented', 'nuanced', 'empathetic', 'geographical'],
  },
];

export const REPEAT_AFTER_AI_PROMPTS: RepeatAfterAiPrompt[] = [
  {
    id: 'rep-1',
    sentence: "Good morning! It's a wonderful day to practice speaking English with confidence.",
    intonationNotes: 'Rising intonation at the exclamation, smooth cadence at the end.',
    focusSound: '/w/ sound in wonderful and /f/ sound in confidence',
    difficulty: 'Beginner',
  },
  {
    id: 'rep-2',
    sentence: "Could you please explain that concept once more using a simpler real-life example?",
    intonationNotes: 'Polite rising question inflection on example.',
    focusSound: '/pl/ blend in please and /k/ in concept',
    difficulty: 'Beginner',
  },
  {
    id: 'rep-3',
    sentence: "Although the presentation was challenging, our team successfully delivered all key deliverables on schedule.",
    intonationNotes: 'Pause at the comma, emphatic stress on successfully and schedule.',
    focusSound: '/th/ in although and /v/ in deliverables',
    difficulty: 'Intermediate',
  },
  {
    id: 'rep-4',
    sentence: "Developing professional fluency requires consistent dedication, natural rhythm, and active listening skills.",
    intonationNotes: 'Cadenced listing intonation: dedication (rise), rhythm (rise), and active listening (fall).',
    focusSound: '/r/ and /l/ differentiation in fluency and regularly',
    difficulty: 'Intermediate',
  },
  {
    id: 'rep-5',
    sentence: "Her articulate articulation and persuasive demeanor captivated the international conference audience.",
    intonationNotes: 'Steady authoritative pace with clear syllable stress.',
    focusSound: '/sh/ in captivation and /t/ in articulate',
    difficulty: 'Advanced',
  },
];

export const READ_AND_SPEAK_PROMPTS: ReadAndSpeakPrompt[] = [
  {
    id: 'rns-1',
    title: 'The Discovery of Honey Bees Communication',
    prepTimeSeconds: 20,
    speakTimeSeconds: 90,
    passage: 'Honeybees communicate the location of distant flowers using a sophisticated waggle dance. When a scout bee finds nectar, she returns to the hive and performs figure-eight movements. The angle of the dance indicates the direction relative to the sun, while the duration of the waggle communicates the exact distance. This remarkable behavior reveals that complex spatial data can be transmitted without verbal speech.',
    guidingQuestions: [
      'How do scout bees tell their companions where flowers are?',
      'What two pieces of information does the waggle dance transmit?',
      'Why is this considered remarkable?',
    ],
  },
  {
    id: 'rns-2',
    title: 'The Origins of the Internet',
    prepTimeSeconds: 25,
    speakTimeSeconds: 120,
    passage: 'In the late 1960s, researchers developed ARPANET, a decentralized network designed to allow computer systems to communicate even if certain physical nodes were disrupted. This architecture pioneered packet switching, where data is split into small bundles and independently rerouted. In 1989, Tim Berners-Lee invented the World Wide Web, transforming this military and academic tool into the ubiquitous global network we depend on today.',
    guidingQuestions: [
      'What was the primary objective of ARPANET in the 1960s?',
      'What is packet switching?',
      'How did Tim Berners-Lee change computer networking in 1989?',
    ],
  },
];

export const PICTURE_DESCRIPTION_PROMPTS: PictureDescriptionPrompt[] = [
  {
    id: 'pic-1',
    title: 'Bustling Modern Urban Cafe',
    category: 'Lifestyle & Community',
    prepTimeSeconds: 30,
    speakTimeSeconds: 120,
    sceneDescription: 'A brightly lit modern cafe with barista brewing espresso, patrons working on laptops with headphones, friends chatting over lattes, and lush houseplants near large glass windows overlooking a city boulevard.',
    vocabularyToUse: ['cozy ambience', 'barista', 'patrons', 'absorbed in work', 'vibrant atmosphere'],
    keyQuestions: [
      'What is the overall atmosphere inside the cafe?',
      'What different activities are people engaged in?',
      'Would you enjoy spending time in this kind of venue?',
    ],
    svgScene: 'cafe',
  },
  {
    id: 'pic-2',
    title: 'Collaborative Tech Team Brainstorming',
    category: 'Workplace & Innovation',
    prepTimeSeconds: 30,
    speakTimeSeconds: 120,
    sceneDescription: 'A diverse group of five young professionals gathered around a glass whiteboard covered in sticky notes, flowcharts, and architecture diagrams, animatedly discussing product ideas while holding coffee cups and tablets.',
    vocabularyToUse: ['brainstorming', 'collaborative', 'whiteboard diagrams', 'synergy', 'innovative solutions'],
    keyQuestions: [
      'What are the team members discussing?',
      'Describe the body language and expressions of the participants.',
      'How does open collaboration impact project success?',
    ],
    svgScene: 'workplace',
  },
  {
    id: 'pic-3',
    title: 'Serene Sunset Mountain Trek',
    category: 'Nature & Adventure',
    prepTimeSeconds: 30,
    speakTimeSeconds: 120,
    sceneDescription: 'Two hikers with backpacks standing atop a rocky mountain ridge looking at a breathtaking golden sunset over rolling purple hills, with a campfire tent pitched nearby under an expansive sky.',
    vocabularyToUse: ['breathtaking horizon', 'rugged terrain', 'tranquil solitude', 'golden hour', 'unwinding'],
    keyQuestions: [
      'Where are the hikers situated and what time of day is it?',
      'What emotions does this scenery evoke?',
      'Have you ever experienced hiking or camping in nature?',
    ],
    svgScene: 'nature',
  },
];
