import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory OTP store: key -> { email, otp, type, expiresAt, userData }
const otpsStore = new Map();

// Helper to read users
function readUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading users file:', err);
  }
  return [];
}

// Helper to write users
function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing users file:', err);
  }
}

// Initialize default seed user if not present
export async function initDb() {
  const users = readUsers();
  if (users.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('flunexa123', salt);
    const defaultUser = {
      id: 'usr_demo_01',
      name: 'Bhargav',
      email: 'demo@flunexatalk.com',
      passwordHash: demoPasswordHash,
      nativeLanguage: 'Telugu',
      englishLevel: 'B1',
      avatarId: 'nexa',
      plan: 'pro',
      planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      dailyGoalMinutes: 10,
      streak: 7,
      xp: 1380,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    writeUsers([defaultUser]);
    console.log('[DB] Initialized with demo user: demo@flunexatalk.com / flunexa123');
  }
}

export function findUserByEmail(email) {
  if (!email) return null;
  const users = readUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
}

export function findUserById(id) {
  const users = readUsers();
  return users.find((u) => u.id === id) || null;
}

export async function createUser({
  name,
  email,
  password,
  nativeLanguage = 'Telugu',
  englishLevel = 'B1',
  countryCode = '+91',
  phoneNumber = '',
}) {
  const users = readUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    nativeLanguage,
    englishLevel,
    countryCode,
    phoneNumber,
    avatarId: 'nexa',
    plan: 'free',
    planExpiresAt: null,
    dailyGoalMinutes: 10,
    streak: 0,
    xp: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);
  return sanitizeUser(newUser);
}

export async function updateUserPassword(email, newPassword) {
  const users = readUsers();
  const index = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (index === -1) {
    throw new Error('User not found.');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  users[index].passwordHash = passwordHash;
  users[index].updatedAt = new Date().toISOString();
  writeUsers(users);

  return sanitizeUser(users[index]);
}

export function updateUserPlan(userId, planId) {
  const users = readUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    throw new Error('User not found.');
  }

  users[index].plan = planId;
  users[index].planExpiresAt =
    planId === 'free'
      ? null
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  users[index].updatedAt = new Date().toISOString();
  writeUsers(users);

  return sanitizeUser(users[index]);
}

export async function verifyUserPassword(user, password) {
  return bcrypt.compare(password, user.passwordHash);
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

// OTP Operations
export function saveOtp(email, otp, type, userData = null, ttlMinutes = 10) {
  const key = `${type}:${email.toLowerCase().trim()}`;
  otpsStore.set(key, {
    email: email.toLowerCase().trim(),
    otp: otp.trim(),
    type,
    userData,
    expiresAt: Date.now() + ttlMinutes * 60 * 1000,
  });
}

export function getOtpRecord(email, type) {
  const key = `${type}:${email.toLowerCase().trim()}`;
  const record = otpsStore.get(key);
  if (!record) return null;
  if (Date.now() > record.expiresAt) {
    otpsStore.delete(key);
    return null;
  }
  return record;
}

export function deleteOtpRecord(email, type) {
  const key = `${type}:${email.toLowerCase().trim()}`;
  otpsStore.delete(key);
}
