# VibeCheck Backend


## ✨ Features
- Secure JWT authentication via Supabase Auth
- CRUD operations for Trips, Trip Days, and Activities
- Relational data modeling with foreign key constraints
- Serverless-ready structure under `api/` for Vercel
- Minimal frontend stub for quick testing

---

## 🔧 Prerequisites
- Node.js v14+ and npm
- A Supabase project (free tier is fine)
- Vercel CLI (for deployment)

---

## ⚙️ Installation & Setup

1. **Clone this repo**:
   ```bash
   git clone https://github.com/lorenzocannone/vibecheck.git
   cd vibecheck/vibecheck-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   - Rename `.env.example` to `.env`
   - Fill in your Supabase credentials (see [Environment Variables](#environment-variables))

4. **Run migrations** (via Supabase SQL Editor):
   ```sql
   -- Enable UUID extension
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

   -- Paste the schema from your SQL file or docs
   ```

5. **Start the server locally**:
   ```bash
   npm run dev
   ```
   Server listens on `http://localhost:3000`.

---

## 📁 Folder Structure
```
vibecheck-backend/
├── api/                   # Vercel serverless functions
│   └── index.js
├── public/                # Static frontend test pages
│   ├── index.html         # Login page
│   └── app.html           # Trips & testing page
├── src/
│   ├── app.js             # Express app (routes + middleware)
│   ├── controllers/       # Business logic per resource
│   │   ├── activities.js
│   │   ├── days.js
│   │   └── trips.js
│   ├── db/                # Supabase client initialization
│   │   └── supabase.js
│   ├── middleware/        # Auth middleware (JWT verification)
│   │   └── auth.js
│   ├── routes/            # Route definitions
│   │   ├── activities.js
│   │   ├── days.js
│   │   └── trips.js
│   └── utils/             # Utility functions
│       └── catchAsync.js
├── .env.example
├── .gitignore
└── package.json
```

---

## 🔑 Environment Variables
Copy `.env.example` → `.env` and fill in:

```dotenv
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_KEY=<your-service-role-key>
PORT=3000
```

- **SUPABASE_URL**: Your Supabase project URL
- **SUPABASE_ANON_KEY**: Public key for JWT verification
- **SUPABASE_SERVICE_KEY**: Service key for server-side DB access
- **PORT**: Port for local development (default: 3000)

---

## ▶️ Running the Server

```bash
npm run dev    # Starts local server
```

---

## 📜 API Endpoints

All API endpoints live under `/api` and require an `Authorization: Bearer <JWT>` header. Replace `http://localhost:3000` with your deployed URL `https://<your-app>.vercel.app`.

### Authentication
**Login** (get a JWT)
```http
POST https://<your-app>.vercel.app/auth/v1/token?grant_type=password
Headers:
  apikey: <anon_key>
  Content-Type: application/json
Body:
  { "email": "valentina@demo.com", "password": "<password>" }
```

### Trips
| Method | Endpoint                      | Description              |
| ------ | ----------------------------- | ------------------------ |
| GET    | `/api/trips`                  | List your trips          |
| POST   | `/api/trips`                  | Create a new trip        |
| GET    | `/api/trips/:tripId`          | Get trip details         |

**Create Trip Example**
```http
POST https://<your-app>.vercel.app/api/trips
Headers:
  Authorization: Bearer <JWT>
  Content-Type: application/json
Body:
  {
    "country":"Argentina",
    "start_date":"2025-07-01",
    "end_date":"2025-07-10",
    "member_ids":[]
  }
```

### Trip Days
| Method | Endpoint                           | Description                |
| ------ | ---------------------------------- | -------------------------- |
| POST   | `/api/trips/:tripId/days`          | Add a day to a trip        |

**Add Day Example**
```http
POST https://<your-app>.vercel.app/api/trips/<tripId>/days
Headers:
  Authorization: Bearer <JWT>
  Content-Type: application/json
Body:
  {
    "day_date":"2025-07-02",
    "city":"Buenos Aires",
    "hotel":"Hotel Central",
    "member_ids":[]
  }
```

### Activities
| Method | Endpoint                             | Description                |
| ------ | ------------------------------------ | -------------------------- |
| POST   | `/api/days/:dayId/activities`        | Add activity to a day      |

**Add Activity Example**
```http
POST https://<your-app>.vercel.app/api/days/<dayId>/activities
Headers:
  Authorization: Bearer <JWT>
  Content-Type: application/json
Body:
  {
    "description":"Dinner at local parrilla",
    "points":3
  }
```

