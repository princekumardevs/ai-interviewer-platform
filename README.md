# 🎙️ AI Mock Interviewer Platform

An AI-powered mock interview platform that simulates real interview experiences with voice interaction, real-time AI responses, and detailed performance feedback.

> **Live Demo:** [Coming Soon](#) · **Video Demo:** [Coming Soon](#)

---

## ✨ Features

- **🤖 AI Interview Sessions** — Conduct mock interviews with an AI interviewer powered by Google Gemini, tailored to your target role and experience level
- **🎤 Voice Mode** — Speak naturally using browser speech-to-text, with AI responses read aloud via text-to-speech
- **💬 Real-time Chat** — Text-based interview mode with streaming AI responses
- **📊 Performance Feedback** — Detailed scoring across Technical Depth, Communication, Structure, and Confidence with a radar chart visualization
- **📝 Transcript History** — Review past interviews with full conversation transcripts and downloadable `.txt` exports
- **🔐 Authentication** — Secure login with Google OAuth or email/password credentials
- **📱 Responsive Design** — Works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|----------------|----------------------------------------------|
| **Framework** | Next.js 14 (App Router) + React 18 + TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Auth** | NextAuth.js v5 (Google OAuth + Credentials) |
| **Database** | Neon PostgreSQL + Prisma ORM |
| **AI / LLM** | Google Gemini 2.5 Flash Lite |
| **STT** | Web Speech API (browser-native) |
| **TTS** | Web Speech Synthesis API (browser-native) |
| **State** | Zustand |
| **Hosting** | Vercel |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login & Signup pages
│   ├── (dashboard)/      # Protected routes
│   │   ├── dashboard/    # Main dashboard
│   │   ├── interview/    # Interview session & setup
│   │   │   ├── [id]/     # Live interview + feedback
│   │   │   └── new/      # New interview setup
│   │   ├── history/      # Interview history + transcript
│   │   └── profile/      # User profile
│   └── api/              # API routes
│       ├── auth/         # NextAuth endpoints
│       ├── interviews/   # Interview CRUD + messaging
│       └── user/         # User profile API
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── feedback/         # Radar chart
│   ├── landing/          # Landing page sections
│   └── shared/           # Navbar, Sidebar
├── hooks/                # Custom React hooks
├── stores/               # Zustand stores
├── lib/                  # API clients, auth config, utilities
└── types/                # TypeScript type definitions
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- A [Google Cloud](https://console.cloud.google.com) project with OAuth credentials
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/ai-interviewer-platform.git
cd ai-interviewer-platform
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in your values:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random string (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `http://localhost:3000` (dev) or production URL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GEMINI_API_KEY` | Google Gemini API key |

### 3. Set Up Database

```bash
npx prisma db push
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📋 How It Works

1. **Sign up / Log in** — Create an account or sign in with Google
2. **Configure Interview** — Choose your target role, interview type (technical/behavioral/mixed), and duration
3. **Interview** — Speak or type your answers; the AI asks follow-up questions in real time
4. **Get Feedback** — Receive detailed scoring with a performance radar chart, strengths, areas for improvement, and per-question breakdown
5. **Review History** — Browse past interviews, view transcripts, and download them

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 📄 License

This project is built for portfolio/educational purposes.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) — React framework
- [shadcn/ui](https://ui.shadcn.com/) — UI component library
- [Google Gemini](https://ai.google.dev/) — AI language model
- [Neon](https://neon.tech/) — Serverless PostgreSQL
- [Prisma](https://www.prisma.io/) — Database ORM
- [NextAuth.js](https://next-auth.js.org/) — Authentication
