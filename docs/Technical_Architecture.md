**AI Mock Interviewer Platform**

Technical Architecture Document
# **1. System Overview**
The AI Mock Interviewer Platform is built on a modern, scalable architecture leveraging serverless technologies and third-party AI services. The system follows a modular design with clear separation between frontend, backend, and external services.
## **1.1 Architecture Principles**
- Cost-efficiency: Maximize use of free tiers and minimize infrastructure costs
- Simplicity: Keep architecture simple to maintain and extend as a solo developer
- Performance: Optimize for low-latency real-time audio processing
- Scalability: Design to handle 50 users initially with potential to scale
# **2. Technology Stack**

|**Layer**|**Technology**|**Justification**|
| :- | :- | :- |
|**Frontend**|Next.js 14 + React 18|Modern framework with SSR, great DX, free Vercel hosting|
|**UI Library**|Tailwind CSS + shadcn/ui|Rapid development, consistent design, highly customizable|
|**State Mgmt**|Zustand|Lightweight, simple API, perfect for small-medium apps|
|**Backend API**|Next.js API Routes|Integrated with frontend, serverless, no separate deployment|
|**Database**|Supabase (PostgreSQL)|Free tier (500MB), auth included, real-time capabilities|
|**Authentication**|Supabase Auth / Clerk|Integrated auth, social logins, free tier supports 50k users|
|**STT**|Deepgram|$200 free credits, fast (250ms), accurate|
|**LLM**|Claude Sonnet 4|Best conversational AI, contextual, free credits available|
|**TTS**|OpenAI TTS|Natural voices, affordable ($0.015/1K chars), fast|
|**Storage**|Supabase Storage|1GB free, integrated with database, simple API|
|**Hosting**|Vercel|Free for hobby projects, optimized for Next.js, auto-deploy|

# **3. System Architecture**
## **3.1 High-Level Architecture**
The system follows a three-tier architecture with clear separation of concerns:

- Presentation Layer: Next.js frontend handling UI, audio capture, and real-time display
- Application Layer: Next.js API routes orchestrating AI services and business logic
- Data Layer: Supabase managing user data, sessions, and file storage
## **3.2 Real-Time Audio Pipeline**
The core interview experience relies on a real-time audio processing pipeline:

**Step 1: Audio Capture**

- Browser captures microphone input using Web Audio API
- Audio chunks streamed via WebSocket to backend
- VAD (Voice Activity Detection) to detect when user stops speaking

**Step 2: Speech-to-Text**

- Audio sent to Deepgram API via WebSocket
- Real-time transcription returned as text
- Latency: ~250-500ms

**Step 3: LLM Processing**

- Transcribed text + conversation context sent to Claude API
- Structured prompt engineering for interviewer persona
- Response generated with appropriate follow-up questions
- Latency: ~800-1200ms

**Step 4: Text-to-Speech**

- LLM response sent to OpenAI TTS API
- Audio generated and streamed back to frontend
- Latency: ~300-500ms

**Step 5: Audio Playback**

- Audio chunks received via WebSocket
- Played through browser's audio output
# **4. Data Models**
## **4.1 Database Schema**
**Users Table**

- id (UUID, primary key)
- email (string, unique)
- full\_name (string)
- target\_role (string)
- experience\_level (enum: entry, mid, senior)
- interviews\_remaining (integer, default: 3)
- created\_at (timestamp)
- updated\_at (timestamp)

**Interview\_Sessions Table**

- id (UUID, primary key)
- user\_id (UUID, foreign key)
- role (string)
- interview\_type (enum: technical, behavioral, mixed)
- duration\_minutes (integer)
- status (enum: in\_progress, completed, abandoned)
- started\_at (timestamp)
- completed\_at (timestamp)
- recording\_url (string)

**Interview\_Messages Table**

- id (UUID, primary key)
- session\_id (UUID, foreign key)
- role (enum: user, assistant)
- content (text)
- timestamp (timestamp)
- audio\_duration\_seconds (float)

**Interview\_Feedback Table**

- id (UUID, primary key)
- session\_id (UUID, foreign key, unique)
- overall\_score (integer, 1-100)
- technical\_depth\_score (integer, 1-100)
- communication\_score (integer, 1-100)
- structure\_score (integer, 1-100)
- confidence\_score (integer, 1-100)
- strengths (text)
- improvements (text)
- detailed\_feedback (jsonb)
# **5. API Endpoints**
## **5.1 Authentication**
POST /api/auth/signup

- Create new user account
- Body: { email, password, full\_name, target\_role, experience\_level }

POST /api/auth/login

- Authenticate user
- Body: { email, password }

POST /api/auth/logout

- End user session
## **5.2 User Management**
GET /api/user/profile

- Get current user profile and remaining interviews

PATCH /api/user/profile

- Update user profile information
## **5.3 Interview Sessions**
POST /api/interviews/create

- Create new interview session
- Body: { role, interview\_type, duration\_minutes }

GET /api/interviews/:id

- Get interview session details and transcript

GET /api/interviews/history

- Get all user's past interviews

POST /api/interviews/:id/complete

- Mark interview as completed and trigger feedback generation
## **5.4 Real-Time Communication (WebSocket)**
WS /api/interview/stream/:session\_id

- Bidirectional audio streaming
- Client sends: audio chunks (base64)
- Server sends: transcription updates, AI responses (audio), status events
## **5.5 Feedback**
GET /api/feedback/:session\_id

- Get detailed interview feedback report
# **6. Security Considerations**
## **6.1 Authentication & Authorization**
- JWT-based authentication with secure HTTP-only cookies
- Session expiration after 7 days of inactivity
- API endpoints protected with middleware checking valid session
## **6.2 Data Protection**
- All API communication over HTTPS
- API keys stored as environment variables, never committed to repo
- Database connection strings encrypted
- User passwords hashed with bcrypt (handled by Supabase)
## **6.3 Rate Limiting**
- Interview creation limited to user's remaining credits
- API endpoints rate-limited to prevent abuse (100 req/min per IP)
- WebSocket connection limits (1 active per user)
# **7. Deployment & Infrastructure**
## **7.1 Deployment Pipeline**
- GitHub repository as source of truth
- Automatic deployment to Vercel on push to main branch
- Preview deployments for pull requests
- Environment variables managed through Vercel dashboard
## **7.2 Environment Configuration**
**Required Environment Variables:**

- NEXT\_PUBLIC\_SUPABASE\_URL
- NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY
- SUPABASE\_SERVICE\_ROLE\_KEY
- DEEPGRAM\_API\_KEY
- ANTHROPIC\_API\_KEY
- OPENAI\_API\_KEY
## **7.3 Monitoring & Logging**
- Vercel Analytics for performance monitoring
- Console logging for errors and API calls
- Supabase dashboard for database monitoring
- API usage tracking for cost management
