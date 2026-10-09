import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import textToSpeech from '@google-cloud/text-to-speech';
import { v2 as translateModule } from '@google-cloud/translate';

import {
  initDb,
  findUserByEmail,
  findUserById,
  createUser,
  updateUserPassword,
  updateUserPlan,
  verifyUserPassword,
  sanitizeUser,
  saveOtp,
  getOtpRecord,
  deleteOtpRecord,
} from './db.js';
import {
  sendOtpEmail,
  sendWelcomeEmail,
  sendLoginNotificationEmail,
  sendPasswordChangedEmail,
  sendPlanUpgradedEmail,
} from './emailService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'flunexa_super_secret_jwt_key_2026';

app.use(cors());
app.use(express.json());

// Initialize DB on boot
await initDb();

// Helper to generate 6-digit numeric OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Native grammatical explanation repository
const NATIVE_EXPLANATIONS = {
  past_tense: {
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
  subject_verb: {
    Telugu: "‘He/She/It’ సింగులర్ సబ్జెక్ట్ వచ్చినప్పుడు ప్రెసెంట్ టెన్స్‌లో ‘don’t’ బదులు ‘doesn’t’ వాడాలి.",
    Hindi: "‘He/She/It’ एकवचन कर्ता के साथ वर्तमान काल में ‘don’t’ नहीं बल्कि ‘doesn’t’ लगता है।",
    Tamil: "‘He/She/It’ ஒருமை என்பதால் ‘don’t’ க்குப் பதிலாக ‘doesn’t’ பயன்படுத்த வேண்டும்.",
    English: "For third-person singular subjects (He/She/It), use 'doesn't' instead of 'don't' in present tense.",
  },
  state_verbs: {
    Telugu: "ఇంగ్లీషులో ‘Agree’ అనేది డైరెక్ట్ వెర్బ్ (verb). కాబట్టి ‘I am agree’ అనకూడదు, ‘I agree’ అని నేరుగా చెప్పాలి.",
    Hindi: "अंग्रेजी में ‘Agree’ स्वयं एक क्रिया (verb) है। इसलिए ‘I am agree’ गलत है, सीधे ‘I agree’ बोलें।",
    Tamil: "ஆங்கிலத்தில் ‘Agree’ என்பது வினைச்சொல். எனவே ‘I am agree’ என்று கூறாமல் ‘I agree’ என்று கூறவும்.",
    English: "'Agree' is already a verb, so avoid saying 'I am agree'; simply say 'I agree'.",
  },
};

// -------------------------------------------------------------
// AUTHENTICATION & REAL MAIL OTP ENDPOINTS
// -------------------------------------------------------------

// 1. Send Sign-Up OTP to Real Email
app.post('/api/auth/send-signup-otp', async (req, res) => {
  try {
    const { name, email, password, nativeLanguage, englishLevel, countryCode, phoneNumber } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const otp = generateOtp();
    saveOtp(email, otp, 'signup', {
      name,
      email,
      password,
      nativeLanguage,
      englishLevel,
      countryCode: countryCode || '+91',
      phoneNumber: phoneNumber || '',
    });

    // Send real email via nodemailer
    const emailResult = await sendOtpEmail({
      to: email,
      name,
      otp,
      type: 'signup',
    });

    console.log(`[Auth] Sign-up OTP for ${email}: ${otp}`);

    res.json({
      success: true,
      message: `Verification code successfully sent to ${email}.`,
      email,
      previewUrl: emailResult.previewUrl,
      previewCode: otp,
    });
  } catch (err) {
    console.error('Error in send-signup-otp:', err);
    res.status(500).json({ error: err.message || 'Failed to send OTP email.' });
  }
});

// 2. Verify Sign-Up OTP & Create Account
app.post('/api/auth/verify-signup-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const record = getOtpRecord(email, 'signup');
    if (!record) {
      return res.status(400).json({ error: 'Verification code expired or not found. Please request a new one.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ error: 'Incorrect verification code. Please check your email.' });
    }

    // OTP is valid, create user in persistent DB
    const { name, password, nativeLanguage, englishLevel, countryCode, phoneNumber } = record.userData;
    const user = await createUser({
      name,
      email,
      password,
      nativeLanguage: nativeLanguage || 'Telugu',
      englishLevel: englishLevel || 'B1',
      countryCode: countryCode || '+91',
      phoneNumber: phoneNumber || '',
    });

    // Delete used OTP
    deleteOtpRecord(email, 'signup');

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    // Send Welcome to the App email via Gmail
    sendWelcomeEmail({
      to: user.email,
      name: user.name,
      nativeLanguage: user.nativeLanguage,
      level: user.englishLevel,
    }).catch((err) => console.warn('[Email] Welcome email send error:', err.message));

    res.status(201).json({
      success: true,
      message: 'Email verified! Account created successfully.',
      token,
      user,
    });
  } catch (err) {
    console.error('Error in verify-signup-otp:', err);
    res.status(500).json({ error: err.message || 'Verification failed.' });
  }
});

// 3. User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'No account found with this email. Please sign up.' });
    }

    const isMatch = await verifyUserPassword(user, password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password. If you forgot your password, click Forgot Password.' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    // Send Login Security Notification email via Gmail
    sendLoginNotificationEmail({
      to: user.email,
      name: user.name,
    }).catch((err) => console.warn('[Email] Login notification email error:', err.message));

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Social Login (Google & Facebook)
app.post('/api/auth/social-login', async (req, res) => {
  try {
    const { provider, email: userEmail, name: userName } = req.body;
    const providerLabel = provider === 'facebook' ? 'Facebook' : 'Google';
    
    const email = userEmail || `${provider}_user@flunexatalk.com`;
    const name = userName || `${providerLabel} User`;

    let user = findUserByEmail(email);
    if (!user) {
      user = await createUser({
        name,
        email,
        password: Math.random().toString(36).slice(-8) + 'Flunexa!',
        nativeLanguage: 'Telugu',
        englishLevel: 'B1',
        countryCode: '+91',
        phoneNumber: '',
      });
      // Send Welcome email via Gmail
      sendWelcomeEmail({
        to: user.email,
        name: user.name,
        nativeLanguage: user.nativeLanguage,
        level: user.englishLevel,
      }).catch((err) => console.warn('[Email] Welcome email error:', err.message));
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    sendLoginNotificationEmail({
      to: user.email,
      name: user.name,
    }).catch((err) => console.warn('[Email] Login notification error:', err.message));

    res.json({
      success: true,
      message: `Signed in with ${providerLabel} successfully.`,
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error('Error in social-login:', err);
    res.status(500).json({ error: err.message || 'Social login failed.' });
  }
});

// 4. Send Forgot Password OTP
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Please enter your registered email address.' });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email. Please check your spelling or sign up.' });
    }

    const otp = generateOtp();
    saveOtp(email, otp, 'forgot_password', { email, userId: user.id });

    // Send real email via nodemailer
    const emailResult = await sendOtpEmail({
      to: email,
      name: user.name,
      otp,
      type: 'forgot_password',
    });

    console.log(`[Auth] Password Reset OTP for ${email}: ${otp}`);

    res.json({
      success: true,
      message: `Password reset code sent to ${email}.`,
      email,
      previewUrl: emailResult.previewUrl,
      previewCode: otp,
    });
  } catch (err) {
    console.error('Error in forgot-password:', err);
    res.status(500).json({ error: err.message || 'Failed to send reset code.' });
  }
});

// 5. Verify Forgot Password OTP
app.post('/api/auth/verify-reset-otp', (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const record = getOtpRecord(email, 'forgot_password');
    if (!record) {
      return res.status(400).json({ error: 'Verification code expired or not found. Please request a new code.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ error: 'Incorrect verification code. Please check your email.' });
    }

    res.json({
      success: true,
      message: 'Code verified successfully. You can now set a new password or skip.',
    });
  } catch (err) {
    console.error('Error in verify-reset-otp:', err);
    res.status(500).json({ error: 'Failed to verify code.' });
  }
});

// 6. Reset Password OR Skip & Log In Directly
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword, skip } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const record = getOtpRecord(email, 'forgot_password');
    if (!record) {
      return res.status(400).json({ error: 'Reset session expired. Please request a new code.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Delete used OTP
    deleteOtpRecord(email, 'forgot_password');

    let updatedUser = sanitizeUser(user);

    // If NOT skipped, update the new password!
    if (!skip && newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }
      updatedUser = await updateUserPassword(email, newPassword);
      console.log(`[Auth] Password updated successfully for ${email}`);

      // Send Password Changed confirmation email via Gmail
      sendPasswordChangedEmail({
        to: updatedUser.email,
        name: updatedUser.name,
      }).catch((err) => console.warn('[Email] Password changed email error:', err.message));
    } else {
      console.log(`[Auth] User ${email} skipped password update; logging directly into interface`);
    }

    // Generate JWT token so user lands directly into the interface
    const token = jwt.sign({ userId: updatedUser.id, email: updatedUser.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: skip
        ? 'Skipped password update. Logged in directly.'
        : 'Password updated successfully! Welcome back.',
      token,
      user: updatedUser,
      skipped: !!skip,
    });
  } catch (err) {
    console.error('Error in reset-password:', err);
    res.status(500).json({ error: err.message || 'Failed to complete reset.' });
  }
});

// 7. Get Current User Profile
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = findUserById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session token.' });
  }
});

// -------------------------------------------------------------
// PLANS & SUBSCRIPTION ENDPOINTS
// -------------------------------------------------------------

const PLANS_DATA = [
  {
    id: 'free',
    name: 'Free Starter',
    badge: 'Popular for Beginners',
    priceMonthUSD: 0,
    priceMonthINR: 0,
    priceYearUSD: 0,
    priceYearINR: 0,
    description: 'Perfect for getting started with daily 10-minute speaking habit.',
    features: [
      '10-Minute Daily Nexa Robot Voice Call',
      'Basic Grammar & Tense Detection',
      '1 Full Speaking Level Assessment Test',
      'Standard Robot Reactions & Audio Waves',
      'Last 5 Saved Chats Archive',
      'Native Language Hints (Telugu & Hindi)',
    ],
    highlight: false,
    color: '#6366f1',
  },
  {
    id: 'pro',
    name: 'Pro Fluency',
    badge: 'Most Popular ⭐',
    priceMonthUSD: 9.99,
    priceMonthINR: 499,
    priceYearUSD: 79.99,
    priceYearINR: 3999,
    description: 'Accelerate fluency with unlimited talking time and advanced drills.',
    features: [
      'Unlimited Speaking Time with Nexa AI',
      'All 5 Certified Speaking Assessment Tests',
      'Smart Chat Title AI Analysis & Unlimited Saved Chats',
      'Deep Native Explanations in 8+ Languages',
      'Instant Phonetic Pronunciation Coaching',
      'Vocabulary Expansion & Synonyms Radar',
      'Audio Waveform & Pitch Modulation Feedback',
      'Ad-free & Priority Voice Synthesis',
    ],
    highlight: true,
    color: '#8b5cf6',
  },
  {
    id: 'unlimited',
    name: 'Flunexa Unlimited',
    badge: 'Ultimate Fluency 🚀',
    priceMonthUSD: 19.99,
    priceMonthINR: 999,
    priceYearUSD: 149.99,
    priceYearINR: 7499,
    description: 'Comprehensive English fluency mastery for interviews and career growth.',
    features: [
      'Everything in Pro Fluency Plan',
      'Mock Job Interview Simulation (Tech, HR, Sales)',
      'IELTS / TOEFL Speaking Band Score Predictor',
      'Personalized Weekly Progress PDF Dossiers',
      'Custom Voice Characters & Persona Unlocks',
      '1-on-1 Dedicated Pronunciation Diagnosis',
      'Early Access to New AI Speaking Models',
      'Priority 24/7 VIP Support',
    ],
    highlight: false,
    color: '#ec4899',
  },
  {
    id: 'lifetime',
    name: 'Lifetime Founder',
    badge: 'One-Time Payment 👑',
    priceMonthUSD: 99,
    priceMonthINR: 4999,
    priceYearUSD: 99,
    priceYearINR: 4999,
    isOneTime: true,
    description: 'Pay once, keep forever. All current and future updates included.',
    features: [
      'Permanent Lifetime Access to Flunexa Unlimited',
      'Zero recurring monthly or annual subscription fees',
      'Founder VIP Profile Badge in Leaderboard',
      'Unlimited AI Voice Practice forever',
      'Exclusive Beta Access to Vision AI Speaking Coach',
    ],
    highlight: false,
    color: '#f59e0b',
  },
];

app.get('/api/plans', (req, res) => {
  res.json({
    success: true,
    plans: PLANS_DATA,
  });
});

app.post('/api/plans/subscribe', (req, res) => {
  try {
    const { userId, planId, billingCycle = 'monthly', paymentMethod = 'card' } = req.body;

    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required.' });
    }

    const plan = PLANS_DATA.find((p) => p.id === planId);
    if (!plan) {
      return res.status(404).json({ error: 'Selected plan not found.' });
    }

    // If userId provided, update in DB
    let updatedUser = null;
    if (userId) {
      try {
        updatedUser = updateUserPlan(userId, planId);
        if (updatedUser) {
          sendPlanUpgradedEmail({
            to: updatedUser.email,
            name: updatedUser.name,
            planName: plan.name,
            planId,
            billingCycle,
          }).catch((err) => console.warn('[Email] Plan upgrade email error:', err.message));
        }
      } catch (e) {
        console.warn('Could not update user plan in DB:', e.message);
      }
    }

    res.json({
      success: true,
      message: `Successfully subscribed to ${plan.name}! Your account has been upgraded.`,
      planId,
      billingCycle,
      paymentMethod,
      activeUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      user: updatedUser,
    });
  } catch (err) {
    console.error('Error in subscribe:', err);
    res.status(500).json({ error: 'Subscription failed.' });
  }
});

// -------------------------------------------------------------
// SPEECH ANALYSIS & HEALTH CHECK
// -------------------------------------------------------------

// -------------------------------------------------------------
// GOOGLE CLOUD TEXT-TO-SPEECH & TRANSLATION ENDPOINTS
// -------------------------------------------------------------

let ttsClient = null;
let translateClient = null;

try {
  ttsClient = new textToSpeech.TextToSpeechClient();
  translateClient = new translateModule.Translate();
} catch (err) {
  console.warn('[Google Cloud] Could not initialize Google Cloud clients:', err.message);
}

// 1. Google Cloud Text-To-Speech Endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, languageCode = 'en-US', voiceName, ssmlGender = 'FEMALE' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS synthesis.' });
    }

    if (!ttsClient) {
      return res.status(503).json({ error: 'Google Cloud Text-To-Speech client unavailable.' });
    }

    const request = {
      input: { text },
      voice: {
        languageCode,
        name: voiceName,
        ssmlGender,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.95,
        pitch: 0.0,
      },
    };

    const [response] = await ttsClient.synthesizeSpeech(request);
    const audioContent = response.audioContent.toString('base64');

    res.json({
      success: true,
      audioContent,
      languageCode,
    });
  } catch (err) {
    console.error('Error in /api/tts:', err);
    res.status(500).json({ error: err.message || 'TTS synthesis failed.' });
  }
});

// 2. Google Cloud Translation Endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLanguage = 'te' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required for translation.' });
    }

    if (!translateClient) {
      return res.status(503).json({ error: 'Google Cloud Translation client unavailable.' });
    }

    const [translation] = await translateClient.translate(text, targetLanguage);

    res.json({
      success: true,
      translatedText: translation,
      targetLanguage,
    });
  } catch (err) {
    console.error('Error in /api/translate:', err);
    res.status(500).json({ error: err.message || 'Translation failed.' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Flunexa Talk AI Engine', version: '2.0.0' });
});


// Analyze Speech Endpoint
app.post('/api/analyze-speech', (req, res) => {
  const { transcript = '', topic = 'General Speaking', duration = 120, nativeLanguage = 'Telugu' } = req.body;

  const fillerWordsList = ['um', 'uh', 'actually', 'basically', 'like', 'you know'];
  const lower = transcript.toLowerCase();
  let fillerCount = 0;
  const wordMap = {};

  fillerWordsList.forEach((fw) => {
    const reg = new RegExp(`\\b${fw}\\b`, 'gi');
    const matches = lower.match(reg);
    if (matches) {
      wordMap[fw] = matches.length;
      fillerCount += matches.length;
    }
  });

  const mistakes = [];
  if (lower.includes('yesterday') && lower.includes('go')) {
    mistakes.push({
      original: 'Yesterday I go to college.',
      corrected: 'Yesterday I went to college.',
      category: 'Tense',
      severity: 'critical',
      nativeExplanation: NATIVE_EXPLANATIONS.past_tense[nativeLanguage] || NATIVE_EXPLANATIONS.past_tense.English,
      englishExplanation: "Past time markers demand simple past tense ('went').",
    });
  }

  if (lower.includes("don't like") && (lower.includes('he ') || lower.includes('she '))) {
    mistakes.push({
      original: "He don't like cricket.",
      corrected: "He doesn't like cricket.",
      category: 'Subject-Verb Agreement',
      severity: 'critical',
      nativeExplanation: NATIVE_EXPLANATIONS.subject_verb[nativeLanguage] || NATIVE_EXPLANATIONS.subject_verb.English,
      englishExplanation: "Third-person singular takes 'doesn't'.",
    });
  }

  if (lower.includes('am agree')) {
    mistakes.push({
      original: 'I am agree with your opinion.',
      corrected: 'I agree with your opinion.',
      category: 'Natural English',
      severity: 'important',
      nativeExplanation: NATIVE_EXPLANATIONS.state_verbs[nativeLanguage] || NATIVE_EXPLANATIONS.state_verbs.English,
      englishExplanation: "'Agree' is already a verb, do not pair with 'am'.",
    });
  }

  const words = transcript.trim() ? transcript.trim().split(/\s+/).length : 50;
  const wpm = Math.round(words / Math.max(0.5, duration / 60));

  res.json({
    overallScore: Math.round(80 - mistakes.length * 4),
    fluencyScore: Math.min(94, Math.max(68, 76 + (wpm > 100 ? 6 : -3) - fillerCount * 2)),
    grammarScore: Math.max(60, 92 - mistakes.length * 8),
    pronunciationScore: 84,
    wordsPerMinute: wpm,
    fillerWords: {
      count: fillerCount || 3,
      words: Object.entries(wordMap).map(([word, count]) => ({ word, count })),
      improvementPercent: 28,
    },
    mistakes,
    vocabularyRecommendations: [
      { original: 'very good', alternatives: ['exceptional', 'remarkable', 'outstanding'] },
      { original: 'very big', alternatives: ['substantial', 'colossal', 'monumental'] },
    ],
  });
});

// Leaderboard Endpoint
app.get('/api/leaderboard', (req, res) => {
  res.json([
    { rank: 1, name: 'Rahul Sharma', xp: 1420, streak: 18, level: 'B2' },
    { rank: 2, name: 'Bhargav', xp: 1380, streak: 7, level: 'B1', isCurrentUser: true },
    { rank: 3, name: 'Priya Patel', xp: 1240, streak: 12, level: 'B2' },
    { rank: 4, name: 'Ananya Sen', xp: 1110, streak: 9, level: 'C1' },
    { rank: 5, name: 'Karthik Raja', xp: 980, streak: 5, level: 'B1' },
  ]);
});

// Dynamic AI Chat & Question Answering Endpoint (Uses Gemini API Key if available)
app.post('/api/chat', async (req, res) => {
  try {
    const { userMessage, topic, history, avatarName, nativeLanguage } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || !apiKey.trim() || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.json({ success: false, fallback: true, message: 'No Gemini API key configured.' });
    }

    const systemPrompt = `You are ${avatarName || 'Nexa'}, an enthusiastic, friendly, and witty AI English teacher and conversation partner for non-native speakers.
The student's native language is ${nativeLanguage || 'Telugu'}.
Guidelines for your response:
1. Provide a direct, intelligent, and helpful answer to what the user asked (do NOT give generic praise unless relevant).
2. Keep your response concise (2 to 3 sentences max) so it sounds smooth and natural when spoken aloud.
3. If they ask in or mention Telugu/Hindi, you may mix friendly Telugu/Hindi phrases naturally (e.g. "Chala manchidhi!", "Bilkul!").
4. Maintain a warm, encouraging, human-like coach tone.`;

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: `Understood! I am ${avatarName || 'Nexa'}, ready to provide direct, concise, and helpful answers to any question.` }] },
    ];

    if (history && Array.isArray(history)) {
      history.slice(-6).forEach((msg) => {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      }
    );

    const data = await response.json();
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      const aiReply = data.candidates[0].content.parts[0].text.trim();
      return res.json({ success: true, text: aiReply });
    } else {
      console.warn('Gemini API returned unexpected structure:', data);
      return res.json({ success: false, fallback: true });
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error.message);
    return res.json({ success: false, fallback: true });
  }
});

app.listen(PORT, () => {
  console.log(`🤖 Flunexa Talk Backend Server running on port ${PORT}`);
});
