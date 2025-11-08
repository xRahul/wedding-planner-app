# Setup Checklist

Use this checklist to ensure everything is set up correctly.

## Pre-Deployment Checklist

### 1. Database Setup (Neon Postgres)

- [ ] Created Neon project at [console.neon.tech](https://console.neon.tech)
- [ ] Copied connection string from Neon dashboard
- [ ] Initialized database schema using one of:
  - [ ] Option A: Ran `scripts/init-database.sql` in Neon SQL Editor (Recommended)
  - [ ] Option B: Ran `npm run db:push` locally
  - [ ] Option C: Ran `npm run db:generate && npm run db:migrate`
- [ ] Verified database setup: `npm run db:verify`
  - [ ] All 6 ENUMs exist
  - [ ] All 26 tables exist
  - [ ] Verification passed ✅

### 2. Stack Auth Setup

- [ ] Created Stack Auth project
- [ ] Enabled Email/Password authentication
- [ ] Set redirect URLs:
  - [ ] Development: `http://localhost:3000/handler/*`
  - [ ] Production: `https://your-domain.vercel.app/handler/*` (after deployment)
- [ ] Copied credentials:
  - [ ] Project ID
  - [ ] Publishable Client Key
  - [ ] Secret Server Key

### 3. Local Environment

- [ ] Created `.env.local` file
- [ ] Added `DATABASE_URL` (Neon connection string)
- [ ] Added `NEXT_PUBLIC_STACK_PROJECT_ID`
- [ ] Added `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
- [ ] Added `STACK_SECRET_SERVER_KEY`
- [ ] Installed dependencies: `npm install`
- [ ] Tested locally: `npm run dev`
- [ ] Can sign up for account
- [ ] Can sign in
- [ ] Can create a wedding

### 4. Vercel Deployment

- [ ] Pushed code to GitHub
- [ ] Created Vercel project
- [ ] Connected GitHub repository
- [ ] Added environment variables in Vercel:
  - [ ] `DATABASE_URL`
  - [ ] `NEXT_PUBLIC_STACK_PROJECT_ID`
  - [ ] `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
  - [ ] `STACK_SECRET_SERVER_KEY`
- [ ] Deployed successfully
- [ ] Got deployment URL

### 5. Post-Deployment Verification

- [ ] Database is accessible from production
  - [ ] Verified with `npm run db:verify` using production DATABASE_URL
  - [ ] Or checked tables in Neon SQL Editor
- [ ] Updated Stack Auth redirect URLs with production domain
- [ ] Tested production app:
  - [ ] Can sign up
  - [ ] Can sign in
  - [ ] Can create wedding
  - [ ] Can add guests
  - [ ] Can add vendors
  - [ ] Can add events
  - [ ] Can add tasks
  - [ ] Can view budget

## Feature Testing Checklist

### Core Features

- [ ] **Wedding Management**
  - [ ] Create wedding
  - [ ] Edit wedding details
  - [ ] View wedding dashboard

- [ ] **Guest Management**
  - [ ] Add guest
  - [ ] Edit guest
  - [ ] Update RSVP status
  - [ ] Search guests
  - [ ] View guest list

- [ ] **Vendor Management**
  - [ ] Add vendor
  - [ ] Edit vendor
  - [ ] Update vendor status
  - [ ] View vendor list

- [ ] **Event Management**
  - [ ] Create event
  - [ ] Edit event
  - [ ] View events list

- [ ] **Task Management**
  - [ ] Create task
  - [ ] Edit task
  - [ ] Update task status
  - [ ] View tasks list

- [ ] **Budget Management**
  - [ ] Create budget category
  - [ ] View budget overview
  - [ ] See budget vs. actual

## Database Verification Commands

```bash
# Verify database schema
npm run db:verify

# Expected output:
# ✅ All 6 required ENUMs exist
# ✅ All 26 required tables exist
# ✅ Database verification PASSED
```

## Quick Test Script

After deployment, test these endpoints (replace with your domain):

```bash
# Health check
curl https://your-app.vercel.app/

# Should return HTML (homepage)

# Test database connection (if you have a test endpoint)
# The app should show "Database connected" on homepage
```

## Common Issues & Solutions

### Issue: Database not connecting

**Check:**
- [ ] DATABASE_URL is correct in Vercel
- [ ] Database is active (not paused) in Neon
- [ ] Connection string includes `?sslmode=require`
- [ ] Run `npm run db:verify` to check schema

**Fix:**
- Re-run `scripts/init-database.sql` in Neon SQL Editor
- Or run `npm run db:push` with production DATABASE_URL

### Issue: Authentication not working

**Check:**
- [ ] All Stack Auth env vars are set in Vercel
- [ ] Redirect URLs match your domain
- [ ] Stack Auth project is active

**Fix:**
- Update redirect URLs in Stack Auth dashboard
- Clear browser cookies
- Verify env vars are set for Production environment

### Issue: Build fails

**Check:**
- [ ] All dependencies in package.json
- [ ] TypeScript compiles: `npm run build`
- [ ] No missing environment variables

**Fix:**
- Check Vercel build logs
- Run `npm install` locally to verify
- Ensure `tsx` is in devDependencies

## Success Criteria

Your deployment is successful when:

✅ Database verification passes  
✅ Can sign up and sign in  
✅ Can create a wedding  
✅ Can add guests, vendors, events, tasks  
✅ All pages load without errors  
✅ No console errors in browser  

## Next Steps After Setup

1. **Customize**: Update branding, colors, etc.
2. **Add Features**: Implement remaining features (menus, dances, travel)
3. **Test**: Thoroughly test all features
4. **Monitor**: Set up monitoring and error tracking
5. **Backup**: Set up regular database backups
6. **Document**: Document any customizations

---

**Need Help?**
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
- See [QUICK_START.md](./QUICK_START.md) for quick setup
- Check troubleshooting sections in documentation

