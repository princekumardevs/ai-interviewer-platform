**AI Mock Interviewer Platform**

API Reference Documentation
# **Getting Started**
Base URL: https://your-app.vercel.app/api

All API requests must include authentication via session cookie or Bearer token in the Authorization header.
## **Authentication**
**Method 1: Session Cookie (Recommended)**

Automatically set after successful login. All subsequent requests include the cookie.

**Method 2: Bearer Token**

Authorization: Bearer <your\_token>

Include in request headers for API access.
# **Authentication Endpoints**
## **POST /auth/signup**
Create a new user account.

**Request Body:**

{   "email": "user@example.com",   "password": "securePassword123",   "full\_name": "John Doe",   "target\_role": "Software Engineer",   "experience\_level": "mid" }

**Response (200 OK):**

{   "user": {     "id": "uuid",     "email": "user@example.com",     "full\_name": "John Doe",     "target\_role": "Software Engineer",     "experience\_level": "mid",     "interviews\_remaining": 3   },   "session": {     "access\_token": "jwt\_token",     "expires\_at": "2026-02-19T00:00:00Z"   } }
## **POST /auth/login**
Authenticate existing user.

**Request Body:**

{   "email": "user@example.com",   "password": "securePassword123" }

**Response (200 OK):**

{   "user": { ... },   "session": { ... } }
## **POST /auth/logout**
End current user session.

**Response (200 OK):**

{   "message": "Logged out successfully" }
# **User Endpoints**
## **GET /user/profile**
Get current user profile.

**Response (200 OK):**

{   "id": "uuid",   "email": "user@example.com",   "full\_name": "John Doe",   "target\_role": "Software Engineer",   "experience\_level": "mid",   "interviews\_remaining": 2,   "created\_at": "2026-01-15T10:00:00Z" }
## **PATCH /user/profile**
Update user profile.

**Request Body:**

{   "full\_name": "John Smith",   "target\_role": "Senior Software Engineer",   "experience\_level": "senior" }

**Response (200 OK):**

{   "id": "uuid",   "email": "user@example.com",   "full\_name": "John Smith",   "target\_role": "Senior Software Engineer",   "experience\_level": "senior",   "interviews\_remaining": 2 }
# **Interview Endpoints**
## **POST /interviews/create**
Create a new interview session.

**Request Body:**

{   "role": "Software Engineer",   "interview\_type": "technical",   "duration\_minutes": 30 }

**Response (201 Created):**

{   "session": {     "id": "uuid",     "user\_id": "uuid",     "role": "Software Engineer",     "interview\_type": "technical",     "duration\_minutes": 30,     "status": "in\_progress",     "started\_at": "2026-02-12T14:30:00Z"   },   "interviews\_remaining": 1 }
## **GET /interviews/:id**
Get interview session details and transcript.

**Response (200 OK):**

{   "session": {     "id": "uuid",     "role": "Software Engineer",     "interview\_type": "technical",     "duration\_minutes": 30,     "status": "completed",     "started\_at": "2026-02-12T14:30:00Z",     "completed\_at": "2026-02-12T15:00:00Z",     "recording\_url": "https://storage.url/recording.mp3"   },   "messages": [     {       "id": "uuid",       "role": "assistant",       "content": "Hello! Let's start with...",       "timestamp": "2026-02-12T14:30:05Z"     },     {       "id": "uuid",       "role": "user",       "content": "I would approach it by...",       "timestamp": "2026-02-12T14:30:45Z"     }   ] }
## **GET /interviews/history**
Get all user's past interviews.

**Query Parameters:**

limit (optional): Number of results (default: 10)

offset (optional): Pagination offset (default: 0)

**Response (200 OK):**

{   "interviews": [     {       "id": "uuid",       "role": "Software Engineer",       "interview\_type": "technical",       "status": "completed",       "started\_at": "2026-02-12T14:30:00Z",       "completed\_at": "2026-02-12T15:00:00Z"     }   ],   "total": 5,   "limit": 10,   "offset": 0 }
## **POST /interviews/:id/complete**
Mark interview as completed and trigger feedback generation.

**Response (200 OK):**

{   "message": "Interview completed",   "feedback\_id": "uuid",   "status": "generating" }
# **Feedback Endpoints**
## **GET /feedback/:session\_id**
Get detailed interview feedback.

**Response (200 OK):**

{   "id": "uuid",   "session\_id": "uuid",   "overall\_score": 78,   "technical\_depth\_score": 82,   "communication\_score": 75,   "structure\_score": 80,   "confidence\_score": 73,   "strengths": "Strong technical knowledge...",   "improvements": "Consider structuring...",   "detailed\_feedback": {     "questions": [       {         "question": "Explain REST APIs",         "answer\_quality": "good",         "score": 85,         "feedback": "Clear explanation with examples"       }     ]   } }
# **WebSocket Real-Time Interview**
## **WS /interview/stream/:session\_id**
Establish WebSocket connection for real-time interview.

**Connection:**

const ws = new WebSocket('wss://your-app.vercel.app/api/interview/stream/SESSION\_ID');

**Client → Server Messages:**

**Audio Chunk:**

{   "type": "audio\_chunk",   "data": "base64\_encoded\_audio",   "sample\_rate": 16000 }

**End of Speech:**

{   "type": "speech\_end" }

**Server → Client Messages:**

**Transcription Update:**

{   "type": "transcription",   "text": "I would use a hash map...",   "is\_final": true }

**AI Response (Audio):**

{   "type": "audio\_response",   "data": "base64\_encoded\_audio",   "text": "That's a good approach..." }

**Status Update:**

{   "type": "status",   "state": "listening | processing | speaking" }
# **Error Responses**
All error responses follow this format:

{   "error": {     "code": "ERROR\_CODE",     "message": "Human readable error message",     "details": { ... }   } }

|**Status**|**Code**|**Description**|
| :- | :- | :- |
|400|INVALID\_REQUEST|Request validation failed|
|401|UNAUTHORIZED|Authentication required|
|403|INSUFFICIENT\_CREDITS|No interviews remaining|
|404|NOT\_FOUND|Resource not found|
|500|INTERNAL\_ERROR|Server error occurred|

