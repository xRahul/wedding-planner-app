# Complete Deployment Guide - Neon Postgres

This comprehensive guide will help you deploy the North Indian Wedding Planner application to Vercel with Neon Postgres.

## Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Neon Account**: Sign up at [neon.tech](https://neon.tech) (Free tier available)
4. **Stack Auth Account**: Sign up at [stack-auth.com](https://stack-auth.com)

## Step-by-Step Deployment

### Step 1: Prepare Your Repository

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Set Up Neon Postgres Database

#### 2.1 Create Neon Project

1. Go to [Neon Console](https://console.neon.tech)
2. Click **"Create Project"**
3. Fill in the details:
   - **Project Name**: `wedding-planner` (or your choice)
   - **Region**: Choose closest to your Vercel region (e.g., `us-east-1` for `iad1`)
   - **PostgreSQL Version**: Latest (15 or 16)
4. Click **"Create Project"**

#### 2.2 Get Connection String

1. In your Neon project dashboard, go to **"Connection Details"**
2. You'll see a connection string like:
   ```
   postgres://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
3. **Copy this connection string** - you'll need it later

#### 2.3 Initialize Database Schema

You have **three options** to set up the database schema:

##### Option A: Using Drizzle Push (Recommended for Development)

```bash
# 1. Create .env.local file
echo "DATABASE_URL=your_neon_connection_string" > .env.local

# 2. Install dependencies
npm install

# 3. Push schema to database
npm run db:push
```

##### Option B: Using SQL Script (Recommended for Production)

1. Go to Neon Console → **SQL Editor**
2. Open the file `scripts/init-database.sql` from this project
3. Copy the entire SQL script
4. Paste into Neon SQL Editor
5. Click **"Run"**
6. Verify all tables are created (you should see ~26 tables)

##### Option C: Using Drizzle Migrations

```bash
# 1. Generate migrations
npm run db:generate

# 2. Apply migrations
npm run db:migrate
```

#### 2.4 Verify Database Setup

```bash
# Run verification script
npm run db:verify
```

This will check that all required tables and enums exist. You should see:
```
✅ All 6 required ENUMs exist
✅ All 26 required tables exist
✅ Database verification PASSED
```

### Step 3: Set Up Stack Auth

1. Go to [Stack Auth Dashboard](https://stack-auth.com)
2. Create a new project
3. Configure authentication:
   - Enable **Email/Password** authentication
   - Set redirect URLs:
     - Development: `http://localhost:3000/handler/*`
     - Production: `https://your-domain.vercel.app/handler/*` (update after deployment)
4. Copy your credentials:
   - **Project ID**
   - **Publishable Client Key**
   - **Secret Server Key**

### Step 4: Deploy to Vercel

#### 4.1 Initial Deployment

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

#### 4.2 Add Environment Variables

Before deploying, add these environment variables in Vercel:

1. Click **"Environment Variables"** in project settings
2. Add each variable:

   ```
   DATABASE_URL=postgres://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_publishable_key
   STACK_SECRET_SERVER_KEY=your_secret_key
   ```

3. Make sure to add them for **Production**, **Preview**, and **Development** environments
4. Click **"Save"**

#### 4.3 Deploy

1. Click **"Deploy"**
2. Wait for the build to complete
3. Note your deployment URL (e.g., `https://your-app.vercel.app`)

### Step 5: Set Up Neon Integration (Optional but Recommended)

1. In Vercel project settings, go to **"Integrations"**
2. Search for **"Neon"**
3. Click **"Add Integration"**
4. Connect your Neon account
5. Select your Neon project
6. This will automatically set up the `DATABASE_URL` environment variable

### Step 6: Verify Database After Deployment

After deployment, verify your database is accessible:

1. **Option A**: Use the verification script locally with production DATABASE_URL:
   ```bash
   DATABASE_URL=your_production_connection_string npm run db:verify
   ```

2. **Option B**: Use Neon SQL Editor to check:
   ```sql
   SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
   ```
   Should return 26.

3. **Option C**: Test in the app:
   - Sign up for an account
   - Create a wedding
   - If successful, database is working!

### Step 7: Update Stack Auth Redirect URLs

1. Go back to Stack Auth Dashboard
2. Update redirect URLs to include your production domain:
   - `https://your-app.vercel.app/handler/*`
3. Save changes

## Post-Deployment Checklist

- [ ] Environment variables are set in Vercel
- [ ] Database schema is created (26 tables exist)
- [ ] Database verification passes (`npm run db:verify`)
- [ ] Stack Auth redirect URLs include production domain
- [ ] Can sign up for a new account
- [ ] Can sign in
- [ ] Can create a wedding
- [ ] Can add guests
- [ ] Can add vendors
- [ ] Can add events
- [ ] Can add tasks
- [ ] Can view budget

## Troubleshooting

### Database Connection Issues

**Error**: "Database not connected" or connection timeout

**Solutions**:
1. Verify `DATABASE_URL` is correct in Vercel environment variables
2. Check that your Neon database is **active** (not paused)
3. Ensure connection string includes `?sslmode=require`
4. Check Neon dashboard → **"Connection Details"** for the correct string
5. Verify your IP is not blocked (Neon allows all IPs by default)

**Test connection**:
```bash
# Test locally
DATABASE_URL=your_connection_string npm run db:setup
```

### Authentication Issues

**Error**: "Unauthorized" or redirect loops

**Solutions**:
1. Verify all Stack Auth environment variables are set:
   - `NEXT_PUBLIC_STACK_PROJECT_ID`
   - `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
   - `STACK_SECRET_SERVER_KEY`
2. Check redirect URLs in Stack Auth dashboard match your domain
3. Clear browser cookies and try again
4. Verify `NEXT_PUBLIC_STACK_PROJECT_ID` starts with correct prefix

### Build Errors

**Error**: Build fails on Vercel

**Solutions**:
1. Check build logs in Vercel dashboard for specific errors
2. Ensure all dependencies are in `package.json`
3. Verify TypeScript compilation passes:
   ```bash
   npm run build
   ```
4. Check for missing environment variables
5. Verify `tsx` is in devDependencies (needed for scripts)

### Database Schema Issues

**Error**: Tables don't exist or migrations fail

**Solutions**:

1. **Use SQL Script** (Most Reliable):
   - Go to Neon SQL Editor
   - Copy `scripts/init-database.sql`
   - Paste and run
   - Verify with: `npm run db:verify`

2. **Use Drizzle Push**:
   ```bash
   # Set DATABASE_URL
   export DATABASE_URL=your_connection_string
   npm run db:push
   ```

3. **Check Existing Tables**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

### Missing Tables After Deployment

If tables are missing after deployment:

1. **Run SQL Script in Neon**:
   - Go to Neon Console → SQL Editor
   - Copy and paste `scripts/init-database.sql`
   - Execute

2. **Or Use Drizzle Locally**:
   ```bash
   # With production DATABASE_URL
   DATABASE_URL=production_url npm run db:push
   ```

## Environment Variables Reference

| Variable | Description | Where to Get It | Required |
|----------|-------------|-----------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Neon Console → Connection Details | ✅ Yes |
| `NEXT_PUBLIC_STACK_PROJECT_ID` | Stack Auth project ID | Stack Auth Dashboard | ✅ Yes |
| `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | Stack Auth publishable key | Stack Auth Dashboard | ✅ Yes |
| `STACK_SECRET_SERVER_KEY` | Stack Auth secret key | Stack Auth Dashboard | ✅ Yes |

## Database Schema Verification

After setup, verify your database has:

- ✅ **6 ENUMs**: `event_type`, `rsvp_status`, `vendor_status`, `task_status`, `task_priority`, `user_role`
- ✅ **26 Tables**: All core tables including weddings, events, guests, vendors, budget, etc.
- ✅ **Indexes**: Proper indexes on foreign keys and frequently queried columns

Run verification:
```bash
npm run db:verify
```

## Custom Domain Setup

1. In Vercel dashboard, go to your project → **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Update Stack Auth redirect URLs to include your custom domain
5. Wait for DNS propagation (can take up to 48 hours)

## Monitoring & Maintenance

### Database Monitoring

- **Neon Dashboard**: Monitor queries, connections, and usage
- **Neon Metrics**: Track database performance
- **Connection Pooling**: Neon handles this automatically

### Application Monitoring

- **Vercel Analytics**: Enable in project settings
- **Error Tracking**: Consider adding Sentry
- **Logs**: Check Vercel function logs for errors

## Backup Strategy

1. **Database Backups**: 
   - Neon provides automatic daily backups
   - Can create manual backups from Neon dashboard
   - Point-in-time recovery available

2. **Code Backups**: 
   - Your code is in GitHub
   - Vercel keeps deployment history

3. **Data Export**: 
   - Use export features in the app (when implemented)
   - Or use Neon's export functionality

## Scaling Considerations

- **Database**: Neon auto-scales, monitor usage in dashboard
- **Serverless Functions**: Vercel handles scaling automatically
- **File Storage**: Consider Vercel Blob for file uploads (not yet implemented)

## Security Best Practices

1. ✅ Never commit `.env` files (already in `.gitignore`)
2. ✅ Use strong database passwords (Neon generates these)
3. ✅ Enable 2FA on all accounts (Vercel, Neon, Stack Auth)
4. ✅ Regularly rotate API keys
5. ✅ Keep dependencies updated: `npm audit fix`
6. ✅ Use HTTPS only (Vercel enforces this)

## Quick Reference Commands

```bash
# Local Development
npm install                    # Install dependencies
npm run dev                    # Start dev server
npm run db:push                # Push schema to database
npm run db:verify              # Verify database setup
npm run db:studio              # Open Drizzle Studio

# Database Management
npm run db:generate            # Generate migrations
npm run db:migrate             # Run migrations
npm run db:push                # Push schema (dev)
npm run db:verify              # Verify schema

# Production
npm run build                  # Build for production
npm run start                  # Start production server
```

## Getting Help

If you encounter issues:

1. **Check Logs**:
   - Vercel deployment logs
   - Neon database logs
   - Browser console

2. **Verify Setup**:
   - Run `npm run db:verify`
   - Check environment variables
   - Test database connection

3. **Common Issues**:
   - See Troubleshooting section above
   - Check GitHub issues
   - Review documentation

---

## Summary

**Quick Deployment Steps**:

1. ✅ Create Neon database → Get connection string
2. ✅ Run `scripts/init-database.sql` in Neon SQL Editor
3. ✅ Set up Stack Auth → Get credentials
4. ✅ Deploy to Vercel → Add environment variables
5. ✅ Verify: `npm run db:verify` and test app

**Your app should now be live!** 🎉

Visit your Vercel URL and start planning weddings!
