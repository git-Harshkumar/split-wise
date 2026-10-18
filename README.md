# SplitWise - Fair Splits. Friendlier Moments.

A production-ready expense splitting application built with React, Node.js/Express, and Supabase.

## Tech Stack

- **Frontend**: React 18 + Vite, plain CSS (Neo-Brutalism design), deployed on Vercel
- **Backend**: Node.js + Express REST API, deployed on Render
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth)
- **Monorepo Structure**: Single repository with `frontend/` and `backend/` folders

## Features

- 🔐 **Authentication**: Email/password signup & login with Supabase Auth
- 👥 **Friends Management**: Add/remove friends with validation
- 👨‍👩‍👧‍👦 **Groups**: Create groups with icons, add/remove members
- 💸 **Expenses**: Add expenses with description, amount, payer, participants, date, optional group
- 📊 **Analytics**:
  - Who Paid What: Per-person totals with expandable expense details
  - Trip Investment: Per-person amount paid & percentage with group filter
  - What Each Person Spent: Per-person share of expenses with group filter
- 📋 **Manage Expenses**: List all expenses with full details, delete with confirmation
- ⚖️ **Settle Up**: Net balances, simplified suggested payments, record settlements
- ⚙️ **Settings**: Update display name, export/import JSON backup, clear all data
- 🎨 **Neo-Brutalism UI**: Thick borders, hard shadows, bright colors, bold typography
- ♿ **Accessible**: Focus states, labeled inputs, accessible modals (Esc to close, focus trap)
- 📱 **Responsive**: Mobile, tablet, desktop - no horizontal overflow

## Repository Structure

```
splitwise/
├── frontend/                 # Vite + React app
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── api/             # API client & Supabase config
│   │   ├── context/         # React contexts (Auth, Toast)
│   │   ├── styles/          # Global CSS (Neo-Brutalism)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json
│   └── .env.example
├── backend/                  # Express API
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Auth, error handling, idempotency
│   │   ├── services/        # Business logic & DB operations
│   │   ├── validators/      # Zod schemas
│   │   └── server.js        # Entry point
│   ├── package.json
│   ├── render.yaml
│   └── .env.example
├── supabase/
│   └── schema.sql           # Complete database schema
└── README.md
```

## Local Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase/schema.sql`
3. Go to Settings → API and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key (keep this secret!)

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your values:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# FRONTEND_URL=http://localhost:5173
# PORT=3001

npm install
npm run dev
```

Backend runs on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env with your values:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
# VITE_API_URL=http://localhost:3001

npm install
npm run dev
```

Frontend runs on `http://localhost:5173` with proxy to backend.

## Deployment

### 1. Supabase (Database & Auth)

1. Create Supabase project
2. Run `supabase/schema.sql` in SQL Editor
3. Enable Email Auth in Authentication → Providers
4. Note down: Project URL, Anon Key, Service Role Key

### 2. Backend on Render

1. Push repo to GitHub
2. Create new **Web Service** on Render
3. Connect your repo
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Environment Variables**:
     - `SUPABASE_URL` = your Supabase URL
     - `SUPABASE_SERVICE_ROLE_KEY` = your service role key
     - `FRONTEND_URL` = your Vercel frontend URL (e.g., `https://splitwise.vercel.app`)
     - `PORT` = `10000` (Render uses this)
5. Deploy

The `render.yaml` in `backend/` contains this configuration.

### 3. Frontend on Vercel

1. Import the same GitHub repo on Vercel
2. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     - `VITE_SUPABASE_URL` = your Supabase URL
     - `VITE_SUPABASE_ANON_KEY` = your anon key
     - `VITE_API_URL` = your Render backend URL (e.g., `https://splitwise-backend.onrender.com`)
3. Deploy

The `vercel.json` in `frontend/` handles SPA routing.

### 4. Update CORS

After both deployments, update the backend's `FRONTEND_URL` to your actual Vercel URL and redeploy backend.

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (secret!) | Yes |
| `FRONTEND_URL` | Vercel frontend URL for CORS | Yes |
| `PORT` | Server port (Render uses 10000) | No (default: 3001) |

### Frontend (`frontend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Anon public key | Yes |
| `VITE_API_URL` | Render backend URL | Yes |

## Important Notes

### Render Free Tier

Render's free tier spins down after 15 minutes of inactivity. The first request after spin-down can take 30-60 seconds. This is normal behavior.

### CORS Errors

If you see CORS errors:
1. Ensure `FRONTEND_URL` in backend matches your Vercel URL exactly (including `https://`)
2. No trailing slash on the URL
3. Redeploy backend after changing `FRONTEND_URL`

### Auth Errors

If authentication fails:
1. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in frontend
2. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in backend
3. Check Supabase Auth settings: Email provider enabled, no email confirmations required for testing

### Database Schema

The schema includes:
- Row Level Security on all tables
- Triggers for automatic profile/person creation on signup
- RPC functions for atomic expense creation and balance calculations
- Indexes for performance
- Constraints for data integrity

## Testing Checklist

After deployment, verify:

- [ ] Signup with email/password works
- [ ] Login works
- [ ] Add friend works (validation, duplicates rejected)
- [ ] Create group with members works
- [ ] Remove group keeps expenses (group_name_snapshot)
- [ ] Add expense with all fields works
- [ ] Equal splits distribute leftover paise correctly
- [ ] Delete expense works
- [ ] Who Paid What shows correct totals & expandable details
- [ ] Trip Investment shows correct amounts & percentages
- [ ] What Each Person Spent shows correct shares & percentages
- [ ] Manage Expenses lists all with correct data
- [ ] Settle Up shows correct balances & suggested payments
- [ ] Record settlement updates balances
- [ ] Refresh page - data persists
- [ ] Settings: update display name works
- [ ] Export downloads valid JSON
- [ ] Import restores data correctly
- [ ] Clear all data works with confirmation
- [ ] Mobile viewport (375px) - no horizontal overflow
- [ ] Tablet viewport (768px) - layout adjusts
- [ ] Desktop viewport (1200px+) - full layout

## License

MIT