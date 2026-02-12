# AI Mock Interviewer Platform — Implementation Plan

> **Project Type:** Portfolio / Resume Project  
> **Developer:** Solo (part-time, 15-20 hrs/week)  
> **Timeline:** 8-10 weeks  
> **Start Date:** February 12, 2026  

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 + React 18 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| STT | Deepgram (WebSocket streaming) |
| LLM | Claude Sonnet 4 (Anthropic API) |
| TTS | OpenAI TTS API |
| Storage | Supabase Storage |
| Hosting | Vercel |

---

## Project Directory Structure (Target)

```
ai-interviewer-platform/
├── docs/                          # Existing documentation
├── public/                        # Static assets (icons, images)
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # Auth route group
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/           # Protected route group
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── interview/
│   │   │   │   ├── [id]/page.tsx  # Active interview session
│   │   │   │   └── new/page.tsx   # Interview setup/config
│   │   │   ├── history/page.tsx
│   │   │   ├── feedback/[id]/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/                   # API routes
│   │   │   ├── auth/
│   │   │   │   ├── signup/route.ts
│   │   │   │   ├── login/route.ts
│   │   │   │   └── logout/route.ts
│   │   │   ├── user/
│   │   │   │   └── profile/route.ts
│   │   │   ├── interviews/
│   │   │   │   ├── create/route.ts
│   │   │   │   ├── [id]/route.ts
│   │   │   │   ├── [id]/complete/route.ts
│   │   │   │   └── history/route.ts
│   │   │   ├── feedback/
│   │   │   │   └── [session_id]/route.ts
│   │   │   └── interview/
│   │   │       └── stream/[session_id]/route.ts  # WebSocket
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Landing page
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── landing/               # Landing page sections
│   │   ├── auth/                  # Auth forms
│   │   ├── dashboard/             # Dashboard widgets
│   │   ├── interview/             # Interview UI components
│   │   │   ├── AudioVisualizer.tsx
│   │   │   ├── InterviewControls.tsx
│   │   │   ├── InterviewStatus.tsx
│   │   │   ├── TranscriptPanel.tsx
│   │   │   └── InterviewSetupForm.tsx
│   │   ├── feedback/              # Feedback display
│   │   └── shared/                # Shared/layout components
│   │       ├── Navbar.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser Supabase client
│   │   │   ├── server.ts          # Server Supabase client
│   │   │   └── middleware.ts      # Auth middleware
│   │   ├── deepgram/
│   │   │   └── client.ts          # Deepgram STT integration
│   │   ├── anthropic/
│   │   │   ├── client.ts          # Claude API client
│   │   │   └── prompts.ts         # Interviewer prompt templates
│   │   ├── openai/
│   │   │   └── tts.ts             # OpenAI TTS integration
│   │   └── utils.ts               # Shared utilities
│   ├── hooks/
│   │   ├── useAudioRecorder.ts    # Mic capture + VAD
│   │   ├── useInterview.ts        # Interview session state
│   │   ├── useTranscription.ts    # Real-time transcription
│   │   └── useAuth.ts             # Auth state hook
│   ├── stores/
│   │   ├── authStore.ts           # Zustand auth store
│   │   └── interviewStore.ts      # Zustand interview store
│   ├── types/
│   │   ├── database.ts            # Supabase generated types
│   │   ├── interview.ts           # Interview-related types
│   │   └── api.ts                 # API request/response types
│   └── constants/
│       ├── interview.ts           # Roles, types, durations
│       └── prompts.ts             # System prompts
├── supabase/
│   └── migrations/                # SQL migration files
│       └── 001_initial_schema.sql
├── .env.local.example             # Example env vars
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Phase 1: Foundation (Weeks 1-2) — 30 hours

### 1.1 Project Initialization & Tooling (Week 1, ~4 hrs)

| # | Task | Details |
|---|------|---------|
| 1.1.1 | Initialize Next.js project | `npx create-next-app@14` with TypeScript, Tailwind, App Router, `src/` dir |
| 1.1.2 | Git setup | Initialize repo, `.gitignore`, initial commit |
| 1.1.3 | Install core dependencies | `zustand`, `@supabase/supabase-js`, `@supabase/ssr`, `lucide-react` |
| 1.1.4 | Configure shadcn/ui | `npx shadcn-ui@latest init`, add Button, Card, Input, Dialog, Toast, etc. |
| 1.1.5 | Create `.env.local.example` | List all required env vars with placeholder values |
| 1.1.6 | Set up path aliases | Verify `@/` alias works in `tsconfig.json` |

### 1.2 Supabase Setup & Database Schema (Week 1, ~5 hrs)

| # | Task | Details |
|---|------|---------|
| 1.2.1 | Create Supabase project | New project on supabase.com, copy keys |
| 1.2.2 | Write initial migration SQL | Tables: `users`, `interview_sessions`, `interview_messages`, `interview_feedback` |
| 1.2.3 | Configure RLS policies | Row-level security so users can only access their own data |
| 1.2.4 | Create Supabase client helpers | `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server) |
| 1.2.5 | Set up Supabase Storage bucket | `recordings` bucket for interview audio files |
| 1.2.6 | Generate TypeScript types | From Supabase schema → `types/database.ts` |

### 1.3 Authentication (Week 1, ~6 hrs)

| # | Task | Details |
|---|------|---------|
| 1.3.1 | Configure Supabase Auth | Enable email/password provider in Supabase dashboard |
| 1.3.2 | Create auth middleware | `middleware.ts` for protecting routes, refreshing sessions |
| 1.3.3 | Build signup API route | `POST /api/auth/signup` — create user + profile row |
| 1.3.4 | Build login API route | `POST /api/auth/login` — authenticate + return session |
| 1.3.5 | Build logout API route | `POST /api/auth/logout` — destroy session |
| 1.3.6 | Create `useAuth` hook | Check auth state, expose `user`, `signIn`, `signUp`, `signOut` |
| 1.3.7 | Create Zustand auth store | Persist auth state client-side |

### 1.4 Landing Page (Week 2, ~5 hrs)

| # | Task | Details |
|---|------|---------|
| 1.4.1 | Design landing page layout | Hero, features grid, how-it-works, CTA |
| 1.4.2 | Build Hero section | Headline, subheadline, CTA buttons, illustration/animation |
| 1.4.3 | Build Features section | 3-4 feature cards (Real-time voice, AI feedback, Customizable, etc.) |
| 1.4.4 | Build How It Works section | 3-step process visual |
| 1.4.5 | Build Footer + Navbar | Navigation, links, responsive mobile menu |

### 1.5 Auth Pages (Week 2, ~4 hrs)

| # | Task | Details |
|---|------|---------|
| 1.5.1 | Build Login page | Email/password form, validation, error states, redirect to dashboard |
| 1.5.2 | Build Signup page | Full registration form (email, password, name, role, experience level) |
| 1.5.3 | Auth layout | Centered card layout for auth pages |
| 1.5.4 | Add form validation | Client-side validation with error messages |

### 1.6 Dashboard & Profile (Week 2, ~6 hrs)

| # | Task | Details |
|---|------|---------|
| 1.6.1 | Build dashboard layout | Sidebar + main content area, responsive |
| 1.6.2 | Build dashboard page | Welcome message, interviews remaining, quick-start CTA, recent interviews |
| 1.6.3 | Build profile page | View/edit name, target role, experience level |
| 1.6.4 | Profile API routes | `GET /api/user/profile`, `PATCH /api/user/profile` |
| 1.6.5 | Create protected layout | Redirect to login if unauthenticated |

### Phase 1 Deliverables
- [ ] Working Next.js app with auth flow
- [ ] Supabase database with schema + RLS
- [ ] Landing page, login, signup, dashboard, profile pages
- [ ] Deployed to Vercel (initial deployment)

---

## Phase 2: Core Features (Weeks 3-5) — 50 hours

### 2.1 Audio Capture & Speech-to-Text (Week 3, ~15 hrs)

| # | Task | Details |
|---|------|---------|
| 2.1.1 | Build `useAudioRecorder` hook | Access microphone via `navigator.mediaDevices.getUserMedia()`, capture PCM audio chunks |
| 2.1.2 | Implement Voice Activity Detection | Detect silence/speech using volume threshold analysis on AudioContext |
| 2.1.3 | Create Deepgram client wrapper | `lib/deepgram/client.ts` — WebSocket connection to Deepgram streaming API |
| 2.1.4 | Build STT API route | Server-side proxy for Deepgram WebSocket (keep API key server-side) |
| 2.1.5 | Build `useTranscription` hook | Connect audio stream → Deepgram → return real-time transcript text |
| 2.1.6 | Create AudioVisualizer component | Waveform or volume bars showing audio input level |
| 2.1.7 | Test microphone permissions UX | Handle denied permissions, no mic available, browser compatibility |
| 2.1.8 | Test transcription accuracy | Verify latency <500ms, accuracy across accents |

### 2.2 AI Interviewer — Claude Integration (Week 4, ~15 hrs)

| # | Task | Details |
|---|------|---------|
| 2.2.1 | Create Anthropic client wrapper | `lib/anthropic/client.ts` — Claude API with streaming support |
| 2.2.2 | Design system prompts | Interviewer persona prompt for technical, behavioral, mixed interviews |
| 2.2.3 | Build prompt templates | Dynamic prompts based on role, experience level, interview type |
| 2.2.4 | Implement conversation context manager | Maintain message history, truncate if too long, keep system prompt |
| 2.2.5 | Build interview creation flow | `POST /api/interviews/create` — decrement credits, create session |
| 2.2.6 | Build interview setup page | Form: select role, type, duration → start interview |
| 2.2.7 | Create question bank constants | Starter questions for each role × type combination |
| 2.2.8 | Test interview scenarios | Technical, behavioral, mixed for different roles and levels |

### 2.3 Text-to-Speech & Full Pipeline (Week 5, ~20 hrs)

| # | Task | Details |
|---|------|---------|
| 2.3.1 | Create OpenAI TTS wrapper | `lib/openai/tts.ts` — generate audio from text, streaming |
| 2.3.2 | Build audio playback system | Play TTS audio chunks in browser, queue management |
| 2.3.3 | Connect full pipeline | User speaks → STT → Claude → TTS → Audio playback |
| 2.3.4 | Build WebSocket stream route | `api/interview/stream/[session_id]` — orchestrate pipeline server-side |
| 2.3.5 | Build interview session UI | Full-screen interview view with status states (listening/processing/speaking) |
| 2.3.6 | Build `InterviewControls` component | Mute, end interview, timer display |
| 2.3.7 | Build `TranscriptPanel` component | Real-time scrolling transcript sidebar |
| 2.3.8 | Build `InterviewStatus` component | Visual indicator of AI state (listening/thinking/speaking) |
| 2.3.9 | Implement session recording | Record full audio to Supabase Storage |
| 2.3.10 | Save messages to database | Store each message (user + assistant) in `interview_messages` |
| 2.3.11 | Build interview Zustand store | Track session state, transcript, timer, status |
| 2.3.12 | Build `useInterview` hook | Orchestrate the full interview lifecycle |
| 2.3.13 | Optimize end-to-end latency | Target <2 seconds total pipeline time |

### Phase 2 Deliverables
- [ ] Working audio capture → transcription pipeline
- [ ] AI interviewer with contextual follow-ups
- [ ] Full voice conversation loop (STT → LLM → TTS)
- [ ] Interview session UI with controls and transcript
- [ ] Session recording and message persistence

---

## Phase 3: Polish & Testing (Weeks 6-7) — 30 hours

### 3.1 Feedback System (Week 6, ~10 hrs)

| # | Task | Details |
|---|------|---------|
| 3.1.1 | Build `POST /api/interviews/:id/complete` | Mark session complete, trigger feedback generation |
| 3.1.2 | Build feedback generation with Claude | Send full transcript → Claude → structured feedback JSON |
| 3.1.3 | Design scoring rubric prompt | Technical depth, communication, structure, confidence (1-100 each) |
| 3.1.4 | Save feedback to database | Store in `interview_feedback` table |
| 3.1.5 | Build `GET /api/feedback/:session_id` | Return feedback for a session |
| 3.1.6 | Build feedback report page | Score cards, radar chart, strengths, improvements, per-question breakdown |

### 3.2 Interview History (Week 6, ~5 hrs)

| # | Task | Details |
|---|------|---------|
| 3.2.1 | Build `GET /api/interviews/history` | Paginated list of past interviews |
| 3.2.2 | Build history page | List with status, date, type, score, link to details |
| 3.2.3 | Build interview detail page | Transcript view, audio playback, link to feedback |
| 3.2.4 | Add transcript download | Export as .txt or .md |

### 3.3 UI Polish & Error Handling (Week 7, ~8 hrs)

| # | Task | Details |
|---|------|---------|
| 3.3.1 | Add loading skeletons | Dashboard, history, feedback pages |
| 3.3.2 | Add toast notifications | Success/error feedback on actions |
| 3.3.3 | Improve error handling | API error boundaries, graceful fallbacks, retry logic |
| 3.3.4 | Responsive design pass | Test and fix layout on mobile, tablet, desktop |
| 3.3.5 | Add empty states | No interviews yet, no feedback, etc. |
| 3.3.6 | Connection recovery | Handle WebSocket drops during interview, attempt reconnect |

### 3.4 Testing & Performance (Week 7, ~7 hrs)

| # | Task | Details |
|---|------|---------|
| 3.4.1 | Cross-browser testing | Chrome, Firefox, Safari, Edge |
| 3.4.2 | Performance optimization | Lazy loading, code splitting, image optimization |
| 3.4.3 | API cost tracking | Log API usage, verify staying within budget |
| 3.4.4 | End-to-end self-testing | Run 5+ full interviews, find and fix bugs |
| 3.4.5 | Security review | Verify RLS, API key exposure, auth edge cases |

### Phase 3 Deliverables
- [ ] Feedback reports with detailed scoring
- [ ] Interview history with transcript viewing
- [ ] Polished, responsive UI with loading/error states
- [ ] Tested across browsers, stable application

---

## Phase 4: Launch (Week 8) — 15 hours

### 4.1 Documentation & Launch (Week 8)

| # | Task | Details |
|---|------|---------|
| 4.1.1 | Write README.md | Project overview, screenshots, tech stack, setup instructions, demo link |
| 4.1.2 | Record demo video | 2-3 minute walkthrough of key features |
| 4.1.3 | Set up Vercel Analytics | Monitor performance, page views |
| 4.1.4 | Final deployment | Production environment, verify all env vars |
| 4.1.5 | Social media launch | LinkedIn post, Reddit (r/webdev, r/cscareerquestions), Twitter/X |
| 4.1.6 | Invite beta users | Share with 10-20 friends/colleagues |

### Phase 4 Deliverables
- [ ] Public GitHub repo with quality README
- [ ] Demo video
- [ ] Live application with beta users

---

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Deepgram (STT)
DEEPGRAM_API_KEY=

# Anthropic (LLM)
ANTHROPIC_API_KEY=

# OpenAI (TTS)
OPENAI_API_KEY=
```

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| App Router vs Pages Router | App Router | Modern Next.js pattern, server components, layouts |
| Auth provider | Supabase Auth | Already using Supabase for DB, integrated solution |
| WebSocket approach | Next.js API route + custom WS | Simpler than separate server, works with Vercel |
| State management | Zustand | Minimal boilerplate, no context provider wrapping |
| Audio format | PCM 16-bit, 16kHz | Deepgram recommended format for best accuracy |
| TTS voice | OpenAI `alloy` or `nova` | Natural sounding, professional tone |

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Vercel WebSocket limitations (serverless) | High | High | Use Vercel Edge Runtime or consider Supabase Realtime as fallback; alternatively use polling with SSE |
| API costs exceed $100 budget | Medium | Medium | Implement strict per-user limits (3 interviews), monitor usage, use shorter default duration |
| Audio latency > 2s | Medium | High | Stream all stages (don't wait for full responses), optimize chunk sizes, test on slow connections |
| Deepgram free credits run out | Low | High | $200 free credit is generous; track usage; Whisper API as backup |
| Browser mic permission issues | Medium | Medium | Clear permission prompts, help text, fallback to text-only mode |

---

## Dependencies & Sequencing

```
Phase 1.1 (Project Init) ──→ Phase 1.2 (Supabase) ──→ Phase 1.3 (Auth)
                                                            │
Phase 1.4 (Landing) ──────────────────────────────────── (parallel)
                                                            │
                                                            ▼
                                                    Phase 1.5 (Auth Pages)
                                                            │
                                                            ▼
                                                    Phase 1.6 (Dashboard)
                                                            │
                                                            ▼
Phase 2.1 (Audio/STT) ──→ Phase 2.2 (Claude LLM) ──→ Phase 2.3 (TTS + Pipeline)
                                                            │
                                                            ▼
Phase 3.1 (Feedback) ──→ Phase 3.2 (History) ──→ Phase 3.3 (Polish) ──→ Phase 3.4 (Testing)
                                                            │
                                                            ▼
                                                    Phase 4.1 (Launch)
```

---

## Notes

- **WebSocket on Vercel:** Vercel serverless functions have a 10s timeout (hobby) / 60s (pro). For real-time interviews, consider using **Vercel Edge Runtime** (no timeout) or **Server-Sent Events (SSE)** for the AI response streaming, with the Deepgram WebSocket connection being made directly from the client (with a short-lived token generated server-side).
- **Audio Pipeline Alternative:** If direct WebSocket is too complex initially, start with a simpler REST-based approach: record audio chunk → POST to API → get transcription → POST to Claude → get TTS audio → play. Then optimize to streaming later.
- **Cost Tracking:** Build a simple API usage counter early (Phase 1) to track Deepgram characters, Claude tokens, and OpenAI TTS characters consumed.
