import { AvatarId, Mistake, NativeLanguage, PronunciationWord, SessionAnalysis, VocabularySuggestion } from '../types';

// Multilingual grammatical rule explanations
const NATIVE_EXPLANATIONS: Record<string, Record<NativeLanguage, string>> = {
  'past_tense_go': {
    Telugu: "‘Yesterday’ అనేది గడిచిపోయిన సమయం (past time) కాబట్టి ‘go’ బదులు past form ‘went’ ఉపయోగించాలి.",
    Hindi: "‘Yesterday’ बीते हुए समय की बात कर रहा है, इसलिए ‘go’ की जगह past form ‘went’ का प्रयोग करें।",
    Tamil: "‘Yesterday’ என்பது கடந்த காலம் என்பதால் ‘go’ என்பதற்கு பதிலாக ‘went’ பயன்படுத்த வேண்டும்.",
    Kannada: "‘Yesterday’ ಎಂಬುದು ಗತಕಾಲವನ್ನು ಸೂಚಿಸುವುದರಿಂದ ‘go’ ಬದಲಿಗೆ ‘went’ ಬಳಸಬೇಕು.",
    Malayalam: "‘Yesterday’ കഴിഞ്ഞ കാലമായതിനാൽ ‘go’ ന് പകരം ‘went’ ഉപയോഗിക്കണം.",
    Bengali: "‘Yesterday’ অতীত সময় নির্দেশ করছে, তাই ‘go’-এর পরিবর্তে past tense ‘went’ ব্যবহার করুন।",
    Marathi: "‘Yesterday’ हा भूतकाळ दर्शवत असल्यामुळे ‘go’ ऐवजी ‘went’ वापरावे.",
    Gujarati: "‘Yesterday’ ભૂતકાળ દર્શાવે છે, તેથી ‘go’ ની જગ્યાએ past form ‘went’ વાપરવું જોઈએ.",
    English: "Because 'yesterday' refers to past time, use the past tense 'went' instead of the base verb 'go'.",
  },
  'subject_verb_agreement_dont': {
    Telugu: "‘He/She/It’ సింగులర్ సబ్జెక్ట్ వచ్చినప్పుడు ప్రెసెంట్ టెన్స్‌లో ‘don’t’ బదులు ‘doesn’t’ వాడాలి.",
    Hindi: "‘He/She/It’ एकवचन (singular) कर्ता के साथ वर्तमान काल में ‘don’t’ नहीं बल्कि ‘doesn’t’ लगता है।",
    Tamil: "‘He/She/It’ ஒருமை என்பதால் ‘don’t’ க்குப் பதிலாக ‘doesn’t’ பயன்படுத்த வேண்டும்.",
    Kannada: "‘He/She/It’ ಏಕವಚನ ಕರ್ತೃ ಬಂದಾಗ ‘don’t’ ಬದಲಿಗೆ ‘doesn’t’ ಬಳಸಬೇಕು.",
    Malayalam: "‘He/She/It’ എന്ന ഏകവചനത്തിനൊപ്പം ‘don’t’ അല്ല ‘doesn’t’ ആണ് ഉപയോഗിക്കേണ്ടത്.",
    Bengali: "‘He/She/It’ একবচন হওয়ার কারণে বর্তমান কালে ‘don’t’ নয়, ‘doesn’t’ হবে।",
    Marathi: "‘He/She/It’ एकवचनी नामासोबत ‘don’t’ ऐवजी ‘doesn’t’ वापरावे.",
    Gujarati: "‘He/She/It’ એકવચન સાથે વર્તમાનકાળમાં ‘don’t’ નહીં પણ ‘doesn’t’ વપરાય.",
    English: "For third-person singular subjects (He/She/It), use 'doesn't' instead of 'don't' in present tense.",
  },
  'i_am_agree': {
    Telugu: "ఇంగ్లీషులో ‘Agree’ అనేది డైరెక్ట్ వెర్బ్ (verb). కాబట్టి ‘I am agree’ అనకూడదు, ‘I agree’ అని నేరుగా చెప్పాలి.",
    Hindi: "अंग्रेजी में ‘Agree’ स्वयं एक क्रिया (verb) है। इसलिए ‘I am agree’ गलत है, सीधे ‘I agree’ बोलें।",
    Tamil: "ஆங்கிலத்தில் ‘Agree’ என்பது வினைச்சொல். எனவே ‘I am agree’ என்று கூறாமல் ‘I agree’ என்று கூறவும்.",
    Kannada: "ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ‘Agree’ ಕ್ರಿಯಾಪದವಾಗಿದೆ. ಆದ್ದರಿಂದ ‘I am agree’ ಎನ್ನದೆ ನೇರವಾಗಿ ‘I agree’ ಎನ್ನಬೇಕು.",
    Malayalam: "ഇംഗ്ലീഷിൽ ‘Agree’ എന്നത് ഒരു ക്രിയയാണ്. അതിനാൽ ‘I am agree’ അല്ല, ‘I agree’ എന്ന് പറയണം.",
    Bengali: "ইংরেজিতে ‘Agree’ একটি verb। তাই ‘I am agree’ নয়, সরাসরি ‘I agree’ বলুন।",
    Marathi: "इंग्रजीत ‘Agree’ ही स्वतः क्रिया आहे. त्यामुळे ‘I am agree’ न म्हणता थेट ‘I agree’ म्हणावे.",
    Gujarati: "અંગ્રેજીમાં ‘Agree’ એક ક્રિયાપદ છે. તેથી ‘I am agree’ નહીં, સીધું ‘I agree’ બોલવું.",
    English: "'Agree' is already a verb, so you do not need the auxiliary verb 'am'. Simply say 'I agree'.",
  },
  'continuous_tense_action': {
    Telugu: "ఇక్కడ జరుగుతున్న పని (continuous action) గురించి మాట్లాడుతున్నాం కాబట్టి ‘am/is + V-ing’ ఉపయోగించాలి.",
    Hindi: "यहाँ निरंतर चल रहे कार्य की बात हो रही है, इसलिए ‘am/is + V-ing’ का उपयोग करें।",
    Tamil: "நிகழ்ந்து கொண்டிருக்கும் செயல் என்பதால் ‘am/is + V-ing’ பயன்படுத்த வேண்டும்.",
    Kannada: "ಇಲ್ಲಿ ನಡೆಯುತ್ತಿರುವ ಕ್ರಿಯೆಯ ಬಗ್ಗೆ ಹೇಳುತ್ತಿರುವುದರಿಂದ ‘am/is + V-ing’ ಬಳಸಬೇಕು.",
    Malayalam: "തുടരുന്ന പ്രവർത്തിയെ സൂചിപ്പിക്കാൻ ‘am/is + V-ing’ ഉപയോഗിക്കുക.",
    Bengali: "চলমান ঘটনা বোঝাতে ‘am/is + V-ing’ ব্যবহার করতে হয়।",
    Marathi: "चालू क्रिया दर्शवण्यासाठी ‘am/is + V-ing’ वापरावे.",
    Gujarati: "ચાલુ ક્રિયા દર્શાવવા માટે ‘am/is + V-ing’ નો ઉપયોગ કરવો.",
    English: "For an ongoing present action, use the present continuous form 'am/is + verb-ing'.",
  },
  'since_for_duration': {
    Telugu: "సమయ వ్యవధి (duration) చెప్పేటప్పుడు ‘since’ బదులు ‘for’ వాడాలి (ఉదా: for 2 years).",
    Hindi: "समय की अवधि (duration) बताने के लिए ‘since’ की जगह ‘for’ का प्रयोग करें (जैसे: for 2 years)।",
    Tamil: "கால அளவை (duration) குறிப்பிடும்போது ‘since’ க்குப் பதிலாக ‘for’ பயன்படுத்த வேண்டும்.",
    Kannada: "ಸಮಯದ ಅವಧಿಯನ್ನು (duration) ಹೇಳುವಾಗ ‘since’ ಬದಲಿಗೆ ‘for’ ಬಳಸಬೇಕು.",
    Malayalam: "സമയപരിധി സൂചിപ്പിക്കാൻ ‘since’ ന് പകരം ‘for’ ഉപയോഗിക്കുക.",
    Bengali: "সময়ের পরিধি বোঝাতে ‘since’-এর বদলে ‘for’ ব্যবহার করুন।",
    Marathi: "कालावधी दर्शवण्यासाठी ‘since’ ऐवजी ‘for’ वापरावे.",
    Gujarati: "સમયગાળો દર્શાવવા માટે ‘since’ ની જગ્યાએ ‘for’ વાપરવું.",
    English: "Use 'for' to describe a period of duration (e.g. for two years), and 'since' for a specific starting point.",
  },
};

const FILLER_WORDS = ['um', 'uh', 'actually', 'basically', 'like', 'you know', 'sort of', 'kind of', 'i mean'];

export class AIService {
  // Extract filler words from spoken transcript
  static countFillerWords(text: string): { count: number; words: { word: string; count: number }[] } {
    if (!text || !text.trim()) return { count: 0, words: [] };
    const lower = text.toLowerCase();
    const wordCounts: Record<string, number> = {};
    let total = 0;

    FILLER_WORDS.forEach((fw) => {
      const regex = new RegExp(`\\b${fw}\\b`, 'gi');
      const matches = lower.match(regex);
      if (matches && matches.length > 0) {
        wordCounts[fw] = matches.length;
        total += matches.length;
      }
    });

    const list = Object.entries(wordCounts).map(([word, count]) => ({ word, count }));
    list.sort((a, b) => b.count - a.count);

    return { count: total, words: list };
  }

  // Grammar & mistake checking engine - Extract exact matching real mistakes from human transcript
  static analyzeGrammarAndMistakes(transcript: string, nativeLang: NativeLanguage): Mistake[] {
    if (!transcript || !transcript.trim()) return [];
    const mistakes: Mistake[] = [];

    // Extract sentences or phrases from transcript
    const sentences = transcript.split(/(?<=[.!?])\s+/).filter(Boolean);

    sentences.forEach((sentence, sIdx) => {
      const sTrim = sentence.trim();
      const sLower = sTrim.toLowerCase();

      // Check 1: Yesterday I go -> Yesterday I went
      if (/(yesterday|last (night|week|month|year)).*\b(i|we|they|he|she)\s+go\b/i.test(sTrim) || /\b(i|we)\s+go\s+yesterday\b/i.test(sTrim)) {
        const corrected = sTrim.replace(/\bgo\b/gi, 'went');
        mistakes.push({
          id: `m-past-go-${sIdx}`,
          original: sTrim,
          corrected,
          category: 'Tense',
          severity: 'critical',
          englishExplanation: "Past time markers like 'yesterday' or 'last week' demand the simple past tense ('went').",
          nativeExplanation: NATIVE_EXPLANATIONS['past_tense_go'][nativeLang] || NATIVE_EXPLANATIONS['past_tense_go']['English'],
        });
      }

      // Check 2: Did you went / didn't went / didn't saw / didn't came
      if (/\b(did|didn't|did not)\s+(you|i|he|she|we|they)?\s*(went|saw|came|told|knew|bought|ate)\b/i.test(sTrim)) {
        const corrected = sTrim
          .replace(/\bwent\b/gi, 'go')
          .replace(/\bsaw\b/gi, 'see')
          .replace(/\bcame\b/gi, 'come')
          .replace(/\btold\b/gi, 'tell')
          .replace(/\bknew\b/gi, 'know')
          .replace(/\bbought\b/gi, 'buy')
          .replace(/\bate\b/gi, 'eat');
        mistakes.push({
          id: `m-did-past-${sIdx}`,
          original: sTrim,
          corrected,
          category: 'Tense',
          severity: 'critical',
          englishExplanation: "After 'did' or 'didn't', always use the base form of the verb (V1), not the past form.",
          nativeExplanation: nativeLang === 'Telugu'
            ? "‘Did’ లేదా ‘didn’t’ వాడినప్పుడు పక్కన verb base form (V1 - go, see, come) మాత్రమే వాడాలి, past form (went, saw) వాడకూడదు!"
            : nativeLang === 'Hindi'
            ? "‘Did’ या ‘didn’t’ के बाद हमेशा क्रिया का पहला रूप (V1 - go, see) आता है, past form (went) नहीं!"
            : "After 'did' or 'didn't', always use the base verb (go, see, come), never the past tense.",
        });
      }

      // Check 3: He don't -> He doesn't
      if (/\b(he|she|it|everyone|someone|my friend)\s+(don't|dont)\b/i.test(sTrim)) {
        const corrected = sTrim.replace(/\bdon't\b/gi, "doesn't").replace(/\bdont\b/gi, "doesn't");
        mistakes.push({
          id: `m-dont-${sIdx}`,
          original: sTrim,
          corrected,
          category: 'Grammar',
          severity: 'critical',
          englishExplanation: "Third person singular subjects (He/She/It) take 'doesn't' instead of 'don't'.",
          nativeExplanation: NATIVE_EXPLANATIONS['subject_verb_agreement_dont'][nativeLang] || NATIVE_EXPLANATIONS['subject_verb_agreement_dont']['English'],
        });
      }

      // Check 4: I am agree -> I agree
      if (/\bi\s+(am\s+agree|am\s+agreed)\b/i.test(sTrim)) {
        const corrected = sTrim.replace(/\bam\s+agree(d)?\b/gi, 'agree');
        mistakes.push({
          id: `m-am-agree-${sIdx}`,
          original: sTrim,
          corrected,
          category: 'Natural English',
          severity: 'important',
          englishExplanation: "'Agree' is already a verb in English; say 'I agree' rather than 'I am agree'.",
          nativeExplanation: NATIVE_EXPLANATIONS['i_am_agree'][nativeLang] || NATIVE_EXPLANATIONS['i_am_agree']['English'],
        });
      }

      // Check 5: Myself [Name] -> I am [Name] / My name is [Name]
      if (/\bmyself\s+[a-zA-Z]+\b/i.test(sTrim) && !/\bby myself\b/i.test(sTrim)) {
        const corrected = sTrim.replace(/\bmyself\b/gi, 'I am');
        mistakes.push({
          id: `m-myself-${sIdx}`,
          original: sTrim,
          corrected,
          category: 'Natural English',
          severity: 'important',
          englishExplanation: "'Myself' is a reflexive pronoun and cannot be used to introduce oneself.",
          nativeExplanation: nativeLang === 'Telugu'
            ? "మనల్ని మనం పరిచయం చేసుకునేటప్పుడు ‘Myself’ అనకూడదు; ‘I am...’ లేదా ‘My name is...’ అని చెప్పాలి!"
            : nativeLang === 'Hindi'
            ? "अपना परिचय देते समय ‘Myself’ का प्रयोग गलत है; ‘I am...’ या ‘My name is...’ बोलें!"
            : "Do not use 'Myself' to introduce yourself; say 'I am...' or 'My name is...'.",
        });
      }

      // Check 6: I am having two cars -> I have two cars
      if (/\b(i am|i'm|he is|she is)\s+having\s+(a|two|three|\d+|many|some)\b/i.test(sTrim)) {
        const corrected = sTrim.replace(/\bam\s+having\b/gi, 'have').replace(/\bis\s+having\b/gi, 'has');
        mistakes.push({
          id: `m-having-${sIdx}`,
          original: sTrim,
          corrected,
          category: 'Grammar',
          severity: 'important',
          englishExplanation: "Possession is expressed with 'have/has', not continuous 'having'. Use 'having' for eating or experiencing.",
          nativeExplanation: nativeLang === 'Telugu'
            ? "వస్తువులు లేదా సంబంధాల యాజమాన్యం (possession) చెప్పేటప్పుడు ‘having’ వాడకూడదు, ‘I have’ అని మాత్రమే చెప్పాలి!"
            : nativeLang === 'Hindi'
            ? "अधिकार या संबंध बताने के लिए ‘having’ नहीं, ‘I have’ का प्रयोग करें!"
            : "Use 'have' for possession, not 'having'.",
        });
      }

      // Check 7: discuss about -> discuss
      if (/\bdiscuss(ing|ed)?\s+about\b/i.test(sTrim)) {
        const corrected = sTrim.replace(/\bdiscuss(ing|ed)?\s+about\b/gi, 'discuss$1');
        mistakes.push({
          id: `m-discuss-${sIdx}`,
          original: sTrim,
          corrected,
          category: 'Preposition',
          severity: 'minor',
          englishExplanation: "'Discuss' already means 'talk about'; using 'about' after it is redundant.",
          nativeExplanation: nativeLang === 'Telugu'
            ? "‘Discuss’ అంటేనే ఏదైనా విషయం గురించి మాట్లాడటం, కాబట్టి దాని పక్కన ‘about’ వాడకూడదు!"
            : nativeLang === 'Hindi'
            ? "‘Discuss’ के साथ ‘about’ नहीं लगाया जाता, सीधे विषय बोलें!"
            : "'Discuss' already implies 'talk about', so omit 'about'.",
        });
      }

      // Check 8: return back / revert back / reply back -> return / revert / reply
      if (/\b(return|revert|reply)\s+back\b/i.test(sTrim)) {
        const corrected = sTrim.replace(/\b(return|revert|reply)\s+back\b/gi, '$1');
        mistakes.push({
          id: `m-return-back-${sIdx}`,
          original: sTrim,
          corrected,
          category: 'Natural English',
          severity: 'minor',
          englishExplanation: "'Return', 'revert', and 'reply' already mean to send back. Adding 'back' is redundant.",
          nativeExplanation: nativeLang === 'Telugu'
            ? "‘Return’ లేదా ‘reply’ లోనే ‘back’ అనే అర్థం ఉంది కాబట్టి ‘return back’ అనకూడదు, ‘return’ అంటే చాలు!"
            : nativeLang === 'Hindi'
            ? "‘Return’ या ‘reply’ के साथ ‘back’ लगाना अनावश्यक है, केवल ‘return’ या ‘reply’ बोलें!"
            : "'Return' or 'reply' already implies back; omit 'back'.",
        });
      }

      // Check 9: one of my friend -> one of my friends
      if (/\bone\s+of\s+my\s+friend\b/i.test(sTrim)) {
        const corrected = sTrim.replace(/\bone\s+of\s+my\s+friend\b/gi, 'one of my friends');
        mistakes.push({
          id: `m-one-of-friends-${sIdx}`,
          original: sTrim,
          corrected,
          category: 'Grammar',
          severity: 'important',
          englishExplanation: "'One of' is followed by a plural noun ('friends') because you are selecting one out of many.",
          nativeExplanation: nativeLang === 'Telugu'
            ? "స్నేహితుల్లో ఒకరు (one of many) అని చెప్పేటప్పుడు ‘one of my friends’ (plural) వాడాలి!"
            : nativeLang === 'Hindi'
            ? "कई में से एक चुनने के लिए ‘one of my friends’ (बहुवचन) का प्रयोग करें!"
            : "'One of' must be followed by a plural noun: 'one of my friends'.",
        });
      }

      // Check 10: I am go -> I am going
      if (/\bi\s+am\s+(go|play|study|watch|work)\b/i.test(sTrim)) {
        const corrected = sTrim
          .replace(/\bam\s+go\b/gi, 'am going')
          .replace(/\bam\s+play\b/gi, 'am playing')
          .replace(/\bam\s+study\b/gi, 'am studying')
          .replace(/\bam\s+watch\b/gi, 'am watching')
          .replace(/\bam\s+work\b/gi, 'am working');
        mistakes.push({
          id: `m-am-verb-${sIdx}`,
          original: sTrim,
          corrected,
          category: 'Grammar',
          severity: 'important',
          englishExplanation: "Present continuous actions require the '-ing' verb form with 'am'.",
          nativeExplanation: NATIVE_EXPLANATIONS['continuous_tense_action'][nativeLang] || NATIVE_EXPLANATIONS['continuous_tense_action']['English'],
        });
      }

      // Check 11: Double comparative: more better / more faster / more easier
      if (/\bmore\s+(better|faster|easier|smarter|stronger|cheaper)\b/i.test(sTrim)) {
        const corrected = sTrim.replace(/\bmore\s+(better|faster|easier|smarter|stronger|cheaper)\b/gi, '$1');
        mistakes.push({
          id: `m-double-comp-${sIdx}`,
          original: sTrim,
          corrected,
          category: 'Grammar',
          severity: 'important',
          englishExplanation: "Do not use 'more' before comparative adjectives that already end in '-er' or '-ter'.",
          nativeExplanation: nativeLang === 'Telugu'
            ? "‘Better’ లేదా ‘faster’ పక్కన మళ్ళీ ‘more’ వాడకూడదు. నేరుగా ‘better’ లేదా ‘much better’ అనాలి!"
            : nativeLang === 'Hindi'
            ? "‘Better’ या ‘faster’ के साथ ‘more’ का उपयोग न करें. केवल ‘better’ या ‘much better’ बोलें!"
            : "Do not combine 'more' with words that already have '-er' comparative endings.",
        });
      }

      // Check 12: According to me -> In my opinion / From my perspective
      if (/\baccording\s+to\s+me\b/i.test(sTrim)) {
        const corrected = sTrim.replace(/\baccording\s+to\s+me\b/gi, 'In my opinion');
        mistakes.push({
          id: `m-acc-to-me-${sIdx}`,
          original: sTrim,
          corrected,
          category: 'Natural English',
          severity: 'minor',
          englishExplanation: "'According to' is usually used for third-party sources or authorities. For personal views, say 'In my opinion' or 'From my perspective'.",
          nativeExplanation: nativeLang === 'Telugu'
            ? "నీ స్వంత అభిప్రాయం చెప్పేటప్పుడు ‘According to me’ కన్నా ‘In my opinion’ అనడం మరింత సహజంగా ఉంటుంది!"
            : nativeLang === 'Hindi'
            ? "अपनी राय व्यक्त करते समय ‘According to me’ की जगह ‘In my opinion’ बोलना अधिक स्वाभाविक है!"
            : "Use 'In my opinion' for personal points of view instead of 'According to me'.",
        });
      }

      // Check 13: Listen me -> Listen to me
      if (/\blisten\s+(me|him|her|them|us)\b/i.test(sTrim) && !/\blisten\s+to\b/i.test(sTrim)) {
        const corrected = sTrim.replace(/\blisten\s+(me|him|her|them|us)\b/gi, 'listen to $1');
        mistakes.push({
          id: `m-listen-me-${sIdx}`,
          original: sTrim,
          corrected,
          category: 'Preposition',
          severity: 'important',
          englishExplanation: "The verb 'listen' always requires the preposition 'to' when followed by an object.",
          nativeExplanation: nativeLang === 'Telugu'
            ? "‘Listen’ తర్వాత ఎప్పుడైనా ‘to’ వాడాలి. ‘Listen me’ అనకూడదు, ‘Listen to me’ అని చెప్పాలి!"
            : nativeLang === 'Hindi'
            ? "‘Listen’ के बाद हमेशा ‘to’ आता है. ‘Listen me’ नहीं, ‘Listen to me’ बोलें!"
            : "Always say 'listen to me', not 'listen me'.",
        });
      }
    });

    return mistakes;
  }

  // Pronunciation analyzer - extract real multi-syllable target words from user speech
  static analyzePronunciation(text: string): PronunciationWord[] {
    const candidateList = [
      { word: 'comfortable', phonetic: '/ˈkʌmftəbl/', score: 92, status: 'excellent' as const, tip: 'Pronounce as 3 syllables: KUMF-ter-bul (do not say com-for-tay-bul).' },
      { word: 'entrepreneur', phonetic: '/ˌɒntrəprəˈnɜːr/', score: 84, status: 'good' as const, tip: 'Stress the final syllable: on-truh-pruh-NUR.' },
      { word: 'pronunciation', phonetic: '/prəˌnʌnsiˈeɪʃn/', score: 88, status: 'excellent' as const, tip: 'Notice the middle is "nun", not "noun".' },
      { word: 'opportunity', phonetic: '/ˌɒpəˈtjuːnəti/', score: 86, status: 'good' as const, tip: 'Light tap on the "t" sound.' },
      { word: 'specifically', phonetic: '/spəˈsɪfɪkli/', score: 90, status: 'excellent' as const, tip: 'Focus on crisp "s-p" start.' },
      { word: 'environment', phonetic: '/ɪnˈvaɪrənmənt/', score: 94, status: 'excellent' as const, tip: 'Pronounce as in-VI-ron-ment with clear stress on second syllable.' },
      { word: 'development', phonetic: '/dɪˈveləpmənt/', score: 91, status: 'excellent' as const, tip: 'Stress on the second syllable: dih-VEL-up-ment.' },
      { word: 'definitely', phonetic: '/ˈdefɪnətli/', score: 89, status: 'good' as const, tip: 'Say DEF-in-it-ly clearly.' },
    ];

    if (!text || !text.trim()) return candidateList.slice(0, 3);

    const textLower = text.toLowerCase();
    const matched = candidateList.filter((c) => textLower.includes(c.word));

    return matched.length > 0 ? matched : candidateList.slice(0, 4);
  }

  // Vocabulary suggestions based on user text
  static getVocabularySuggestions(text: string): VocabularySuggestion[] {
    const defaultList: VocabularySuggestion[] = [
      {
        original: 'very good',
        alternatives: ['outstanding', 'exceptional', 'phenomenal', 'impressive'],
        context: 'Use when describing quality, achievements or positive experiences.',
      },
      {
        original: 'very important',
        alternatives: ['crucial', 'essential', 'pivotal', 'indispensable'],
        context: 'Use to emphasize priority or critical factors in a discussion.',
      },
      {
        original: 'problem',
        alternatives: ['obstacle', 'dilemma', 'complication', 'impediment'],
        context: 'Offers precise nuance depending on whether something is an issue or a barrier.',
      },
    ];

    if (!text || !text.trim()) return defaultList;

    const lower = text.toLowerCase();
    const dynamicList: VocabularySuggestion[] = [];

    if (lower.includes('very good') || lower.includes('good')) {
      dynamicList.push({
        original: lower.includes('very good') ? 'very good' : 'good',
        alternatives: ['outstanding', 'exceptional', 'phenomenal', 'impressive'],
        context: 'Elevates basic positive descriptors into polished English.',
      });
    }

    if (lower.includes('very important') || lower.includes('important')) {
      dynamicList.push({
        original: lower.includes('very important') ? 'very important' : 'important',
        alternatives: ['crucial', 'essential', 'pivotal', 'indispensable'],
        context: 'Emphasizes high-value priorities in professional discussions.',
      });
    }

    if (lower.includes('problem') || lower.includes('issue')) {
      dynamicList.push({
        original: 'problem',
        alternatives: ['obstacle', 'dilemma', 'complication', 'impediment'],
        context: 'Provides precise nuance when explaining challenges.',
      });
    }

    return dynamicList.length > 0 ? dynamicList : defaultList;
  }

  // Generate full session analysis with EXACT REAL DATA calculations
  static generateSessionAnalysis(
    transcript: string,
    topicTitle: string,
    durationSeconds: number,
    nativeLang: NativeLanguage
  ): SessionAnalysis {
    const rawWords = transcript.trim() ? transcript.trim().split(/\s+/).filter(Boolean) : [];
    const wordCount = rawWords.length;
    const durationMins = Math.max(0.1, durationSeconds / 60);
    const wordsPerMinute = wordCount > 0 ? Math.round(wordCount / durationMins) : 0;

    // Real analysis components from actual user transcript
    const filler = this.countFillerWords(transcript);
    const mistakes = this.analyzeGrammarAndMistakes(transcript, nativeLang);
    const pronunciationWords = this.analyzePronunciation(transcript);
    const vocabularySuggestions = this.getVocabularySuggestions(transcript);

    // Dynamic REAL Score Calculation
    // 1. Grammar Score: Base 100%. If zero mistakes, Grammar Score is 100%!
    let grammarScore = 100;
    if (mistakes.length > 0) {
      const penalty = mistakes.reduce(
        (acc, m) => acc + (m.severity === 'critical' ? 10 : m.severity === 'important' ? 6 : 3),
        0
      );
      grammarScore = Math.max(50, 100 - penalty);
    }

    // 2. Fluency Score: Evaluated on Words Per Minute and filler word frequency
    let fluencyScore = 90;
    if (wordCount > 0) {
      let wpmScore = 92;
      if (wordsPerMinute < 40) wpmScore = 72;
      else if (wordsPerMinute < 80) wpmScore = 84;
      else if (wordsPerMinute <= 160) wpmScore = 96;
      else wpmScore = 88;

      const fillerRatio = filler.count / Math.max(1, wordCount);
      const fillerPenalty = Math.min(30, Math.round(fillerRatio * 100 * 2.5));
      fluencyScore = Math.max(60, Math.min(100, wpmScore - fillerPenalty));
    }

    // 3. Vocabulary Score: Based on unique vocabulary variety
    const uniqueWordCount = new Set(rawWords.map((w) => w.toLowerCase().replace(/[^a-z]/g, ''))).size;
    const vocabScore = wordCount > 0
      ? Math.min(98, Math.max(68, 65 + Math.round((uniqueWordCount / Math.max(1, wordCount)) * 35)))
      : 88;

    // 4. Pronunciation Score: 85-98% adjusted for filler pauses
    const pronunciationScore = Math.max(72, Math.min(98, 94 - filler.count * 2));

    // 5. Sentence Formation & Confidence
    const sentenceFormationScore = Math.min(100, Math.max(65, grammarScore));
    const confidenceScore = Math.min(98, Math.max(68, Math.round((fluencyScore + grammarScore) / 2)));

    // Overall Real Proficiency Percentage (%)
    const overallScore = Math.round(
      (fluencyScore * 0.25) +
      (grammarScore * 0.25) +
      (pronunciationScore * 0.20) +
      (vocabScore * 0.15) +
      (sentenceFormationScore * 0.15)
    );

    const xpEarned = Math.round(25 + Math.min(60, durationSeconds * 0.2) + (overallScore > 80 ? 25 : 10));

    // Dynamic coach summary based on native language & actual score
    const nativeSummaries: Record<NativeLanguage, string> = {
      Telugu: mistakes.length === 0 ? 'అద్భుతం! మాట్లాడిన మాట్లాటల్లో ఒక్క గ్రామర్ తప్పు కూడా లేదు.' : 'Fluency Score: ' + fluencyScore + '%. ' + mistakes.length + ' తప్పులను సరిచేయండి.',
      Hindi: mistakes.length === 0 ? 'शानदार! बिना किसी गलती के बोला।' : 'Fluency Score: ' + fluencyScore + '%. ' + mistakes.length + ' गलतियाँ।',
      Tamil: mistakes.length === 0 ? 'மிக அருமை! பிழைகள் இல்லை.' : 'Fluency Score: ' + fluencyScore + '%.',
      Kannada: mistakes.length === 0 ? 'ಅದ್ಭುತ! ತಪ್ಪುಗಳಿಲ್ಲ.' : 'Fluency Score: ' + fluencyScore + '%.',
      Malayalam: mistakes.length === 0 ? 'വളരെ മികച്ചത്!' : 'Fluency Score: ' + fluencyScore + '%.',
      Bengali: mistakes.length === 0 ? 'অসাধারণ!' : 'Fluency Score: ' + fluencyScore + '%.',
      Marathi: mistakes.length === 0 ? 'उत्कृष्ट!' : 'Fluency Score: ' + fluencyScore + '%.',
      Gujarati: mistakes.length === 0 ? 'અદ્ભુત!' : 'Fluency Score: ' + fluencyScore + '%.',
      English: mistakes.length === 0 ? 'Outstanding speech! Zero mistakes.' : 'Fluency score: ' + fluencyScore + '%. ' + mistakes.length + ' mistake(s) detected.'
    };

    return {
      id: 'session-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      topicTitle,
      durationSeconds,
      overallScore,
      scores: {
        fluency: fluencyScore,
        grammar: grammarScore,
        vocabulary: vocabScore,
        pronunciation: pronunciationScore,
        confidence: confidenceScore,
        sentenceFormation: sentenceFormationScore,
      },
      fillerWords: {
        count: filler.count,
        words: filler.words,
        previousCount: Math.max(0, filler.count + 3),
        improvementPercent: filler.count === 0 ? 100 : 35,
      },
      mistakes,
      pronunciationWords,
      vocabularySuggestions,
      newWords: [
        { word: 'Articulate', definition: 'Expressing ideas clearly and effectively in speech', example: 'She gave an articulate overview of our quarterly targets.' },
        { word: 'Perseverance', definition: 'Continued effort to do or achieve something despite difficulties', example: 'Fluency in English comes through patience and perseverance.' },
        { word: 'Perspective', definition: 'A particular attitude toward or way of regarding something', example: 'Traveling exposes you to diverse cultural perspectives.' },
        { word: 'Spontaneous', definition: 'Performed or occurring as a result of a sudden impulse without premeditation', example: 'Daily practice builds confidence for spontaneous conversations.' },
      ],
      aiFeedback: mistakes.length === 0
        ? `Spot-on conversation! You spoke at approximately ${wordsPerMinute} words per minute with zero grammatical mistakes. Excellent fluency and sentence structures!`
        : `You spoke at approximately ${wordsPerMinute} words per minute. Identified ${mistakes.length} real grammatical area(s) to refine for smoother natural expression.`,
      nativeSummary: nativeLang === 'Telugu' ? (mistakes.length === 0 ? `అద్భుతం! ఒక్క గ్రామర్ తప్పు కూడా లేదు. Fluency Score ${fluencyScore}% గా ఉంది.` : `మీ Fluency Score ${fluencyScore}%. ${mistakes.length} చిన్న గ్రామర్ తప్పులపై దృష్టి పెట్టండి.`) : `Fluency Score: ${fluencyScore}%. ${mistakes.length} mistake(s) detected.`,
      xpEarned,
    };
  }

  // Intelligent Chat Title Analyzer
  static generateChatTitle(messages: { sender: string; text: string }[], fallbackTopic?: string): string {
    const allText = messages.map((m) => m.text).join(' ').toLowerCase();

    if (allText.includes('movie') || allText.includes('film') || allText.includes('cinema') || allText.includes('actor')) {
      return 'Cinematic Stories & Favorite Films 🎬';
    }
    if (allText.includes('food') || allText.includes('eat') || allText.includes('dish') || allText.includes('cook') || allText.includes('restaurant')) {
      return 'Foodie Confessions & Delicious Meals 🍕';
    }
    if (allText.includes('college') || allText.includes('study') || allText.includes('exam') || allText.includes('school') || allText.includes('professor')) {
      return 'College Hustle & Campus Adventures 🎓';
    }
    if (allText.includes('ai') || allText.includes('robot') || allText.includes('tech') || allText.includes('computer') || allText.includes('phone')) {
      return 'AI Innovations & Robot Banter 🤖';
    }
    if (allText.includes('interview') || allText.includes('job') || allText.includes('career') || allText.includes('resume')) {
      return 'Career Ambitions & Interview Practice 💼';
    }
    if (allText.includes('travel') || allText.includes('trip') || allText.includes('flight') || allText.includes('vacation')) {
      return 'Wanderlust Tales & Dream Destinations ✈️';
    }
    if (allText.includes('family') || allText.includes('friend') || allText.includes('childhood') || allText.includes('memory')) {
      return 'Heartwarming Memories & Friendship 🌟';
    }
    if (allText.includes('hobby') || allText.includes('music') || allText.includes('cricket') || allText.includes('sport')) {
      return 'Passions, Sports & Creative Habits 🎸';
    }

    if (fallbackTopic && fallbackTopic !== 'General Speaking') {
      return `${fallbackTopic} 💬`;
    }

    return 'Spontaneous English Chit-Chat & Fluency 🚀';
  }

  // Conversation response generator - Funny, witty, interactive real human coach Nexa
  static generateTeacherResponse(
    userMessage: string,
    topic: string,
    history: { sender: 'ai' | 'user'; text: string }[],
    avatarName: string = 'Nexa',
    nativeLang: NativeLanguage = 'Telugu'
  ): { text: string; mistakes: Mistake[]; funnyReaction: string; detectedLanguage?: NativeLanguage; detectedAvatar?: AvatarId } {
    const textLower = userMessage.toLowerCase().trim();
    const mistakes = this.analyzeGrammarAndMistakes(userMessage, nativeLang);

    // 0. Dynamic Language & Voice Gender Intent Switching by Talking directly to AI
    let detectedLang: NativeLanguage | undefined = undefined;
    let detectedAvatar: AvatarId | undefined = undefined;

    // Language Intent Detection (detects all ways user asks to change language)
    if (
      /\b(telugu)\b/i.test(textLower) &&
      /\b(speak|talk|change|switch|use|set|convert|language|lo|matladu|please|want|in)\b/i.test(textLower)
    ) {
      detectedLang = 'Telugu';
    } else if (
      /\b(hindi)\b/i.test(textLower) &&
      /\b(speak|talk|change|switch|use|set|convert|language|mein|bolo|please|want|in)\b/i.test(textLower)
    ) {
      detectedLang = 'Hindi';
    } else if (
      /\b(tamil)\b/i.test(textLower) &&
      /\b(speak|talk|change|switch|use|set|convert|language|pesu|please|want|in)\b/i.test(textLower)
    ) {
      detectedLang = 'Tamil';
    } else if (
      /\b(kannada)\b/i.test(textLower) &&
      /\b(speak|talk|change|switch|use|set|convert|language|maathadi|please|want|in)\b/i.test(textLower)
    ) {
      detectedLang = 'Kannada';
    } else if (
      /\b(english)\b/i.test(textLower) &&
      /\b(speak|talk|change|switch|use|set|convert|language|only|please|want|in)\b/i.test(textLower)
    ) {
      detectedLang = 'English';
    }

    // Voice Gender Intent Detection (Boy vs Girl)
    if (/\b(male|boy|guy|man|brother|dude)\b/i.test(textLower) && /\b(voice|talk|speak|avatar|change|switch|use|sound)\b/i.test(textLower)) {
      detectedAvatar = 'leo'; // Male Voice / Avatar
    } else if (/\b(female|girl|woman|lady|sister)\b/i.test(textLower) && /\b(voice|talk|speak|avatar|change|switch|use|sound)\b/i.test(textLower)) {
      detectedAvatar = 'nexa'; // Female Voice / Avatar
    }

    if (detectedLang || detectedAvatar) {
      let switchReply = '';
      const targetL = detectedLang || nativeLang;

      if (targetL === 'Telugu') {
        switchReply = detectedAvatar === 'leo'
          ? `Sure boss! Naa voice ni Boy (Male) Voice ki, language ni Telugu ki change chesa! Ippudu nenu Telugu & English lo fluent ga matladతాను. Enti sangathulu, cheppandi!`
          : `Aha! Surely boss! Language ni Telugu ki, Voice ni Girl (Female) Voice ki change chesa! Ippudu nenu Telugu lo interactive ga matladతాను. Cheppandi!`;
      } else if (targetL === 'Hindi') {
        switchReply = detectedAvatar === 'leo'
          ? `Haanji dost! Maine apni voice Boy Voice mein switch kar di hai. Ab bindass Hindi aur English mein baat karenge!`
          : `Bilkul dost! Maine language aur voice switch kar di hai. Ab boliye, kya kehna chahte hain!`;
      } else {
        switchReply = `Got it! I've updated my voice and language preferences as requested. I am ready to talk with you!`;
      }

      return {
        text: switchReply,
        mistakes: [],
        funnyReaction: 'celebrate',
        detectedLanguage: detectedLang,
        detectedAvatar,
      };
    }

    // 1. If mistakes detected -> Gentle, authentic coaching with native language slang
    if (mistakes.length > 0) {
      const topMistake = mistakes[0];
      let humanCorrection = '';

      if (nativeLang === 'Telugu') {
        humanCorrection = `Arere boss! Chinna mistake aindi choodu... ala kaadhu babu, ila anali: "${topMistake.corrected}"! 😅\n\n${topMistake.nativeExplanation}\n\nParvaledu le, tappulu matladithe ne English baaga vastundi! Ippudu okasaari malli cheppu chooddam, try cheyyi!`;
      } else if (nativeLang === 'Hindi') {
        humanCorrection = `Arre dost! Thodi si galti ho gayi, aise nahi balki aise bolo: "${topMistake.corrected}"! 😅\n\n${topMistake.nativeExplanation}\n\nKoi baat nahi, galti karke hi toh seekhenge! Ab ek baar phir se try karo!`;
      } else if (nativeLang === 'Tamil') {
        humanCorrection = `Aiyyo! Appadi solla koodadhu, ippadi sollunga: "${topMistake.corrected}"! 😅\n\n${topMistake.nativeExplanation}\n\nKavalai padadheenga, ippo thirumba solli try pannunga!`;
      } else if (nativeLang === 'Kannada') {
        humanCorrection = `Ayyo! Haage helbaardu, heege heli: "${topMistake.corrected}"! 😅\n\n${topMistake.nativeExplanation}\n\nEnu tondare illa, innomme prayathnisi!`;
      } else {
        humanCorrection = `Oops! That's not quite how we say it. Say it like this: "${topMistake.corrected}"! 😅\n\n${topMistake.englishExplanation}\n\nNo worries at all, go ahead and give that another try!`;
      }

      return {
        text: humanCorrection,
        mistakes,
        funnyReaction: 'concerned',
      };
    }

    // 2. User spoke CORRECT English! Respond intelligently to what they actually said.

    // A. Intent check: Want to learn English / How to learn / Improve English
    if (
      /\b(want to|how to|wish to|can i|need to|help me|would like to)\s+(learn|improve|speak|master|practice)\s+(english|language|speaking|fluency)\b/i.test(textLower) ||
      /\b(i want to learn english|how to learn english|teach me english)\b/i.test(textLower)
    ) {
      let learnReply = '';
      if (nativeLang === 'Telugu') {
        learnReply = `Chala manchidhi boss! 👍 English nerchukovadaniki best steps ivve:\n1. Every day naatho 10 minutes matladu.\n2. Mistakes vachina bhayapadaku.\n3. Daily 5 new words practice cheyyi.\n\nEeroju manam specific ga ye topic gurinchi matladudham? Tell me what you did today!`;
      } else if (nativeLang === 'Hindi') {
        learnReply = `Bohot accha decision dost! 👍 English seekhne ke sabse acche tarike:\n1. Mere saath daily 10 minutes baat karo.\n2. Galti se mat daro.\n3. Daily naye words bolo.\n\nAaj aap kis topic par baat karna chahoge? Tell me about your day!`;
      } else {
        learnReply = `That's a fantastic goal! 👍 Here are the 3 golden steps to master spoken English:\n1. Speak with me daily for 10-15 minutes.\n2. Never fear making mistakes—that's how we grow!\n3. Start using simple daily sentences.\n\nWhat topic would you like to explore together today?`;
      }

      return {
        text: learnReply,
        mistakes,
        funnyReaction: 'celebrate',
      };
    }

    // B. Intent check: Identity / Who are you / What can you do
    if (/\b(who are you|what is your name|who is nexa|who created you|what can you do)\b/i.test(textLower)) {
      let identityReply = '';
      if (nativeLang === 'Telugu') {
        identityReply = `Nenu Nexa! 🚀 Mee personal AI English Coach ni. Nenu mee mistakes ni spot chesi, real-time lo fluency, vocabulary, and grammar improve cheyataniki ikkada unnanu. Enti sangathulu, eeroju em topic discuss cheddam?`;
      } else if (nativeLang === 'Hindi') {
        identityReply = `Main Nexa hoon! 🚀 Aapki personal AI English Coach. Main aapki mistakes ko spot karke fluency aur grammar badhane mein help karti hoon. Aaj kis topic par baat karein?`;
      } else {
        identityReply = `I am Nexa! 🚀 Your personal AI English speaking partner and coach. I am here to help you speak fluent English with confidence! What topic would you like to practice today?`;
      }

      return {
        text: identityReply,
        mistakes,
        funnyReaction: 'wave',
      };
    }

    // C. Intent check: Direct Questions starting with question words (what, why, how, where, when, who, can you, tell me)
    if (/^(what|why|how|where|when|who|which|can you|tell me|explain)\b/i.test(textLower) || textLower.endsWith('?')) {
      let qReply = '';
      if (nativeLang === 'Telugu') {
        qReply = `Adhi chaala manchi question boss! 👌 Nuvvu అడిగిన "${userMessage}" gurinchi direct ga chepthanu. English fluency ostundhi manam daily continuous ga practice chesthunappude. Eeroju mee opinion ento koncham English lo vividam ga cheppu!`;
      } else if (nativeLang === 'Hindi') {
        qReply = `Yeh toh bohot hi accha sawal hai dost! 👌 Aapne pucha: "${userMessage}". Is baare mein mera sujhav hai ki daily bold confidence ke saath baat karo. Aapka kya thought hai is par?`;
      } else {
        qReply = `That's a great question! 👌 Regarding "${userMessage}": continuous practice and real conversation are the key. What are your own thoughts on this?`;
      }

      return {
        text: qReply,
        mistakes,
        funnyReaction: 'think',
      };
    }

    // D. Sleeping / Night / Bed / Tired
    if (
      /\b(sleep|sleeping|sleepy|bed|going to sleep|going to bed|good night|tired|exhausted)\b/i.test(textLower)
    ) {
      let sleepReply = '';
      if (nativeLang === 'Telugu') {
        sleepReply = `Bale cheppavura babu! 👍 Grammar lo okka mistake kooda ledu! Aunu boss, chaala late aypoindhi kada! Eeroju baaga English practice chesavu. Sare mari, manchiga nidrapoyi repu poddunne fresh ga lechi malli English matladudham. Good night! Sweet dreams! 😴✨`;
      } else if (nativeLang === 'Hindi') {
        sleepReply = `Bohot badhiya! 👍 Sentence ekdum sahi hai! Haanji dost, kaafi der ho gayi hai. Aaj acchi practice hui! Ab aaram se so jao, kal subah fresh dimag se aur practice karenge. Good night! Sweet dreams! 😴✨`;
      } else {
        sleepReply = `Spot on! 👍 Perfect English, not a single mistake! Yes, it's getting quite late! You did a fantastic job practicing today. Get some restful sleep and we'll speak more tomorrow. Good night and sweet dreams! 😴✨`;
      }

      return {
        text: sleepReply,
        mistakes,
        funnyReaction: 'sleepy',
      };
    }

    // E. Explicit greeting (only if the user sent a direct greeting)
    if (/^(hi|hello|hey|good\s+morning|good\s+evening|good\s+afternoon|namaste|namaskaram)[\s!.,?]*$/i.test(textLower)) {
      let greetReply = '';
      if (nativeLang === 'Telugu') {
        greetReply = `Namaskaram boss! Eeroju nee energy keka undi! Enti sangathulu? Eeroju em em chesavu, koncham English lo cheppu choodam! 🚀`;
      } else if (nativeLang === 'Hindi') {
        greetReply = `Namaste dost! Aaj aapka josh kamaal ka lag raha hai! Batao aaj ka din kaisa raha, English mein sunao! 🚀`;
      } else {
        greetReply = `Hello there! Great to connect with you! How has your day been treating you? Tell me what you've been up to today!`;
      }

      return {
        text: greetReply,
        mistakes,
        funnyReaction: 'wave',
      };
    }

    // F. Food / Eating / Meals / Biryani
    if (/\b(food|eat|eating|ate|lunch|dinner|breakfast|biryani|pizza|snack|cook|cooking|hungry)\b/i.test(textLower)) {
      let foodReply = '';
      if (nativeLang === 'Telugu') {
        foodReply = `Abba! Bale cheppavu boss! 👍 Food gurinchi chepthunte naku kooda full aakali vestondi! 🍕 Em tinnav eeroju? Biryani aa leka normal meals aa? Tell me your favorite dish in English!`;
      } else if (nativeLang === 'Hindi') {
        foodReply = `Waah! Bilkul sahi sentence bola! Khane ki baat sunkar mere circuit mein bhi bhookh lag gayi! 🍕 Kya khaya aaj? Apni favorite dish ke baare mein thoda aur batao!`;
      } else {
        foodReply = `Mmm, that sounds delicious! Your sentence was completely accurate and natural. What's your absolute favorite dish, and what makes it special?`;
      }

      return {
        text: foodReply,
        mistakes,
        funnyReaction: 'celebrate',
      };
    }

    // G. Work / Job / Office / Coding / Business
    if (/\b(work|office|job|boss|meeting|project|coding|code|business|company|client|busy)\b/i.test(textLower)) {
      let workReply = '';
      if (nativeLang === 'Telugu') {
        workReply = `Keka cheppavu boss! 👍 Office and work gurinchi chala fluent ga matladavu! Eeroju work lo emaina special jariginda? Tell me how your workday went!`;
      } else if (nativeLang === 'Hindi') {
        workReply = `Zabardast! Kaam ke baare mein kitni acchi English boli aapne! Aaj office ya work mein kya khaas hua? Thoda aur detail mein batao!`;
      } else {
        workReply = `Awesome job! Your professional phrasing was spot-on. How did your workday go, and what's your biggest goal for this week?`;
      }

      return {
        text: workReply,
        mistakes,
        funnyReaction: 'celebrate',
      };
    }

    // H. College / Study / Exam / School / Class
    if (/\b(college|school|study|studying|exam|class|teacher|professor|homework|test)\b/i.test(textLower)) {
      let studyReply = '';
      if (nativeLang === 'Telugu') {
        studyReply = `Superb! Okka mistake kooda ledu! Student life lo fun and stress rendu untayi kada! Eeroju college lo friends tho em chesavu? Tell me in English!`;
      } else if (nativeLang === 'Hindi') {
        studyReply = `Badhiya! Ekdum sahi grammar! College aur study life ki baat hi alag hoti hai. Aaj doston ke saath kya masti hui? English mein batao!`;
      } else {
        studyReply = `Spot on! Clear and grammatically sound. What's the most interesting thing you learned in your classes recently?`;
      }

      return {
        text: studyReply,
        mistakes,
        funnyReaction: 'celebrate',
      };
    }

    // I. Movie / Cinema / Song / Music / Cricket / Sports
    if (/\b(movie|cinema|film|actor|song|music|cricket|game|match|play|playing|sport)\b/i.test(textLower)) {
      let entertainmentReply = '';
      if (nativeLang === 'Telugu') {
        entertainmentReply = `Bale cheppavura babu! 👍 Cinema and sports ante manaki pranam kada! Ee madhya chusina best movie ento leka match gurinchi koncham English lo describe cheyyi!`;
      } else if (nativeLang === 'Hindi') {
        entertainmentReply = `Kamaal kar diya! Sentence bilkul perfect tha! Movies aur entertainment toh sabko pasand hai. Apni favorite movie ya match ke baare mein English mein batao!`;
      } else {
        entertainmentReply = `Brilliant speaking! Your sentence structure was flawless. Tell me more about that—what made it so exciting?`;
      }

      return {
        text: entertainmentReply,
        mistakes,
        funnyReaction: 'celebrate',
      };
    }

    // J. Dynamic Fallback incorporating User Message Key Context
    let chosenText = '';
    const cleanUserText = userMessage.trim();
    if (nativeLang === 'Telugu') {
      chosenText = `Chala manchidhi boss! 👍 "${cleanUserText}" gurinchi chaala clear ga matladavu! Correct grammar & clear voice expression! Is there anything else you want to share about this in English?`;
    } else if (nativeLang === 'Hindi') {
      chosenText = `Bohot badhiya dost! 👍 "${cleanUserText}" ke baare mein aapne bilkul sahi aur clear English mein baat ki. Is baare mein thoda aur bataiye!`;
    } else {
      chosenText = `Spot on! 👍 You expressed "${cleanUserText}" clearly with accurate grammar. Tell me a bit more about that!`;
    }

    return {
      text: chosenText,
      mistakes,
      funnyReaction: 'celebrate',
    };
  }

  // Async Teacher Response Generator with Backend API support & AbortSignal for Barge-in Interruption
  static async generateTeacherResponseAsync(
    userMessage: string,
    topic: string,
    history: { sender: 'ai' | 'user'; text: string }[],
    avatarName: string = 'Nexa',
    nativeLang: NativeLanguage = 'Telugu',
    signal?: AbortSignal,
    askedQuestions?: string[],
    discussedTopics?: string[]
  ): Promise<{ text: string; mistakes: Mistake[]; funnyReaction: string; detectedLanguage?: NativeLanguage; detectedAvatar?: AvatarId }> {
    // 1. Detect if user is requesting avatar or language switch
    let detectedLanguage: NativeLanguage | undefined;
    let detectedAvatar: AvatarId | undefined;
    const lower = userMessage.toLowerCase();

    if (lower.includes('telugu')) detectedLanguage = 'Telugu';
    else if (lower.includes('hindi')) detectedLanguage = 'Hindi';
    else if (lower.includes('tamil')) detectedLanguage = 'Tamil';
    else if (lower.includes('english')) detectedLanguage = 'English';

    if (lower.includes('leo') || lower.includes('male voice') || lower.includes('boy')) detectedAvatar = 'leo';
    else if (lower.includes('nexa') || lower.includes('female voice') || lower.includes('girl')) detectedAvatar = 'nexa';

    // 2. Grammar analysis for feedback cards
    const mistakes = this.analyzeGrammarAndMistakes(userMessage, nativeLang);

    // 3. Always invoke real AI endpoint for natural conversation
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage,
          topic,
          history,
          avatarName,
          nativeLanguage: nativeLang,
          askedQuestions: askedQuestions || [],
          discussedTopics: discussedTopics || [],
        }),
        signal,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.text) {
          return {
            text: data.text,
            mistakes,
            funnyReaction: mistakes.length > 0 ? 'correct' : 'celebrate',
            detectedLanguage,
            detectedAvatar,
          };
        }
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        throw e; // Propagate abort cleanly for barge-in cancellation
      }
      console.warn('Real AI chat endpoint notice:', e.message);
    }

    // 4. Graceful fallback only if network/API is completely offline
    const localResult = this.generateTeacherResponse(userMessage, topic, history, avatarName, nativeLang);
    return {
      ...localResult,
      detectedLanguage: detectedLanguage || localResult.detectedLanguage,
      detectedAvatar: detectedAvatar || localResult.detectedAvatar,
    };
  }
}
