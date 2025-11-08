# Quick Start Guide

Get your Wedding Planner app up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Neon Postgres account (free tier works)
- A Stack Auth account (free tier works)

## Step 1: Clone and Install

```bash
git clone <your-repo-url>
cd wedding-planner-app
npm install
```

## Step 2: Set Up Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy your connection string (looks like: `postgres://user:pass@host.neon.tech/neondb`)

## Step 3: Initialize Database

**Option A: Using SQL Script (Recommended)**

1. In Neon Console → SQL Editor
2. Open `scripts/init-database.sql` from this project
3. Copy and paste into SQL Editor
4. Click "Run"
5. Done! ✅

**Option B: Using Drizzle**

```bash
# Create .env.local
echo "DATABASE_URL=your_neon_connection_string" > .env.local

# Push schema
npm run db:push
```

## Step 4: Set Up Stack Auth

1. Go to [Stack Auth](https://stack-auth.com)
2. Create a project
3. Enable Email/Password auth
4. Set redirect URL: `http://localhost:3000/handler/*`
5. Copy your credentials

## Step 5: Configure Environment

Create `.env.local`:

```env
DATABASE_URL=postgres://user:pass@host.neon.tech/neondb
NEXT_PUBLIC_STACK_PROJECT_ID=your_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_publishable_key
STACK_SECRET_SERVER_KEY=your_secret_key
```

## Step 6: Verify and Run

```bash
# Verify database
npm run db:verify

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## Troubleshooting

**Database not connecting?**
- Check `DATABASE_URL` is correct
- Verify database is active in Neon dashboard
- Run `npm run db:verify` to check schema

**Auth not working?**
- Verify all Stack Auth env vars are set
- Check redirect URL in Stack Auth dashboard

**Need help?**
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide
- Check [README.md](./README.md) for full documentation

## Next Steps

1. Sign up for an account
2. Create your first wedding
3. Add guests, vendors, events
4. Start planning! 🎊

---

For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md)

