# BeyondZenith

One dashboard for your GitHub, Codeforces, and LeetCode activity — built for placement and internship season.

BeyondZenith brings together what you've built (GitHub) and how you compete and practice (Codeforces, LeetCode) into a single developer profile, so you're not sending recruiters three different tabs.

**Live Demo:** [BeyondZenith](https://beyond-zenith.vercel.app/)

---

## Features

### Authentication
- Register and login with JWT authentication
- Access + refresh token flow using httpOnly cookies
- Silent token refresh without forcing users to log in again
- Password change

### GitHub
- Connect GitHub via OAuth
- Sync repositories and profile statistics
- Repository search, filtering, sorting and pagination
- Repository details and enhanced descriptions
- Language, stars, forks and repository analytics
- GitHub dashboard with aggregated statistics

### Codeforces
- Connect Codeforces by handle
- Sync submission and contest history
- Search, filtering, sorting and pagination
- Submission and contest analytics
- Verdict and language distribution
- Problems solved by rating
- Top problem tags
- Contest rating history
- 30-day activity tracking

### LeetCode
- Connect LeetCode by username
- Sync profile and contest history
- Problem difficulty distribution
- Language and skill analysis
- Submission calendar and activity
- Contest history and rating progression
- Contest analytics

### Unified Dashboard
- Combined GitHub, Codeforces and LeetCode overview
- Total problems solved across platforms
- Total repositories
- Contest rating highlights
- Recent activity
- Graceful handling of unconnected platforms

---

## Tech Stack

**Frontend**
- React
- Vite
- React Router
- Tailwind CSS
- Axios
- React Context
- Lucide React

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Zod

**Integrations**
- GitHub REST/GraphQL API
- Codeforces API
- LeetCode GraphQL API

**Deployment**
- Vercel — Frontend
- Render — Backend
- MongoDB Atlas — Database

---

## Project Structure

```text
beyondzenith/
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       └── validators/
│
└── frontend/
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        ├── routes/
        └── services/
```
---

## Future Scope
- Can Add AI-analytics features
- Add redis cache
- Add web hooks
