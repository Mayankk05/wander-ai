# WanderAI — AI Powered Travel Planner

WanderAI is a comprehensive, intelligent travel itinerary generator. Using advanced Retrieval Augmented Generation (RAG) capabilities via the Google Gemini API, WanderAI autonomously plans daily budgets, geocodes real-world places via Nominatim, enriches forecasts with OpenWeatherMap, and syncs live collaborations across friends utilizing Socket.io.

## Tech Stack

| Component | Technology |
| --- | --- |
| **Backend Core** | Node.js + Express |
| **Database** | PostgreSQL + Prisma + Supabase |
| **AI Generation** | Google Gemini API (gemini-2.5-flash) |
| **Mapping Core** | Nominatim OpenStreetMap geocoding |
| **Forecast Core** | OpenWeatherMap |
| **WebSockets** | Socket.io |
| **Security** | JWT Authentication |
| **Schemas** | Zod validation |
| **Caching** | NodeCache |
| **Rendering** | PDFKit |

## Getting Started

**Prerequisites:**
- Node.js 18 or higher
- A Supabase account (free)
- A Google Gemini API key (free)
- An OpenWeatherMap API key (free)

**Installation steps:**
1. Clone the repo
2. `cd backend`
3. `npm install`
4. Copy `.env.example` to `.env` and fill in values
5. `npx prisma migrate dev`
6. `npm run dev`

## Environment Variables

| Variable Name | Source/Description | Example Value |
| --- | --- | --- |
| `PORT` | Local environment preference | `5000` |
| `DATABASE_URL` | Supabase Project Settings > Database | `postgresql://...` |
| `JWT_SECRET` | Generate a secure random string locally | `my_secret_key` |
| `GEMINI_API_KEY` | Google AI Studio Console | `AIzaSy...` |
| `OPENWEATHER_API_KEY` | OpenWeatherMap User Account | `abcd...` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

## Complete API Reference

**AUTH**
- `POST /api/auth/register` — Register a new user — auth required: No
- `POST /api/auth/login` — Login existing user — auth required: No
- `GET /api/auth/me` — Get current user data — auth required: Yes

**TRIPS**
- `GET /api/trips` — Get all user trips — auth required: Yes
- `POST /api/trips` — Save a trip explicitly — auth required: Yes
- `GET /api/trips/:id` — Fetch single trip details — auth required: Yes
- `PUT /api/trips/:id` — Update trip details natively — auth required: Yes
- `DELETE /api/trips/:id` — Delete trip permanently — auth required: Yes
- `POST /api/trips/generate` — Trigger AI pipeline processing — auth required: Yes

**SHARE**
- `POST /api/share/:id/enable` — Enable anonymous public view link — auth required: Yes
- `POST /api/share/:id/disable` — Revoke anonymous access link — auth required: Yes
- `GET /api/share/:token` — Fetch shared trip publicly — auth required: No

**CHAT**
- `POST /api/chat/:id` — Send RAG intent to Gemini chat orchestrator — auth required: Yes

**COLLAB**
- `GET /api/collab/:id/collaborators` — Returns all collaborators — auth required: Yes
- `POST /api/collab/:id/collaborators` — Send invite email bind — auth required: Yes
- `DELETE /api/collab/:id/collaborators/:email` — Remove access — auth required: Yes

**BUDGET**
- `GET /api/budget/:id/summary` — Fetch difference cost analysis calculations — auth required: Yes
- `POST /api/budget/:id/optimize` — Stream budget AI adjustments down to user — auth required: Yes

**REGENERATE**
- `POST /api/regenerate/:id/day` — Process targeted single-day replacement stream — auth required: Yes

**WEATHER**
- `GET /api/weather/:destination` — Check OpenWeatherMap cache mappings — auth required: Yes

**EXPORT**
- `GET /api/export/:id/pdf` — Stream generated PDF binaries locally — auth required: Yes

## Socket.io Events

| Client Emits | Server Handles | Server Broadcasts |
| --- | --- | --- |
| `join:trip` | Mounts user to room logic | `presence:current`, `presence:update` |
| `trip:update` | Debounces request, saves DB | `trip:updated`, `trip:error` |
| `trip:typing` | Captures field context natively | `trip:typing` |
| `leave:trip` | Detaches user securely | `presence:update` |
| `disconnect` | Clears timeouts gracefully | `presence:update` |

## Project Structure

```text
backend/
├── controllers/          # Request, response, DB manipulation orchestration
├── routes/               # Express endpoint definitions mapped to controllers
├── middleware/           # Pipeline checks (auth, errors, format schemas)
├── lib/                  # Helpers (Prisma client, caching map, auth guards)
├── pipeline/             # Strict AI sequence (Intent -> Geocode -> Enricher)
├── tests/                # Automated API endpoints mapping validation routines
├── prisma/               # Schema formats mapped directly to Supabase DB syncs
├── .env                  # Secrets configuration
├── .gitignore            # Security omissions
├── server.js             # Express mountpoint and sockets configuration block
└── package.json          # Dependency packages
```

## Key Features

- **5-step AI pipeline**: Intent analysis → LLM Prompting → JSON Validation → Map Geocoding → Weather injection
- **Hallucination detection**: Dynamically validates and flags un-Mappable coordinates emitted by Gemini to warn users
- **RAG chat**: Seamlessly reads user trip context, streams dynamic suggestions retaining full budget compliance
- **Real-time collaboration**: WebSockets gracefully debounce mutual concurrent editing natively mimicking Google Docs
- **Budget enforcement**: Aggressive AI re-evaluator checks against original parameters isolating strictly cheaper solutions
