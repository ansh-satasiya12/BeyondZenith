# BeyondZenith

One dashboard for your GitHub, Codeforces, and LeetCode activity — built for placement and internship season.

BeyondZenith pulls together what you've built (GitHub) and how you compete and practice (Codeforces, LeetCode) into a single developer profile, so you're not sending recruiters three different tabs.

**Live**: [frontend](#) (Vercel) · [API](#) (Render) — *add your deployed URLs here*

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Architecture Notes](#architecture-notes)
- [Deployment](#deployment)
- [Roadmap](#roadmap)

---

## Features

**Authentication**
- Register / login with JWT access + refresh tokens, delivered as httpOnly cookies
- Silent token refresh on the frontend — an expired access token triggers one background refresh + retry, never a surprise logout
- Password change

**GitHub**
- Connect via OAuth
- Sync repositories and profile stats
- Repository list with search, filter, and sort; per-repository detail view
- AI-enhanced repository descriptions
- Analytics: language distribution, star/fork totals, top and recent repositories

**Codeforces**
- Connect by handle
- Sync full submission and contest history
- Submission list (filter by verdict, language, rating, contest, tag; search by problem name) and contest list (filter by year, rating change, rating range; search by contest name)
- Analytics: verdict and language distribution, problems solved by rating, top tags, rating history, 30-day activity

**LeetCode**
- Connect by username
- Sync profile snapshot (solved counts, acceptance rate, language/skill stats, submission calendar, badges) and full contest history
- Contest list with the same filter/search/sort pattern as Codeforces
- Analytics: solved distribution, language/skill distribution, calendar summary, rating history

**Unified Dashboard**
- One combined view across all three platforms — profile, overview stats, recent activity, and cross-platform highlights (total problems solved, total repositories, best contest rating across platforms)
- Degrades gracefully per platform: a platform that isn't connected, or is connected but hasn't been synced yet, never breaks the rest of the dashboard

---

## Tech Stack

**Backend** — Node.js, Express, MongoDB with Mongoose, JWT (`jsonwebtoken`), `bcrypt`, `zod` for request validation, `cookie-parser`, `helmet`, `cors`, `morgan`, `dotenv`.

**Frontend** — React (Vite), React Router, Tailwind CSS, Axios, `lucide-react` for icons. Auth and theme state via React Context; server state fetched per-page through a thin service layer over Axios.

**External integrations** — GitHub REST/GraphQL API (OAuth), Codeforces public API, LeetCode's public GraphQL endpoint.

---

## Project Structure

```
beyondzenith/
├── backend/
│   └── src/
│       ├── app.js                # Express app, middleware, route mounting
│       ├── server.js              # Entry point — connects DB, starts server
│       ├── config/                # env.js, db.js
│       ├── controllers/           # HTTP layer only — one file per module
│       ├── services/               # Business logic, external API calls, DB queries
│       ├── models/                 # Mongoose schemas
│       ├── middlewares/            # auth (protect), validate, error, notFound
│       ├── routes/                 # One router per module
│       ├── validators/             # Zod schemas
│       └── utils/                  # AppError, asyncHandler, jwt, cookie, encryption, oauth
│
└── frontend/
    └── src/
        ├── main.jsx / App.jsx
        ├── routes/                 # AppRoutes, ProtectedRoute, PublicRoute
        ├── context/                 # AuthContext, ThemeContext
        ├── services/                 # One file per backend module, thin Axios wrappers
        ├── pages/                    # Dashboard, GitHub, Codeforces, LeetCode, Settings, auth pages
        └── components/                # layout/, github/, landing/, shared UI
```

Every backend module (`github`, `codeforces`, `leetcode`) follows the same layering: **route → middleware (`protect`, `validate`) → controller (HTTP only) → service (business logic + DB) → model.** Errors are thrown as `AppError(message, statusCode)` from anywhere in a service and caught centrally — controllers never `try/catch`.

---

## Getting Started

### Prerequisites
- Node.js 18+ (native `fetch` is used for all external API calls — GitHub, Codeforces, LeetCode)
- A MongoDB connection string (local or Atlas)
- A GitHub OAuth App (Client ID, Client Secret, callback URL)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in the values from the table below
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_BASE_URL to your backend URL
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Notes |
|---|---|---|
| `PORT` | Yes | Server port |
| `NODE_ENV` | No | Defaults to `development` |
| `MONGODB_URI` | Yes | Full connection string, Atlas or local |
| `JWT_ACCESS_SECRET` | Yes | Signs access tokens |
| `JWT_ACCESS_EXPIRES_IN` | Yes | e.g. `15m` |
| `JWT_ACCESS_COOKIE_MAX_AGE` | Yes | Milliseconds, matches the access token cookie lifetime |
| `JWT_REFRESH_SECRET` | Yes | Signs refresh tokens — must differ from the access secret |
| `JWT_REFRESH_EXPIRES_IN` | Yes | e.g. `7d` |
| `JWT_REFRESH_COOKIE_MAX_AGE` | Yes | Milliseconds |
| `GITHUB_CLIENT_ID` | Yes | From your GitHub OAuth App |
| `GITHUB_CLIENT_SECRET` | Yes | From your GitHub OAuth App |
| `GITHUB_CALLBACK_URL` | Yes | Must exactly match the callback URL registered on the OAuth App |
| `GITHUB_TOKEN_ENCRYPTION_KEY` | Yes | Used to encrypt stored GitHub access tokens at rest (AES-256-GCM) |

Codeforces and LeetCode need no API keys — both integrations use public, unauthenticated endpoints.

### Frontend (`frontend/.env`)

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Base URL of the backend API, e.g. `https://your-api.onrender.com/api/v1` |

---

## API Reference

All routes except `/health` and auth's `register`/`login` require the `accessToken` cookie (set automatically after login). Base path: `/api/v1`.

### Auth — `/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Log in, sets auth cookies |
| POST | `/auth/refresh` | Silently refresh the access token |
| GET | `/auth/me` | Current user |
| POST | `/auth/logout` | Clear session |
| PATCH | `/auth/change-password` | Change password |

### GitHub — `/github`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/github/connect` | Start OAuth flow |
| GET | `/github/callback` | OAuth callback |
| POST | `/github/sync` | Sync repositories |
| POST | `/github/profile/sync` | Sync profile stats |
| GET | `/github/repositories` | List repositories (paginated, filterable, sortable) |
| GET | `/github/repositories/:id` | Repository detail |
| POST | `/github/repositories/:id/enhance` | AI-enhance a repository's description |
| GET | `/github/analytics` | Aggregate analytics |
| GET | `/github/dashboard` | Single-request dashboard payload |
| DELETE | `/github/unlink` | Remove GitHub connection and synced data |

### Codeforces — `/codeforces`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/codeforces/connect` | Link a handle |
| POST | `/codeforces/sync` | Sync submissions and contests |
| GET | `/codeforces/submissions` | List (paginate, filter by verdict/language/rating/contestId/tag, search, sort) |
| GET | `/codeforces/submissions/:id` | Submission detail |
| GET | `/codeforces/contests` | List (paginate, filter by year/rating-change/rating-range, search, sort) |
| GET | `/codeforces/contests/:id` | Contest detail |
| GET | `/codeforces/analytics` | Aggregate analytics |
| GET | `/codeforces/dashboard` | Single-request dashboard payload |
| DELETE | `/codeforces/unlink` | Remove connection and synced data |

### LeetCode — `/leetcode`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/leetcode/connect` | Link a username |
| POST | `/leetcode/sync` | Sync profile snapshot and contest history |
| GET | `/leetcode/profile` | Stored profile snapshot |
| GET | `/leetcode/contests` | List (paginate, filter by year/rating-change/rating-range, search, sort) |
| GET | `/leetcode/contests/:id` | Contest detail |
| GET | `/leetcode/analytics` | Aggregate analytics |
| GET | `/leetcode/dashboard` | Single-request dashboard payload |
| DELETE | `/leetcode/unlink` | Remove connection and synced data |

### Unified — `/dashboard`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Combined profile, overview, activity, and highlights across all three platforms |

Every response follows `{ success, message?, data? }` — GET endpoints generally omit `message`; state-changing ones (connect, sync, unlink) include it. List endpoints add a `pagination: { page, limit, totalItems, totalPages }` field alongside `data`.

---

## Architecture Notes

- **Sync is on-demand, not automatic.** Nothing polls GitHub, Codeforces, or LeetCode in the background — the user triggers a sync, the backend fetches fresh data, normalizes it, and upserts it via `bulkWrite`, removing any records that no longer exist upstream.
- **Analytics never call external APIs.** Every analytics/dashboard endpoint reads only from MongoDB, computed via aggregation pipelines over the already-synced `Submission`/`Contest`/`LeetCodeContest`/`LeetCodeProfile` collections.
- **GitHub tokens are encrypted at rest** (AES-256-GCM) before being stored, and decrypted only when making an authenticated call on the user's behalf.
- **The unified dashboard reuses each platform's own dashboard/analytics service** rather than recomputing anything — it composes `getGitHubDashboard`, `getCodeforcesDashboard`, and `getLeetCodeDashboard`, and wraps each call so that one platform failing (not connected, or connected but never synced) doesn't fail the whole response.

---

## Deployment

Current setup: **frontend on Vercel**, **backend on Render**, **database on MongoDB Atlas**.

- **CORS + cookies**: because the frontend and backend are on different domains, the backend's CORS configuration needs to allow credentials from the exact deployed frontend origin — a wildcard origin (`cors()` with no options) will not work once cookies are involved, since browsers reject `Access-Control-Allow-Origin: *` when a request carries credentials. Configure it explicitly:
  ```js
  app.use(cors({
    origin: process.env.CLIENT_URL, // your Vercel URL, exact origin, no trailing slash
    credentials: true,
  }));
  ```
  This also means the frontend's Axios instance needs `withCredentials: true` (already the case here), and cookies need `sameSite: 'none'` + `secure: true` when set, since they're cross-site in production.
- **MongoDB Atlas network access**: Render's free tier doesn't have a static outbound IP, so Atlas's IP allowlist needs either Render's IPs (if you're on a paid tier with static IPs) or `0.0.0.0/0` (allow from anywhere) on the free tier.
- **DNS**: `config/db.js` pins DNS resolution to `8.8.8.8`/`8.8.4.4` before connecting — this works around SRV record resolution issues some hosts (Render included) have historically had with Atlas's `mongodb+srv://` connection strings. Leave it in; it's a no-op if you never hit the issue and a fix if you do.
- **GitHub OAuth callback**: `GITHUB_CALLBACK_URL` and the callback URL registered on the GitHub OAuth App itself both need to point at the deployed Render backend, not `localhost`, once you flip over to production.

---

## Roadmap

Deliberately out of scope so far, and flagged as such throughout the build:
- AI features beyond the existing GitHub repository description enhancement
- Redis caching
- Background/scheduled sync (all syncing is currently user-triggered)
- Public, shareable read-only profile links
- Webhooks / real-time updates
