# Deployment Checklist

Use this checklist to ensure everything is ready for deployment to Vercel.

## Pre-Deployment Checklist

### Code Preparation
- [x] All code is committed to Git
- [x] Repository is pushed to GitHub
- [x] All features are implemented (see FEATURES.md)
- [x] Database schema is complete (26 tables, 6 enums)
- [x] All API endpoints are functional
- [x] Documentation is complete

### Files Verification
- [x] `package.json` - Dependencies configured
- [x] `drizzle.config.ts` - Database config present
- [x] `vercel.json` - Vercel config present
- [x] `scripts/init-database.sql` - Database initialization script
- [x] `lib/db/schema.ts` - Complete database schema
- [x] `.gitignore` - Excludes `.env.local`, `node_modules`, etc.

### Documentation Files
- [x] `README.md` - Main documentation
- [x] `VERCEL_DEPLOYMENT.md` - Complete deployment guide
- [x] `DEPLOYMENT.md` - Alternative deployment guide
- [x] `FEATURES.md` - Complete features list
- [x] `PROJECT_SUMMARY.md` - Project overview
- [x] `FEATURE_STATUS.md` - Implementation status

## Setup Checklist

### 1. Neon Database Setup
- [ ] Create Neon account at [neon.tech](https://neon.tech)
- [ ] Create new project in Neon Console
- [ ] Choose region (recommended: same as Vercel region)
- [ ] Copy connection string from Neon Console
- [ ] Run `scripts/init-database.sql` in Neon SQL Editor
- [ ] Verify database has 26 tables
- [ ] Test connection: `npm run db:verify`

### 2. Stack Auth Setup
- [ ] Create Stack Auth account at [stack-auth.com](https://stack-auth.com)
- [ ] Create new project in Stack Auth Dashboard
- [ ] Enable Email/Password authentication
- [ ] Configure redirect URLs:
  - Development: `http://localhost:3000/handler/*`
  - Production: `https://your-app.vercel.app/handler/*` (update after deployment)
- [ ] Copy credentials:
  - Project ID
  - Publishable Client Key
  - Secret Server Key

### 3. Local Development Setup
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Create `.env.local` file
- [ ] Add environment variables to `.env.local`:
  - `DATABASE_URL`
  - `NEXT_PUBLIC_STACK_PROJECT_ID`
  - `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
  - `STACK_SECRET_SERVER_KEY`
- [ ] Test locally: `npm run dev`
- [ ] Verify database connection works
- [ ] Test authentication (sign up/sign in)

## Vercel Deployment Checklist

### 1. Initial Deployment
- [ ] Create Vercel account at [vercel.com](https://vercel.com)
- [ ] Connect GitHub account to Vercel
- [ ] Import repository from GitHub
- [ ] Verify project settings:
  - Framework: Next.js (auto-detected)
  - Root Directory: `./`
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`

### 2. Environment Variables
- [ ] Add `DATABASE_URL` (Production, Preview, Development)
- [ ] Add `NEXT_PUBLIC_STACK_PROJECT_ID` (Production, Preview, Development)
- [ ] Add `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` (Production, Preview, Development)
- [ ] Add `STACK_SECRET_SERVER_KEY` (Production, Preview, Development)
- [ ] Verify all 4 variables are set for all 3 environments

### 3. Deploy
- [ ] Click "Deploy" button
- [ ] Wait for build to complete
- [ ] Note deployment URL
- [ ] Check build logs for errors

### 4. Post-Deployment Verification
- [ ] App loads at Vercel URL
- [ ] Can sign up for account
- [ ] Can sign in
- [ ] Can create wedding
- [ ] Database connection works
- [ ] All features accessible

### 5. Final Configuration
- [ ] Update Stack Auth redirect URLs with production domain
- [ ] Verify database has 26 tables (check in Neon)
- [ ] Test all major features:
  - [ ] Guest management
  - [ ] Vendor management
  - [ ] Budget tracking
  - [ ] Event planning
  - [ ] Task management
  - [ ] Menu planning
  - [ ] Reports export

## Optional Setup

### Neon Integration (Recommended)
- [ ] Go to Vercel → Settings → Integrations
- [ ] Add Neon integration
- [ ] Connect Neon account
- [ ] Select Neon project
- [ ] This auto-configures `DATABASE_URL`

### Custom Domain (Optional)
- [ ] Go to Vercel → Settings → Domains
- [ ] Add custom domain
- [ ] Configure DNS records
- [ ] Update Stack Auth redirect URLs
- [ ] Wait for DNS propagation

## Troubleshooting Checklist

If something doesn't work:

### Database Issues
- [ ] Verify `DATABASE_URL` is correct in Vercel
- [ ] Check Neon database is active (not paused)
- [ ] Verify connection string includes `?sslmode=require`
- [ ] Run `npm run db:verify` locally with production DATABASE_URL
- [ ] Check if tables exist: Run SQL in Neon SQL Editor

### Authentication Issues
- [ ] Verify all Stack Auth variables are set
- [ ] Check redirect URLs in Stack Auth dashboard
- [ ] Clear browser cookies
- [ ] Verify variable names are exact (case-sensitive)
- [ ] Check Vercel function logs for errors

### Build Issues
- [ ] Check build logs in Vercel dashboard
- [ ] Verify all dependencies in `package.json`
- [ ] Test build locally: `npm run build`
- [ ] Check for TypeScript errors
- [ ] Verify `tsx` is in devDependencies

## Quick Reference

### Environment Variables
```
DATABASE_URL=postgres://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
NEXT_PUBLIC_STACK_PROJECT_ID=your_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_publishable_key
STACK_SECRET_SERVER_KEY=your_secret_key
```

### Verification Commands
```bash
# Verify database locally
npm run db:verify

# Test build
npm run build

# Start dev server
npm run dev
```

### Important URLs
- Neon Console: https://console.neon.tech
- Vercel Dashboard: https://vercel.com/dashboard
- Stack Auth Dashboard: https://stack-auth.com

## Success Criteria

Your deployment is successful when:
- ✅ App loads at Vercel URL
- ✅ Can sign up and sign in
- ✅ Can create a wedding
- ✅ Can add guests, vendors, events
- ✅ Database has 26 tables
- ✅ All features work correctly

## Next Steps After Deployment

1. **Test All Features**
   - Create a test wedding
   - Add sample data (guests, vendors, events)
   - Test all CRUD operations
   - Test export functionality

2. **Monitor Performance**
   - Check Vercel analytics
   - Monitor Neon database usage
   - Check error logs

3. **Backup Strategy**
   - Neon provides automatic backups
   - Export data regularly using Reports feature
   - Keep code in GitHub

4. **Security**
   - Enable 2FA on all accounts
   - Regularly rotate API keys
   - Keep dependencies updated

---

## Summary

**Ready for Deployment**: ✅ Yes

All code is complete, tested, and documented. Follow the steps above to deploy to Vercel.

**For detailed instructions**, see:
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Complete step-by-step guide
- **[README.md](./README.md)** - Main documentation

---

**Need Help?** Check the troubleshooting sections in VERCEL_DEPLOYMENT.md or DEPLOYMENT.md

