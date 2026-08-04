# Quick Deploy to Railway (5 Minutes)

Railway is the **easiest way to deploy** your TraitEdu app. This guide gets you live in ~5 minutes.

## Step 1: Prepare Your Code (2 minutes)

### 1.1 Update .env.production

```bash
# Create production environment file
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

Add these values:

```env
NODE_ENV=production
PORT=4000

# Supabase (copy from your dashboard)
SUPABASE_URL=https://pserepeylqabzxrourbv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZXJlcGV5bHFhYnp4cm91cmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NzI3MzQsImV4cCI6MjEwMTA0ODczNH0.v1V4Cioa_9LgElHcacdeTeaGUoQK7Mq7IeCZPP59h1M
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZXJlcGV5bHFhYnp4cm91cmJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQ3MjczNCwiZXhwIjoyMTAxMDQ4NzM0fQ.WSIxaagENPY50nCJgEZd2ic0V3IOnnLnm-xK2YiC5UU

# Generate a secure SESSION_SECRET (run in terminal):
# openssl rand -base64 32
SESSION_SECRET=your-generated-secret-here

SEED_SUPERADMIN_PASSWORD=SecureAdmin@123
SEED_BRANCH_ADMIN_PASSWORD=SecureAdmin@123
SEED_STUDENT_PASSWORD=SecureStudent@123
SEED_TEACHER_PASSWORD=SecureTeacher@123
```

### 1.2 Build Frontend

```bash
npm run build
```

This creates the `dist/` folder for production.

### 1.3 Commit to GitHub

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

---

## Step 2: Deploy Backend to Railway (2 minutes)

### 2.1 Go to Railway.app

1. Open: https://railway.app
2. Sign up with **GitHub** (easiest)
3. Authorize Railway to access your repositories

### 2.2 Create New Project

1. Click **"New Project"**
2. Click **"Deploy from GitHub repo"**
3. Select your **Trait-Edu** repository
4. Click **"Deploy Now"**

Railway will automatically:
- Detect Node.js
- Build your app
- Start the server

### 2.3 Add Environment Variables

1. In Railway dashboard, go to your project
2. Click **"Variables"** tab
3. Add all variables from your `.env.production`:

```
NODE_ENV=production
PORT=4000
SUPABASE_URL=https://pserepeylqabzxrourbv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
SESSION_SECRET=your-secret
SEED_SUPERADMIN_PASSWORD=SecureAdmin@123
SEED_BRANCH_ADMIN_PASSWORD=SecureAdmin@123
SEED_STUDENT_PASSWORD=SecureStudent@123
SEED_TEACHER_PASSWORD=SecureTeacher@123
```

### 2.4 Get Your API URL

1. In Railway, click your project
2. Click **"Connect"** tab
3. Copy your **Railway Domain** (looks like: `https://traitedu-production.up.railway.app`)
4. Save this URL - you'll need it for the frontend

### 2.5 Test Backend

```bash
# Test if API is working
curl https://your-railway-url.up.railway.app/api/health
```

You should see a response (might be an error, but the server is running).

---

## Step 3: Deploy Frontend to Vercel (1 minute)

### 3.1 Go to Vercel.com

1. Open: https://vercel.com
2. Sign up with **GitHub**
3. Authorize Vercel

### 3.2 Import Your Project

1. Click **"New Project"**
2. Click **"Import Git Repository"**
3. Select **Trait-Edu** repository
4. Click **"Import"**

### 3.3 Configure Frontend

Vercel should auto-detect:
- Framework: **Vite** ✓
- Build command: `npm run build` ✓
- Output directory: `dist` ✓

Add **Environment Variable**:
- Name: `VITE_API_URL`
- Value: `https://your-railway-url.up.railway.app`

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait for build (2-3 minutes)
3. Get your URL: `https://your-app.vercel.app`

---

## Step 4: Connect Frontend to Backend (1 minute)

### 4.1 Update Frontend Code

In your frontend, find where you call the API and update:

**Before:**
```javascript
const API_URL = 'http://localhost:4000'
```

**After:**
```javascript
const API_URL = process.env.VITE_API_URL || 'http://localhost:4000'
```

### 4.2 Deploy Updated Code

```bash
git add .
git commit -m "Update API URL for production"
git push origin main
```

Vercel will automatically redeploy.

---

## Step 5: Test Everything

### 5.1 Test Backend API

```bash
curl https://your-railway-url.up.railway.app/api/health
```

Should return: `{"status":"ok"}` (or similar)

### 5.2 Test Frontend

1. Open: `https://your-app.vercel.app`
2. Check browser console for errors
3. Try logging in with seed credentials:
   - Username: `admin` or `student`
   - Password: (from SEED_*_PASSWORD in .env)

### 5.3 Check Logs

**Railway:**
- Dashboard → Your Project → Logs

**Vercel:**
- Dashboard → Your Project → Deployments → View Logs

---

## Done! 🎉

Your TraitEdu app is now live!

- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-railway-url.up.railway.app`
- **Database**: Supabase (managed automatically)

---

## Cost

- **Railway Backend**: Free tier, then $5+/month
- **Vercel Frontend**: Free
- **Supabase Database**: Free tier, then $25+/month
- **Total**: ~$5-30/month

---

## Monitoring & Maintenance

### Check Logs Daily

**Railway:**
```
Dashboard → Logs → Check for errors
```

**Vercel:**
```
Dashboard → Function Logs → Check for errors
```

### Update Environment Variables

To change any settings (like passwords):

**Railway:**
1. Go to Variables tab
2. Edit the value
3. Changes apply automatically

**Vercel:**
1. Go to Settings → Environment Variables
2. Edit and redeploy

### Deploy Updates

When you push code to GitHub:
1. Railway automatically redeploys backend
2. Vercel automatically redeploys frontend

No manual steps needed!

---

## Troubleshooting

### Frontend won't load

1. Check Vercel logs: Dashboard → Deployments
2. Verify `VITE_API_URL` is set correctly
3. Clear browser cache

### API returns 404

1. Check Railway logs
2. Verify backend is running
3. Check `NODE_ENV=production` is set

### Can't connect to Supabase

1. Verify credentials in Railway Variables
2. Check Supabase dashboard is active
3. Verify schema is applied

### App is slow

1. Use Railway's Performance tab
2. Check database query performance in Supabase
3. Enable caching on Vercel

---

## Next Steps

1. ✅ Deploy backend to Railway
2. ✅ Deploy frontend to Vercel
3. ✅ Connect them together
4. ✅ Test everything works
5. Add custom domain (optional)
6. Setup monitoring
7. Configure backups
8. Add team members

Need help? Check `DEPLOYMENT_GUIDE.md` for detailed instructions on each platform.
