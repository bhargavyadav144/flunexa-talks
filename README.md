# SpeakUp AI — Spoken English Practice Platform

**“Speak. Improve. Become Fluent.”**

SpeakUp AI is a modern, commercial-ready EdTech platform that combines the gamified motivation of Duolingo, the personal attention of an AI tutor, and the rigor of standardized speaking tests.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Frontend
```bash
npm run dev
```
The application will be live at `http://localhost:5173/`.

### 3. Run Backend (Optional API Server)
```bash
npm run server
```
The Express backend runs on `http://localhost:5000/`.

---

## 📂 Key Architecture

- **`src/components/avatar/TeacherAvatar.tsx`**: Animated cartoon AI teacher character with lip-sync, blinking eyes, and dynamic mood expressions (Alex, Mia, Aria, Leo).
- **`src/components/practice/RealtimeConversation.tsx`**: Voice Activity Detection (VAD) audio call interface.
- **`src/components/practice/DailyTenMode.tsx`**: Signature 10-minute 4-stage speaking workout (Warm-up, Topic Speaking, Opinion, Rapid Fire).
- **`src/components/tests/`**: Test Center housing Read Aloud, Repeat After AI, Read & Speak, Picture Description, and the 18-slice Spinning Wheel challenge.
- **`src/services/aiService.ts`**: Linguistic analysis engine with native explanations in **Telugu, Hindi, Tamil, Kannada, Malayalam, Bengali, Marathi, Gujarati, and English**.
- **`server/schema.sql`**: Complete PostgreSQL & Supabase database schema for production deployments.
