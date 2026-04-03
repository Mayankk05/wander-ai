# WanderAI — AI Powered Travel Planner (Full Stack)

WanderAI is an AI-driven travel planning app that generates structured, day-by-day itineraries with budgets, real-world place validation (geocoding), weather enrichment, and real-time collaboration.

The repository contains:

- **Backend:** `wanderai-backend` — Node.js + Express + Prisma + PostgreSQL (Supabase compatible)
- **Frontend:** `wanderai-frontend` — React + Vite + Tailwind (UI)

---

## Key Features

- **AI itinerary generation** using **Google Gemini API**
- **Geocoding & map validation** using **Google Maps Geocoding API** (flags places when geocoding fails)
- **Weather enrichment** via **OpenWeatherMap**
- **JWT authentication**
- Trips CRUD (create, save, update, delete, fetch)
- Trip sharing via public token link (enable/disable)
- RAG-style chat endpoint (trip context aware)
- Real-time collaboration using **Socket.io**
- Budget tools (summary + optimize)
- Regenerate a single day
- PDF export

---

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL + Prisma
- Google Gemini (`@google/generative-ai`)
- **Google Maps Geocoding API**
- OpenWeatherMap API
- Socket.io
- Zod, NodeCache, PDFKit
- Helmet, CORS, Rate limiting, logging (Pino)

### Frontend
- React + Vite
- TailwindCSS
- Zustand, React Router
- Socket.io client
- Map libraries (`mapbox-gl`, `react-map-gl`, `@react-google-maps/api`)

---

## Repo Structure

```text
wander-AI/
├── wanderai-backend/
└── wanderai-frontend/
```

---

## Run Locally

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
- API keys:
  - Gemini API key
  - OpenWeatherMap API key
  - Google Maps API key (Geocoding enabled)

### Install
```bash
cd wanderai-backend
npm install
```

### Environment Variables
```bash
cp .env.example .env
```

Your backend `.env` should include:
- `PORT` (default `5000`)
- `DATABASE_URL`
- `DIRECT_URL` (required by Prisma schema; often same as `DATABASE_URL`)
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `OPENWEATHER_API_KEY`
- `GOOGLE_MAPS_API_KEY`
- `CLIENT_URL` (usually `http://localhost:5173`)

### Migrate DB
```bash
npx prisma migrate dev
```

### Run backend
```bash
npm run dev
```

Backend:
- `http://localhost:5000/`
- `GET /api/health`
- `GET /api/ai-status`

---

## Frontend Setup (`wanderai-frontend`)

### Install
```bash
cd ../wanderai-frontend
npm install
```

### Environment Variables
The frontend expects at least:
- `VITE_API_URL` (backend base URL including `/api`)
- `VITE_SOCKET_URL` (optional; defaults to `VITE_API_URL` without `/api`)
- `VITE_GOOGLE_MAPS_API_KEY` (for map rendering in the UI)

Create `wanderai-frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
```

### Run frontend
```bash
npm run dev
```

Frontend usually:
- `http://localhost:5173`

---

## API Overview (Backend)

Base URL: `http://localhost:5000`

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/verify-email`
- `GET /api/auth/send-verify-link`

### Trips
- `GET /api/trips`
- `POST /api/trips`
- `GET /api/trips/:id`
- `PUT /api/trips/:id`
- `DELETE /api/trips/:id`
- `GET /api/trips/generate` (SSE streaming)
- `POST /api/trips/:id/undo`
- `POST /api/trips/:id/refresh-image`

### Share
- `POST /api/share/:id/enable`
- `POST /api/share/:id/disable`
- `GET /api/share/:token` (public)

### Chat
- `POST /api/chat/:id` (SSE streaming)

### Collaboration
- `GET /api/collab/:id`
- `GET /api/collab/:id/collaborators`
- `POST /api/collab/:id/collaborators`
- `DELETE /api/collab/:id/collaborators/:email`

### Budget
- `GET /api/budget/:id/summary`
- `GET /api/budget/:id/optimize` (SSE streaming)

### Regenerate
- `POST /api/regenerate/:id/day` (SSE streaming)
- `GET /api/regenerate/:id/full` (SSE streaming)

### Weather
- `GET /api/weather/:destination`

### Export
- `GET /api/export/:id/pdf`

---

## Socket.io (Collaboration)

The backend uses Socket.io for real-time editing presence and trip updates.

Common events:
- `join:trip`
- `trip:update`
- `trip:typing`
- `leave:trip`

---

## Scripts

### Backend
```bash
npm run dev
npm start
```

### Frontend
```bash
npm run dev
npm run build
npm run preview
npm run lint
```

---

## Troubleshooting

- **Geocoding missing lat/lng?** Ensure `GOOGLE_MAPS_API_KEY` is set and Geocoding API is enabled.
- **Map not loading in UI?** Ensure `VITE_GOOGLE_MAPS_API_KEY` is set.
- **CORS errors?** Ensure `CLIENT_URL=http://localhost:5173`.
- **Prisma connection errors?** Verify `DATABASE_URL` and `DIRECT_URL`.

---
