# Complete Vercel Deployment Guide

This is a step-by-step guide to deploy the North Indian Wedding Planner application to Vercel with Neon PostgreSQL.

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] GitHub account and repository set up
- [ ] Vercel account (sign up at [vercel.com](https://vercel.com))
- [ ] Neon account (sign up at [neon.tech](https://neon.tech) - free tier available)
- [ ] Stack Auth account (sign up at [stack-auth.com](https://stack-auth.com))

---

## Step 1: Prepare Your Code for GitHub

### 1.1 Initialize Git Repository (if not already done)

```bash
# Navigate to project directory
cd wedding-planner-app

# Initialize git (if needed)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Wedding Planner App"

# Add remote repository (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/wedding-planner-app.git

# Push to GitHub
git push -u origin main
```

### 1.2 Verify Important Files Are Present

Make sure these files exist in your repository:
- ✅ `package.json` - Dependencies and scripts
- ✅ `drizzle.config.ts` - Database configuration
- ✅ `vercel.json` - Vercel deployment configuration
- ✅ `scripts/init-database.sql` - Database initialization script
- ✅ `lib/db/schema.ts` - Database schema
- ✅ `.gitignore` - Should exclude `.env.local`, `node_modules`, etc.

---

## Step 2: Set Up Neon PostgreSQL Database

### 2.1 Create Neon Project

1. Go to [Neon Console](https://console.neon.tech)
2. Click **"Create Project"** button
3. Fill in project details:
   - **Project Name**: `wedding-planner` (or your preferred name)
   - **Region**: Choose the region closest to where you'll deploy on Vercel
     - For US East: `us-east-1` (recommended for `iad1` Vercel region)
     - For US West: `us-west-2`
     - For Europe: `eu-central-1`
   - **PostgreSQL Version**: Latest (15 or 16 recommended)
4. Click **"Create Project"**

### 2.2 Get Database Connection String

1. In your Neon project dashboard, navigate to **"Connection Details"** or **"Dashboard"**
2. You'll see a connection string that looks like:
   ```
   postgres://username:password@ep-xxx-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
3. **Copy this entire connection string** - you'll need it for:
   - Local development (`.env.local`)
   - Vercel environment variables

### 2.3 Initialize Database Schema

You have **three options**. We recommend **Option A** for production:

#### Option A: Using SQL Script (Recommended - Most Reliable)

1. Go to Neon Console → Your Project → **SQL Editor**
2. Open the file `scripts/init-database.sql` from this project in your code editor
3. **Copy the entire SQL script** (it's a large file with all table definitions)
4. Paste into Neon SQL Editor
5. Click **"Run"** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
6. Wait for execution to complete
7. Verify success: You should see a success message

**Verify tables were created:**
```sql
-- Run this in Neon SQL Editor
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
-- Should return 26
```

#### Option B: Using Drizzle Push (Quick for Development)

```bash
# 1. Create .env.local file in project root
echo "DATABASE_URL=your_neon_connection_string_here" > .env.local

# 2. Install dependencies
npm install

# 3. Push schema to database
npm run db:push
```

#### Option C: Using Drizzle Migrations

```bash
# 1. Generate migrations from schema
npm run db:generate

# 2. Apply migrations (requires DATABASE_URL in .env.local)
npm run db:migrate
```

### 2.4 Verify Database Setup

Run the verification script:

```bash
# Make sure DATABASE_URL is in .env.local
npm run db:verify
```

You should see:
```
✅ All 6 required ENUMs exist
✅ All 26 required tables exist
✅ Database verification PASSED
```

---

## Step 3: Set Up Stack Auth

### 3.1 Create Stack Auth Project

1. Go to [Stack Auth Dashboard](https://stack-auth.com)
2. Sign up or log in
3. Click **"Create Project"** or **"New Project"**
4. Fill in project details:
   - **Project Name**: `Wedding Planner` (or your choice)
   - **Description**: Optional

### 3.2 Configure Authentication

1. In your Stack Auth project settings, go to **"Authentication"** or **"Settings"**
2. Enable **Email/Password** authentication
3. Configure redirect URLs:
   - **Development**: `http://localhost:3000/handler/*`
   - **Production**: `https://your-app.vercel.app/handler/*` (you'll update this after deployment)

### 3.3 Get Your Credentials

From Stack Auth Dashboard → Your Project → **Settings** or **API Keys**:

1. **Project ID** (Public)
   - Variable name: `NEXT_PUBLIC_STACK_PROJECT_ID`
   - This is safe to expose in client-side code

2. **Publishable Client Key** (Public)
   - Variable name: `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
   - This is safe to expose in client-side code

3. **Secret Server Key** (Private - NEVER expose)
   - Variable name: `STACK_SECRET_SERVER_KEY`
   - Keep this secret! Only use in server-side code

**Copy all three values** - you'll need them for Vercel environment variables.

---

## Step 4: Deploy to Vercel

### 4.1 Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"** or **"New Project"**
3. If prompted, connect your GitHub account
4. Select your `wedding-planner-app` repository
5. Click **"Import"**

### 4.2 Configure Project Settings

Vercel should auto-detect Next.js. Verify these settings:

- **Framework Preset**: `Next.js` (auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

**DO NOT CLICK DEPLOY YET** - we need to add environment variables first!

### 4.3 Add Environment Variables

**Before deploying**, add all required environment variables:

1. In the project configuration page, scroll to **"Environment Variables"** section
2. Click **"Add"** for each variable below:

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `DATABASE_URL` | Your Neon connection string | Production, Preview, Development |
   | `NEXT_PUBLIC_STACK_PROJECT_ID` | Your Stack Auth Project ID | Production, Preview, Development |
   | `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | Your Stack Auth Publishable Key | Production, Preview, Development |
   | `STACK_SECRET_SERVER_KEY` | Your Stack Auth Secret Key | Production, Preview, Development |

3. For each variable:
   - Enter the **Variable Name** exactly as shown
   - Paste the **Value**
   - Select **Production**, **Preview**, and **Development** environments
   - Click **"Save"**

4. **Important**: Make sure all 4 variables are added for all 3 environments

### 4.4 Deploy

1. After adding all environment variables, click **"Deploy"**
2. Wait for the build to complete (usually 2-5 minutes)
3. Once deployment succeeds, you'll see:
   - ✅ **Deployment URL**: `https://your-app-name.vercel.app`
   - Build logs showing successful compilation

### 4.5 Verify Deployment

1. Click on your deployment URL to open the app
2. You should see the wedding planner homepage
3. Try signing up for an account (this will test Stack Auth)
4. If sign-up works, authentication is configured correctly!

---

## Step 5: Set Up Neon Integration (Optional but Recommended)

This makes it easier to manage your database connection:

1. In Vercel project dashboard, go to **Settings** → **Integrations**
2. Search for **"Neon"**
3. Click **"Add Integration"**
4. Connect your Neon account (authorize Vercel)
5. Select your Neon project (`wedding-planner`)
6. This will automatically:
   - Set up `DATABASE_URL` environment variable
   - Keep it in sync with Neon

**Note**: If you already set `DATABASE_URL` manually, the integration will update it.

---

## Step 6: Verify Database After Deployment

### 6.1 Check Database Connection

After deployment, verify your database is accessible:

**Option A: Test in the App**
1. Go to your deployed app URL
2. Sign up for an account
3. Create a wedding
4. If successful, database is working!

**Option B: Use Verification Script Locally**
```bash
# Set production DATABASE_URL temporarily
export DATABASE_URL=your_production_connection_string
npm run db:verify
```

**Option C: Check in Neon SQL Editor**
```sql
-- Run in Neon SQL Editor
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
-- Should return 26
```

### 6.2 Verify Tables Exist

If tables are missing, run the SQL script again:

1. Go to Neon Console → SQL Editor
2. Copy and paste `scripts/init-database.sql`
3. Execute
4. Verify with the query above

---

## Step 7: Update Stack Auth Redirect URLs

1. Go back to [Stack Auth Dashboard](https://stack-auth.com)
2. Navigate to your project → **Settings** → **Redirect URLs**
3. Add your production domain:
   - `https://your-app-name.vercel.app/handler/*`
4. Save changes
5. Test authentication on your deployed app

---

## Step 8: Post-Deployment Checklist

Verify everything works:

- [ ] App loads at Vercel URL
- [ ] Can sign up for new account
- [ ] Can sign in
- [ ] Can create a wedding
- [ ] Can add guests
- [ ] Can add vendors
- [ ] Can add events
- [ ] Can add tasks
- [ ] Can view budget dashboard
- [ ] Database has 26 tables (verify in Neon)
- [ ] Stack Auth redirect URLs include production domain

---

## Troubleshooting

### Issue: Build Fails on Vercel

**Symptoms**: Deployment shows "Build Failed"

**Solutions**:
1. Check build logs in Vercel dashboard for specific errors
2. Verify all dependencies are in `package.json`:
   ```bash
   npm install
   npm run build
   ```
3. Check for TypeScript errors:
   ```bash
   npm run build
   ```
4. Verify environment variables are set correctly
5. Check that `tsx` is in `devDependencies` (needed for scripts)

### Issue: Database Connection Errors

**Symptoms**: "Database not connected" or connection timeout

**Solutions**:
1. Verify `DATABASE_URL` is correct in Vercel environment variables
2. Check that your Neon database is **active** (not paused)
3. Ensure connection string includes `?sslmode=require`
4. Verify connection string format:
   ```
   postgres://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
5. Check Neon dashboard → Connection Details for correct string
6. Test connection locally:
   ```bash
   DATABASE_URL=your_connection_string npm run db:verify
   ```

### Issue: Authentication Not Working

**Symptoms**: Can't sign up/sign in, redirect loops

**Solutions**:
1. Verify all Stack Auth environment variables are set:
   - `NEXT_PUBLIC_STACK_PROJECT_ID`
   - `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
   - `STACK_SECRET_SERVER_KEY`
2. Check redirect URLs in Stack Auth dashboard:
   - Should include: `https://your-app.vercel.app/handler/*`
3. Clear browser cookies and try again
4. Verify `NEXT_PUBLIC_STACK_PROJECT_ID` format is correct
5. Check Vercel function logs for authentication errors

### Issue: Tables Don't Exist After Deployment

**Symptoms**: App works but can't create data, database errors

**Solutions**:

1. **Run SQL Script in Neon** (Most Reliable):
   - Go to Neon Console → SQL Editor
   - Copy entire `scripts/init-database.sql` file
   - Paste and execute
   - Verify: `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';` returns 26

2. **Use Drizzle Push Locally**:
   ```bash
   # Set production DATABASE_URL
   export DATABASE_URL=your_production_connection_string
   npm run db:push
   ```

3. **Check Existing Tables**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

### Issue: Environment Variables Not Working

**Symptoms**: App can't connect to database or auth

**Solutions**:
1. Verify variables are set for correct environments (Production, Preview, Development)
2. Check variable names are exact (case-sensitive):
   - `DATABASE_URL` (not `database_url`)
   - `NEXT_PUBLIC_STACK_PROJECT_ID` (not `STACK_PROJECT_ID`)
3. Redeploy after adding variables:
   - Go to Vercel → Deployments → Click "..." → Redeploy
4. Check Vercel function logs for variable access errors

---

## Environment Variables Reference

| Variable | Description | Where to Get It | Required | Public? |
|----------|-------------|-----------------|----------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Neon Console → Connection Details | ✅ Yes | ❌ No |
| `NEXT_PUBLIC_STACK_PROJECT_ID` | Stack Auth project ID | Stack Auth Dashboard → Settings | ✅ Yes | ✅ Yes |
| `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | Stack Auth publishable key | Stack Auth Dashboard → Settings | ✅ Yes | ✅ Yes |
| `STACK_SECRET_SERVER_KEY` | Stack Auth secret key | Stack Auth Dashboard → Settings | ✅ Yes | ❌ No |

**Important Notes**:
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- `STACK_SECRET_SERVER_KEY` must NEVER be exposed to clients
- Add all variables for Production, Preview, and Development environments

---

## Custom Domain Setup (Optional)

1. In Vercel dashboard → Your Project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `wedding-planner.yourdomain.com`)
4. Follow DNS configuration instructions:
   - Add CNAME record pointing to Vercel
   - Or add A record (if using apex domain)
5. Wait for DNS propagation (can take up to 48 hours)
6. Update Stack Auth redirect URLs to include custom domain:
   - `https://your-custom-domain.com/handler/*`

---

## Monitoring & Maintenance

### Database Monitoring

- **Neon Dashboard**: Monitor queries, connections, and usage
- **Neon Metrics**: Track database performance and storage
- **Connection Pooling**: Neon handles this automatically

### Application Monitoring

- **Vercel Analytics**: Enable in project settings → Analytics
- **Vercel Logs**: Check function logs for errors
- **Error Tracking**: Consider adding Sentry for production

### Backup Strategy

1. **Database Backups**:
   - Neon provides automatic daily backups
   - Create manual backups from Neon dashboard
   - Point-in-time recovery available

2. **Code Backups**:
   - Your code is in GitHub (automatic backup)
   - Vercel keeps deployment history

3. **Data Export**:
   - Use export features in the app (Reports page)
   - Or use Neon's export functionality

---

## Quick Reference Commands

```bash
# Local Development
npm install                    # Install dependencies
npm run dev                 # Start dev server (http://localhost:3000)
npm run build               # Build for production
npm run start               # Start production server locally

# Database Management
npm run db:push             # Push schema to database (dev)
npm run db:generate         # Generate migrations
npm run db:migrate          # Run migrations
npm run db:verify           # Verify database setup
npm run db:studio           # Open Drizzle Studio (database GUI)

# Verification
npm run db:verify           # Check all tables and enums exist
```

---

## Summary: Quick Deployment Steps

1. ✅ **Push code to GitHub**
2. ✅ **Create Neon database** → Get connection string
3. ✅ **Run `scripts/init-database.sql`** in Neon SQL Editor
4. ✅ **Set up Stack Auth** → Get credentials
5. ✅ **Deploy to Vercel** → Add environment variables
6. ✅ **Verify database** → Test app functionality
7. ✅ **Update Stack Auth redirect URLs** → Include production domain

**Your app should now be live!** 🎉

Visit your Vercel URL and start planning weddings!

---

## Getting Help

If you encounter issues:

1. **Check Logs**:
   - Vercel deployment logs (Dashboard → Deployments → Click deployment)
   - Neon database logs (Neon Console → Logs)
   - Browser console (F12 → Console)

2. **Verify Setup**:
   - Run `npm run db:verify` locally with production DATABASE_URL
   - Check environment variables in Vercel
   - Test database connection

3. **Common Issues**:
   - See Troubleshooting section above
   - Check GitHub issues
   - Review documentation in README.md

4. **Support Resources**:
   - [Vercel Documentation](https://vercel.com/docs)
   - [Neon Documentation](https://neon.tech/docs)
   - [Stack Auth Documentation](https://stack-auth.com/docs)
   - [Next.js Documentation](https://nextjs.org/docs)

---

**Need more help?** Check the main [README.md](./README.md) or [DEPLOYMENT.md](./DEPLOYMENT.md) for additional information.

