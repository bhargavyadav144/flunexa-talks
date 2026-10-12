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
  saveChatRecord,
  getUserSavedChats,
  deleteChatRecord,
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

// Initialize DB asynchronously without blocking serverless boot
initDb().catch((err) => {
  console.warn('⚠️ [DB] Background initDb notice:', err.message);
});

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

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const otp = generateOtp();
    await saveOtp(email, otp, 'signup', {
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

    const record = await getOtpRecord(email, 'signup');
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
    await deleteOtpRecord(email, 'signup');

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

    const user = await findUserByEmail(email);
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

    let user = await findUserByEmail(email);
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

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email. Please check your spelling or sign up.' });
    }

    const otp = generateOtp();
    await saveOtp(email, otp, 'forgot_password', { email, userId: user.id });

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
app.post('/api/auth/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }

    const record = await getOtpRecord(email, 'forgot_password');
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

    const record = await getOtpRecord(email, 'forgot_password');
    if (!record) {
      return res.status(400).json({ error: 'Reset session expired. Please request a new code.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Delete used OTP
    await deleteOtpRecord(email, 'forgot_password');

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
app.get('/api/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(decoded.userId);
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

// Dynamic AI Chat & Question Answering Endpoint (Gemini Flash with Anti-Repetition & Language Adherence)
app.post('/api/chat', async (req, res) => {
  try {
    const { userMessage, topic, history, avatarName, nativeLanguage, askedQuestions, discussedTopics } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || !apiKey.trim() || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key is not configured on the server.',
      });
    }

    if (!userMessage || !userMessage.trim()) {
      return res.status(400).json({ success: false, error: 'User message is required.' });
    }

    const cleanLanguage = nativeLanguage || 'Telugu';
    const cleanTopic = topic || 'General Daily English Conversation';
    const questionsList = Array.isArray(askedQuestions) && askedQuestions.length > 0
      ? askedQuestions.map((q, idx) => `${idx + 1}. "${q}"`).join('\n')
      : '(No questions asked yet in this session)';
    const topicsList = Array.isArray(discussedTopics) && discussedTopics.length > 0
      ? discussedTopics.join(', ')
      : cleanTopic;

    const systemPrompt = `You are Flunexa AI Coach, an intelligent, real-time conversational AI speaking tutor.
Your name is ${avatarName || 'Nexa'}.
User's native language preference: ${cleanLanguage}.
Current practice topic: "${cleanTopic}".

CORE CONVERSATIONAL PRINCIPLES:
1. VOICE CADENCE: Keep spoken responses natural, lively, and concise (1 to 3 sentences maximum, approx. 20-45 words). Do not give long lectures.
2. ANSWER DIRECTLY: If the student asks you a question or seeks an explanation (e.g. "Introduce ante enti?", "what does that mean?"), answer their actual question first before asking any follow-up.

AUTOMATIC MULTILINGUAL CONVERSATION & REPLY RULES:
1. DETECT THE LANGUAGE OF THE USER'S ACTUAL SPEECH / MESSAGE:
   - If the user communicates in TELUGU (Telugu script like 'నమస్కారం', 'మీరు ఎలా ఉన్నారు?' OR Romanized Telugu like 'nenu bagunnanu', 'meeru em chestunnaru', 'introduce ante enti'):
     -> You MUST reply in natural, authentic TELUGU (using Telugu script)!
     -> Understand their intent accurately and converse warmly in Telugu.
     -> Do NOT force an English response when the user speaks Telugu.
   - If the user communicates in HINDI (Devanagari like 'नमस्ते' OR Romanized Hindi like 'kaise ho', 'aaj kya chal raha hai'):
     -> You MUST reply in natural HINDI (using Devanagari script)!
   - If the user communicates in ENGLISH:
     -> Reply in natural, simple ENGLISH!
   - If the user communicates in mixed Telugu + English (Tanglish):
     -> Understand both languages and reply naturally in the dominant conversational style.
   - If the user explicitly asks "తెలుగులో చెప్పు" or "reply in English", respect their explicit language instruction immediately for that response.

STRICT ENGLISH GRAMMAR CORRECTION RULE (CRITICAL & MANDATORY):
- If the user is speaking/practising English and makes an English grammar mistake (e.g., "Yesterday I go to college", "He don't like cricket", "I am agree", "one of my friend"):
  -> You MUST explain and correct that mistake in ENGLISH ONLY!
  -> NEVER explain English grammar mistakes in Telugu, Hindi, or any other language, even if the student's native language is Telugu.
  -> Example format:
     'Your sentence should be: "Yesterday, I went to college." We use "went" because the action happened in the past. Now try another sentence using the past tense.'
- BUT if the user asks a normal question or converses in Telugu (e.g., "Introduce ante enti?", "ఈరోజు ఏం వండారు?"), this is NOT an English grammar exercise! Answer in TELUGU directly!

MANDATORY NO-REPETITION POLICY:
Previously asked questions in this chat:
${questionsList}

Previously touched topics:
${topicsList}

- You must NEVER ask any question from the list above, nor close paraphrases (e.g., NEVER repeat morning routine, breakfast, waking habits, college schedule if already asked).
- Generate a dynamic, fresh question inspired by the user's latest response.
- When a topic feels covered, change topics naturally (e.g., favourite films, street food, dream travel destinations, memorable childhood stories, future ambitions).
ANIMATION EMOTION DIRECTIVE:
At the very end of your response, on a new line, append an internal emotion tag:
[EMOTION: explaining | correcting | celebrating | encouraging | empathetic | curious | playful | neutral]
- Use 'correcting' when explaining an English grammar mistake.
- Use 'celebrating' when the user speaks accurately, corrects a past mistake, or achieves a speaking milestone.
- Use 'explaining' when teaching a concept, vocabulary word, or answering a question directly.
- Use 'encouraging' when urging the student to try speaking or giving friendly support.
- Use 'empathetic' when the user expresses frustration, confusion, or difficulty.
- Use 'curious' when asking an engaging conversational follow-up question.
- Use 'playful' when sharing lighthearted banter.
- Use 'neutral' for calm everyday conversation.`;

    // Construct valid alternating Gemini contents
    const contents = [];

    if (history && Array.isArray(history)) {
      const recent = history.slice(-8);
      for (const msg of recent) {
        if (!msg.text || !msg.text.trim()) continue;
        const role = msg.sender === 'user' ? 'user' : 'model';
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts[0].text += '\n' + msg.text.trim();
        } else {
          contents.push({
            role,
            parts: [{ text: msg.text.trim() }],
          });
        }
      }
    }

    // Ensure the last message is the new userMessage with role 'user'
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts[0].text += '\n' + userMessage.trim();
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: userMessage.trim() }],
      });
    }

    // Ensure first message has role 'user'
    if (contents.length > 0 && contents[0].role !== 'user') {
      contents.unshift({
        role: 'user',
        parts: [{ text: 'Hello!' }],
      });
    }

    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 280,
      },
    };

    const CANDIDATE_MODELS = [
      'gemini-3.7-flash',
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
      'gemini-3.8-flash',
    ];

    let lastError = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const parts = data.candidates?.[0]?.content?.parts;
          if (parts && parts.length > 0) {
            const aiReply = parts
              .filter((p) => p.text && !p.thought)
              .map((p) => p.text)
              .join('\n')
              .trim();

            if (aiReply) {
              let emotion = 'neutral';
              let cleanText = aiReply;
              const emotionMatch = cleanText.match(/\[EMOTION:\s*([a-zA-Z_]+)\]/i);
              if (emotionMatch) {
                emotion = emotionMatch[1].toLowerCase();
                cleanText = cleanText.replace(/\[EMOTION:\s*[a-zA-Z_]+\]/i, '').trim();
              } else {
                // Heuristic fallback for emotion
                if (/your sentence should be|mistake|instead of|try to say/i.test(cleanText)) {
                  emotion = 'correcting';
                } else if (/great job|well done|excellent|perfect|superb|awesome|బలే|అద్భుతం|శాబాష్/i.test(cleanText)) {
                  emotion = 'celebrating';
                } else if (/try|can you try|repeat|let's practice/i.test(cleanText)) {
                  emotion = 'encouraging';
                } else if (/meaning|means|అంటే|వివరిస్తాను|కారణం|samjhao/i.test(cleanText)) {
                  emotion = 'explaining';
                } else if (/understand|difficult|hard|don't worry|no problem|relax/i.test(cleanText)) {
                  emotion = 'empathetic';
                } else if (/\?$/.test(cleanText)) {
                  emotion = 'curious';
                }
              }

              const replyLang = /[\u0C00-\u0C7F]/.test(cleanText) ? 'Telugu' : /[\u0900-\u097F]/.test(cleanText) ? 'Hindi' : 'English';
              return res.json({
                success: true,
                text: cleanText,
                emotion,
                detectedLanguage: replyLang,
                model,
              });
            }
          }
        } else {
          const errData = await response.text();
          lastError = `Model ${model} returned ${response.status}: ${errData}`;
          console.warn(`[Gemini API] ${model} unavailable (${response.status}), trying next candidate...`);
        }
      } catch (reqErr) {
        lastError = reqErr.message;
      }
    }

    console.error('All Gemini candidate models failed:', lastError);
    return res.status(502).json({
      success: false,
      error: 'AI service temporarily unavailable. Please try again in a moment.',
      details: lastError,
    });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal AI service error.',
    });
  }
});

// -------------------------------------------------------------
// SAVED CHATS API ENDPOINTS
// -------------------------------------------------------------

// Save completed conversation
app.post('/api/chats/save', async (req, res) => {
  try {
    const chatData = req.body;
    if (!chatData) {
      return res.status(400).json({ error: 'Chat data is required.' });
    }

    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        userId = decoded.userId;
      } catch (e) {}
    }

    const saved = await saveChatRecord(chatData, userId);
    console.log(`[Chats] Successfully saved chat "${saved.title}" (ID: ${saved.id})`);
    return res.json({ success: true, chat: saved });
  } catch (err) {
    console.error('Error saving chat:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to save conversation.' });
  }
});

// Fetch saved conversations
app.get('/api/chats', async (req, res) => {
  try {
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        userId = decoded.userId;
      } catch (e) {}
    }

    const chats = await getUserSavedChats(userId);
    return res.json({ success: true, chats });
  } catch (err) {
    console.error('Error fetching chats:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch conversations.' });
  }
});

// Delete saved conversation
app.delete('/api/chats/:id', async (req, res) => {
  try {
    const chatId = req.params.id;
    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID is required.' });
    }

    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        userId = decoded.userId;
      } catch (e) {}
    }

    await deleteChatRecord(chatId, userId);
    console.log(`[Chats] Deleted chat ID: ${chatId}`);
    return res.json({ success: true, message: 'Conversation deleted successfully.' });
  } catch (err) {
    console.error('Error deleting chat:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to delete conversation.' });
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🤖 Flunexa Talk Backend Server running on port ${PORT}`);
  });
}

export default app;
