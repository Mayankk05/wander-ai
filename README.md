# WanderAI — AI Powered Travel Planner (Full Stack)

WanderAI is an AI-driven travel planning app that generates structured, day-by-day itineraries with budgets, real-world place validation, weather enrichment, and real-time collaboration.

The project is split into two apps:

- **Backend:** `wanderai-backend` — Node.js + Express + Prisma + PostgreSQL (Supabase)
- **Frontend:** `wanderai-frontend` — React + Vite + Tailwind (client UI)

---

## Key Features

- **AI itinerary generation (RAG-style)** using **Google Gemini API**
- **Geocoding & map validation** (OpenStreetMap/Nominatim) to reduce hallucinations
- **Weather enrichment** using **OpenWeatherMap**
- **JWT authentication**
- **Trips CRUD** (save, update, delete, fetch)
- **Trip sharing** via public token link (enable/disable)
- **RAG Chat** endpoint for itinerary-based questions
- **Real-time collaboration** using **Socket.io**
- **Budget tools** (summary + AI optimize)
- **Regenerate single day** of itinerary
- **PDF Export** for generated trip plans

---

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL + Prisma (Supabase supported)
- Google Gemini (`@google/generative-ai`)
- Socket.io
- Zod validation
- NodeCache
- OpenWeatherMap API
- PDFKit
- Helmet, CORS, Rate limiting

### Frontend
- React + Vite
- TailwindCSS
- Zustand
- React Router
- Socket.io client
- Map libraries (`mapbox-gl`, `react-map-gl`, `@react-google-maps/api`)

---

## Repository Structure

```text
wander-AI/
├── wanderai-backend/
└── wanderai-frontend/
```

---

## Getting Started (Local Setup)

### 1) Clone
```bash
git clone https://github.com/Mayankk05/wander-AI.git
cd wander-AI
```

---

## Backend Setup (`wanderai-backend`)

### Prerequisites
- Node.js **18+**
- PostgreSQL database (or Supabase Postgres)
- API Keys:
  - Google Gemini API key
  - OpenWeatherMap API key

### Install
```bash
cd wanderai-backend
npm install
```

### Environment Variables
Copy the example file:
```bash
cp .env.example .env
```

Backend `.env` (important variables):
- `PORT` (default `5000`)
- `DATABASE_URL` (Postgres connection string)
- `DIRECT_URL` (used by Prisma sometimes; required by your `schema.prisma`)
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `OPENWEATHER_API_KEY`
- `CLIENT_URL` (for CORS, typically `http://localhost:5173`)

> Note: your Prisma schema uses both `DATABASE_URL` and `DIRECT_URL`.

### Prisma migrate
```bash
npx prisma migrate dev
```

### Run backend
```bash
npm run dev
```

Backend should be available at:
- `http://localhost:5000/`
- Health check: `GET http://localhost:5000/api/health`
- AI status: `GET http://localhost:5000/api/ai-status`

---

## Frontend Setup (`wanderai-frontend`)

### Install
```bash
cd ../wanderai-frontend
npm install
```

### Run frontend
```bash
npm run dev
```

Frontend usually runs at:
- `http://localhost:5173`

---

## API Overview (Backend)

Base URL: `http://localhost:5000`

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (auth required)

### Trips
- `GET /api/trips` (auth required)
- `POST /api/trips` (auth required)
- `GET /api/trips/:id` (auth required)
- `PUT /api/trips/:id` (auth required)
- `DELETE /api/trips/:id` (auth required)
- `POST /api/trips/generate` (auth required) — triggers AI pipeline

### Share
- `POST /api/share/:id/enable` (auth required)
- `POST /api/share/:id/disable` (auth required)
- `GET /api/share/:token` (public)

### Chat
- `POST /api/chat/:id` (auth required)

### Collaboration
- `GET /api/collab/:id/collaborators` (auth required)
- `POST /api/collab/:id/collaborators` (auth required)
- `DELETE /api/collab/:id/collaborators/:email` (auth required)

### Budget
- `GET /api/budget/:id/summary` (auth required)
- `POST /api/budget/:id/optimize` (auth required)

### Regenerate
- `POST /api/regenerate/:id/day` (auth required)

### Weather
- `GET /api/weather/:destination` (auth required)

### Export
- `GET /api/export/:id/pdf` (auth required)

---

## Socket.io Events (Real-time Collaboration)

| Client Emits     | Server Handles                          | Server Broadcasts                   |
|------------------|------------------------------------------|-------------------------------------|
| `join:trip`      | joins a trip room                        | `presence:current`, `presence:update` |
| `trip:update`    | debounced save/update logic               | `trip:updated`, `trip:error`        |
| `trip:typing`    | typing context                            | `trip:typing`                       |
| `leave:trip`     | leave room                                | `presence:update`                   |
| `disconnect`     | cleanup                                   | `presence:update`                   |

---

## Scripts

### Backend (`wanderai-backend`)
```bash
npm run dev
npm start
```

### Frontend (`wanderai-frontend`)
```bash
npm run dev
npm run build
npm run preview
npm run lint
```

---

## Notes / Troubleshooting

- If CORS blocks requests, ensure `CLIENT_URL` matches the frontend origin (example: `http://localhost:5173`).
- If Prisma errors on connection, verify `DATABASE_URL` and `DIRECT_URL`.
- The backend sets a request timeout (120s). Slow AI calls may still time out if the AI provider is slow.

---
