import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import pg from 'pg';

import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data folder exists for local fallback
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory OTP store fallback
const otpsStore = new Map();

// PostgreSQL Connection Pool (Active when DATABASE_URL is set)
let pgPool = null;

export function getPool() {
  if (!pgPool && process.env.DATABASE_URL) {
    try {
      pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
      });
      console.log('🐘 [DB] Initialized PostgreSQL / Supabase connection pool.');
    } catch (err) {
      console.warn('⚠️ [DB] Failed to create PostgreSQL pool, falling back to local file storage:', err.message);
      pgPool = null;
    }
  }
  return pgPool;
}

// Helper to map DB row (snake_case) to application User model (camelCase)
function mapRowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash || row.passwordHash,
    nativeLanguage: row.native_language || row.nativeLanguage || 'Telugu',
    englishLevel: row.english_level || row.englishLevel || 'B1',
    countryCode: row.country_code || row.countryCode || '+91',
    phoneNumber: row.phone_number || row.phoneNumber || '',
    avatarId: row.avatar_id || row.avatarId || 'nexa',
    plan: row.plan || 'free',
    planExpiresAt: row.plan_expires_at || row.planExpiresAt || null,
    dailyGoalMinutes: row.daily_goal_minutes || row.dailyGoalMinutes || 10,
    streak: row.streak || 0,
    xp: row.xp || 0,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  };
}

// Local File DB Helpers
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

function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing users file:', err);
  }
}

// Initialize Database schema and demo account
export async function initDb() {
  const pool = getPool();
  if (pool) {
    try {
      // Create users table in PostgreSQL / Supabase
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          native_language VARCHAR(50) DEFAULT 'Telugu',
          english_level VARCHAR(20) DEFAULT 'B1',
          country_code VARCHAR(10) DEFAULT '+91',
          phone_number VARCHAR(30) DEFAULT '',
          avatar_id VARCHAR(50) DEFAULT 'nexa',
          plan VARCHAR(50) DEFAULT 'free',
          plan_expires_at TIMESTAMP WITH TIME ZONE,
          daily_goal_minutes INT DEFAULT 10,
          streak INT DEFAULT 0,
          xp INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS otps (
          key VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          otp VARCHAR(10) NOT NULL,
          type VARCHAR(50) NOT NULL,
          user_data JSONB,
          expires_at BIGINT NOT NULL
        );
      `);
      console.log('✅ [PostgreSQL] Schema verified: users & otps tables ready.');

      // Check for demo user
      const res = await pool.query('SELECT id FROM users WHERE email = $1', ['demo@flunexatalk.com']);
      if (res.rows.length === 0) {
        const salt = await bcrypt.genSalt(10);
        const demoPasswordHash = await bcrypt.hash('flunexa123', salt);
        await pool.query(
          `INSERT INTO users (id, name, email, password_hash, native_language, english_level, avatar_id, plan, xp, streak)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          ['usr_demo_01', 'Bhargav', 'demo@flunexatalk.com', demoPasswordHash, 'Telugu', 'B1', 'nexa', 'pro', 1380, 7]
        );
        console.log('🌱 [PostgreSQL] Seeded default user: demo@flunexatalk.com / flunexa123');
      }
      return;
    } catch (err) {
      console.error('❌ [PostgreSQL] initDb error:', err.message);
    }
  }

  // Fallback to local file storage
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
    console.log('[Local DB] Initialized with demo user: demo@flunexatalk.com / flunexa123');
  }
}

// User Lookups
export async function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();

  const pool = getPool();
  if (pool) {
    try {
      const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [cleanEmail]);
      if (res.rows.length > 0) return mapRowToUser(res.rows[0]);
      return null;
    } catch (err) {
      console.error('[PostgreSQL] findUserByEmail error:', err.message);
    }
  }

  const users = readUsers();
  return users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
}

export async function findUserById(id) {
  if (!id) return null;

  const pool = getPool();
  if (pool) {
    try {
      const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      if (res.rows.length > 0) return mapRowToUser(res.rows[0]);
      return null;
    } catch (err) {
      console.error('[PostgreSQL] findUserById error:', err.message);
    }
  }

  const users = readUsers();
  return users.find((u) => u.id === id) || null;
}

// Create User
export async function createUser({
  name,
  email,
  password,
  nativeLanguage = 'Telugu',
  englishLevel = 'B1',
  countryCode = '+91',
  phoneNumber = '',
}) {
  const cleanEmail = email.toLowerCase().trim();
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  const pool = getPool();
  if (pool) {
    try {
      const res = await pool.query(
        `INSERT INTO users (id, name, email, password_hash, native_language, english_level, country_code, phone_number, avatar_id, plan, daily_goal_minutes, streak, xp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [id, name.trim(), cleanEmail, passwordHash, nativeLanguage, englishLevel, countryCode, phoneNumber, 'nexa', 'free', 10, 0, 0]
      );
      return sanitizeUser(mapRowToUser(res.rows[0]));
    } catch (err) {
      if (err.code === '23505') {
        throw new Error('An account with this email already exists.');
      }
      console.error('[PostgreSQL] createUser error:', err.message);
      throw err;
    }
  }

  const users = readUsers();
  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const newUser = {
    id,
    name: name.trim(),
    email: cleanEmail,
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

// Update Password
export async function updateUserPassword(email, newPassword) {
  const cleanEmail = email.toLowerCase().trim();
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  const pool = getPool();
  if (pool) {
    try {
      const res = await pool.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE LOWER(email) = LOWER($2) RETURNING *',
        [passwordHash, cleanEmail]
      );
      if (res.rows.length === 0) throw new Error('User not found.');
      return sanitizeUser(mapRowToUser(res.rows[0]));
    } catch (err) {
      console.error('[PostgreSQL] updateUserPassword error:', err.message);
      throw err;
    }
  }

  const users = readUsers();
  const index = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
  if (index === -1) {
    throw new Error('User not found.');
  }

  users[index].passwordHash = passwordHash;
  users[index].updatedAt = new Date().toISOString();
  writeUsers(users);

  return sanitizeUser(users[index]);
}

// Update Plan
export async function updateUserPlan(userId, planId) {
  const planExpiresAt = planId === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const pool = getPool();
  if (pool) {
    try {
      const res = await pool.query(
        'UPDATE users SET plan = $1, plan_expires_at = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
        [planId, planExpiresAt, userId]
      );
      if (res.rows.length === 0) throw new Error('User not found.');
      return sanitizeUser(mapRowToUser(res.rows[0]));
    } catch (err) {
      console.error('[PostgreSQL] updateUserPlan error:', err.message);
      throw err;
    }
  }

  const users = readUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    throw new Error('User not found.');
  }

  users[index].plan = planId;
  users[index].planExpiresAt = planExpiresAt;
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
export async function saveOtp(email, otp, type, userData = null, ttlMinutes = 10) {
  const cleanEmail = email.toLowerCase().trim();
  const key = `${type}:${cleanEmail}`;
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;

  const pool = getPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO otps (key, email, otp, type, user_data, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (key) DO UPDATE
         SET otp = $3, user_data = $5, expires_at = $6`,
        [key, cleanEmail, otp.trim(), type, userData ? JSON.stringify(userData) : null, expiresAt]
      );
    } catch (err) {
      console.error('[PostgreSQL] saveOtp error:', err.message);
    }
  }

  // Also cache in memory
  otpsStore.set(key, {
    email: cleanEmail,
    otp: otp.trim(),
    type,
    userData,
    expiresAt,
  });
}

export async function getOtpRecord(email, type) {
  const cleanEmail = email.toLowerCase().trim();
  const key = `${type}:${cleanEmail}`;

  const pool = getPool();
  if (pool) {
    try {
      const res = await pool.query('SELECT * FROM otps WHERE key = $1', [key]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        if (Date.now() > Number(row.expires_at)) {
          await pool.query('DELETE FROM otps WHERE key = $1', [key]);
          return null;
        }
        return {
          email: row.email,
          otp: row.otp,
          type: row.type,
          userData: row.user_data,
          expiresAt: Number(row.expires_at),
        };
      }
    } catch (err) {
      console.error('[PostgreSQL] getOtpRecord error:', err.message);
    }
  }

  const record = otpsStore.get(key);
  if (!record) return null;
  if (Date.now() > record.expiresAt) {
    otpsStore.delete(key);
    return null;
  }
  return record;
}

export async function deleteOtpRecord(email, type) {
  const cleanEmail = email.toLowerCase().trim();
  const key = `${type}:${cleanEmail}`;

  const pool = getPool();
  if (pool) {
    try {
      await pool.query('DELETE FROM otps WHERE key = $1', [key]);
    } catch (err) {
      console.error('[PostgreSQL] deleteOtpRecord error:', err.message);
    }
  }

  otpsStore.delete(key);
}
