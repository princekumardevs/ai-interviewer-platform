# AI Mock Interviewer Platform — Task Tracker

> Track progress for every task. Update status as you go.  
> **Statuses:** `[ ]` Not Started · `[~]` In Progress · `[x]` Complete · `[!]` Blocked  

---

## Phase 1: Foundation (Weeks 1-2) — Target: 30 hours

### 1.1 Project Initialization & Tooling (~4 hrs)
- [x] 1.1.1 — Initialize Next.js 14 project (TypeScript, Tailwind, App Router, src/ dir)
- [x] 1.1.2 — Git repository setup, .gitignore, initial commit
- [x] 1.1.3 — Install core deps: zustand, @supabase/supabase-js, @supabase/ssr, lucide-react
- [x] 1.1.4 — Configure shadcn/ui, install base components (Button, Card, Input, Dialog, Toast, Badge, Avatar, DropdownMenu, Sheet, Separator, Tabs, Label, Select, Textarea, Progress, Skeleton)
- [x] 1.1.5 — Create .env.local.example with all required env vars
- [x] 1.1.6 — Verify path aliases (@/) work in tsconfig.json

### 1.2 Database & ORM Setup (~5 hrs)
- [x] 1.2.1 — Create Neon PostgreSQL project, add DATABASE_URL to .env.local
- [x] 1.2.2 — Set up Prisma ORM with Neon serverless adapter
- [x] 1.2.3 — Write Prisma schema: User, Account, Session, VerificationToken (NextAuth)
- [x] 1.2.4 — Write Prisma schema: InterviewSession, InterviewMessage, InterviewFeedback
- [x] 1.2.5 — Configure prisma.config.ts with dotenv
- [x] 1.2.6 — Push schema to Neon (prisma db push)
- [x] 1.2.7 — Generate Prisma Client
- [x] 1.2.8 — Create Prisma client singleton (lib/prisma.ts)

### 1.3 Authentication (~6 hrs)
- [x] 1.3.1 — Set up NextAuth.js v5 with JWT strategy
- [x] 1.3.2 — Configure Google OAuth provider
- [x] 1.3.3 — Configure Credentials provider with bcrypt
- [x] 1.3.4 — Build POST /api/auth/register route
- [x] 1.3.5 — Build NextAuth catch-all route ([...nextauth])
- [x] 1.3.6 — Create useAuth hook (useSession wrapper + profile fetch)
- [x] 1.3.7 — Create SessionProvider wrapper (providers.tsx)
- [x] 1.3.8 — Create Next.js middleware for auth (middleware.ts)
- [x] 1.3.9 — Test auth flow end-to-end (Google OAuth + credentials)

### 1.4 Landing Page (~5 hrs)
- [x] 1.4.1 — Build root layout (fonts, metadata, providers)
- [x] 1.4.2 — Build Navbar component (logo, nav links, auth buttons, mobile menu)
- [x] 1.4.3 — Build Hero section (headline, subheadline, CTA buttons)
- [x] 1.4.4 — Build Features section (4 feature cards with icons)
- [x] 1.4.5 — Build How It Works section (3-step process)
- [x] 1.4.6 — Build Footer component
- [x] 1.4.7 — Landing page responsive testing

### 1.5 Auth Pages (~4 hrs)
- [x] 1.5.1 — Build auth layout (centered card)
- [x] 1.5.2 — Build Login page with form, validation, error handling
- [x] 1.5.3 — Build Signup page with full registration form
- [x] 1.5.4 — Add loading states + redirect logic after auth
- [x] 1.5.5 — Test login/signup/redirect flow

### 1.6 Dashboard & User Profile (~6 hrs)
- [x] 1.6.1 — Build dashboard layout (sidebar + topbar + main content)
- [x] 1.6.2 — Build Sidebar component (nav items: Dashboard, New Interview, History, Profile)
- [x] 1.6.3 — Build dashboard home page (welcome, credits remaining, quick start, recent interviews)
- [x] 1.6.4 — Build GET /api/user/profile route
- [x] 1.6.5 — Build PATCH /api/user/profile route
- [x] 1.6.6 — Build Profile page (view/edit form)
- [x] 1.6.7 — Create protected layout (redirect if unauthenticated)
- [x] 1.6.8 — Test dashboard + profile CRUD

### ✅ Phase 1 Milestone Check
- [ ] App loads and deploys to Vercel
- [x] User can sign up, log in, log out
- [x] Dashboard displays after login
- [x] Profile can be viewed and edited
- [x] Database schema pushed to Neon PostgreSQL

---

## Phase 2: Core Features (Weeks 3-5) — Target: 50 hours

### 2.1 Audio Capture & Speech-to-Text (~15 hrs)
- [ ] 2.1.1 — Build useAudioRecorder hook (getUserMedia, capture PCM chunks)
- [ ] 2.1.2 — Implement Voice Activity Detection (volume threshold)
- [ ] 2.1.3 — Build Deepgram client wrapper (lib/deepgram/client.ts)
- [ ] 2.1.4 — Build server-side Deepgram token/proxy route
- [ ] 2.1.5 — Build useTranscription hook (audio → Deepgram WS → text)
- [ ] 2.1.6 — Build AudioVisualizer component (waveform/volume bars)
- [ ] 2.1.7 — Handle mic permission denied / no mic available UX
- [ ] 2.1.8 — Test transcription latency (<500ms target)
- [ ] 2.1.9 — Test across Chrome, Firefox, Safari

### 2.2 AI Interviewer — Claude Integration (~15 hrs)
- [ ] 2.2.1 — Create Anthropic client wrapper (lib/anthropic/client.ts)
- [ ] 2.2.2 — Design system prompts for interviewer persona
- [ ] 2.2.3 — Build role-specific prompt templates (technical, behavioral, mixed)
- [ ] 2.2.4 — Build conversation context manager (history tracking, token management)
- [ ] 2.2.5 — Build POST /api/interviews/create route (decrement credits, create session)
- [ ] 2.2.6 — Build Interview Setup page (select role, type, duration)
- [ ] 2.2.7 — Build InterviewSetupForm component
- [ ] 2.2.8 — Create question bank constants (starter questions per role × type)
- [ ] 2.2.9 — Test Claude responses for different interview scenarios
- [ ] 2.2.10 — Test conversation context is maintained across turns

### 2.3 Text-to-Speech & Full Pipeline (~20 hrs)
- [ ] 2.3.1 — Build OpenAI TTS wrapper (lib/openai/tts.ts) with streaming
- [ ] 2.3.2 — Build audio playback system (queue + play TTS chunks)
- [ ] 2.3.3 — Connect full pipeline: User audio → STT → Claude → TTS → Playback
- [ ] 2.3.4 — Build WebSocket/SSE stream route (api/interview/stream/[session_id])
- [ ] 2.3.5 — Build interview session page (app/(dashboard)/interview/[id]/page.tsx)
- [ ] 2.3.6 — Build InterviewStatus component (listening / thinking / speaking indicators)
- [ ] 2.3.7 — Build InterviewControls component (mute, end, timer)
- [ ] 2.3.8 — Build TranscriptPanel component (real-time scrolling transcript)
- [ ] 2.3.9 — Build Zustand interview store (session state, transcript, status)
- [ ] 2.3.10 — Build useInterview hook (orchestrate lifecycle)
- [ ] 2.3.11 — Save messages to interview_messages table in real-time
- [ ] 2.3.12 — Implement session audio recording → Supabase Storage
- [ ] 2.3.13 — Measure and optimize end-to-end latency (<2s target)
- [ ] 2.3.14 — Handle interview timer / auto-end when duration expires
- [ ] 2.3.15 — Test full interview flow 3+ times

### ✅ Phase 2 Milestone Check
- [ ] User can start an interview and speak with AI
- [ ] Real-time transcription works with <500ms latency
- [ ] AI responds with contextual follow-up questions
- [ ] Voice responses play through TTS
- [ ] Full conversation is saved (transcript + audio)
- [ ] Total pipeline latency is <2 seconds

---

## Phase 3: Polish & Testing (Weeks 6-7) — Target: 30 hours

### 3.1 Feedback System (~10 hrs)
- [ ] 3.1.1 — Build POST /api/interviews/:id/complete route
- [ ] 3.1.2 — Design feedback generation prompt for Claude
- [ ] 3.1.3 — Implement feedback generation (transcript → Claude → structured scores)
- [ ] 3.1.4 — Save feedback to interview_feedback table
- [ ] 3.1.5 — Build GET /api/feedback/:session_id route
- [ ] 3.1.6 — Build feedback report page (scores, radar chart, strengths, improvements)
- [ ] 3.1.7 — Build per-question breakdown view
- [ ] 3.1.8 — Test feedback quality for different interview types

### 3.2 Interview History (~5 hrs)
- [ ] 3.2.1 — Build GET /api/interviews/history route (paginated)
- [ ] 3.2.2 — Build history page (list with filters/sort)
- [ ] 3.2.3 — Build GET /api/interviews/:id route (session details + transcript)
- [ ] 3.2.4 — Build interview detail page (transcript view, audio playback, feedback link)
- [ ] 3.2.5 — Add transcript download (.txt export)

### 3.3 UI Polish (~8 hrs)
- [ ] 3.3.1 — Add Skeleton loading states to all pages
- [ ] 3.3.2 — Add toast notifications for all user actions
- [ ] 3.3.3 — Improve API error handling (error boundaries, retry, fallbacks)
- [ ] 3.3.4 — Add empty states ("No interviews yet", "Start your first interview")
- [ ] 3.3.5 — Responsive design pass (mobile, tablet, desktop)
- [ ] 3.3.6 — WebSocket reconnection logic for dropped connections
- [ ] 3.3.7 — Add interview session recovery (resume after page refresh)

### 3.4 Testing & Performance (~7 hrs)
- [ ] 3.4.1 — Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] 3.4.2 — Performance optimization (lazy loading, code splitting, image opt)
- [ ] 3.4.3 — Build simple API usage tracker (Deepgram chars, Claude tokens, TTS chars)
- [ ] 3.4.4 — Run 5+ end-to-end interviews, log and fix all bugs
- [ ] 3.4.5 — Security review (RLS, API key exposure, auth edge cases)
- [ ] 3.4.6 — Test on slow network (3G throttling)

### ✅ Phase 3 Milestone Check
- [ ] Feedback reports generate correctly with meaningful scores
- [ ] Interview history displays and links to details
- [ ] All pages have loading, empty, and error states
- [ ] App works across major browsers
- [ ] No crashes during full interview flow

---

## Phase 4: Launch (Week 8) — Target: 15 hours

### 4.1 Documentation & Launch
- [ ] 4.1.1 — Write comprehensive README.md (overview, screenshots, tech stack, setup, demo link)
- [ ] 4.1.2 — Record 2-3 minute demo video
- [ ] 4.1.3 — Set up Vercel Analytics
- [ ] 4.1.4 — Final production deploy, verify all env vars
- [ ] 4.1.5 — Write & publish LinkedIn announcement post
- [ ] 4.1.6 — Post on Reddit (r/webdev, r/cscareerquestions)
- [ ] 4.1.7 — Post on Twitter/X with demo clip
- [ ] 4.1.8 — Invite 10-20 beta users

### ✅ Phase 4 Milestone Check
- [ ] README is complete with screenshots and demo link
- [ ] Demo video is recorded and linked
- [ ] App is live in production
- [ ] First beta users have been invited

---

## Summary

| Phase | Tasks | Completed | Status |
|-------|-------|-----------|--------|
| Phase 1: Foundation | 38 | 37 | Nearly Complete |
| Phase 2: Core Features | 39 | 0 | Not Started |
| Phase 3: Polish & Testing | 26 | 0 | Not Started |
| Phase 4: Launch | 8 | 0 | Not Started |
| **Total** | **111** | **37** | **In Progress** |
