# Deployment Checklist & Quick Commands

## Database Setup (Supabase)
```bash
# 1. Create project at https://supabase.com
# 2. Copy these from Settings → API:
#    - SUPABASE_URL
#    - SUPABASE_ANON_KEY
#    - SUPABASE_SERVICE_ROLE_KEY

# 3. Get PostgreSQL connection string from Settings → Database → Connection strings
#    Format: postgresql://postgres:PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres

# 4. Test connection locally
export DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres"
npm run db:seed   # Run migrations if needed
```

## Backend Deployment (Vercel)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

### Step 2: Create vercel.json (✓ Already done)
```bash
# Already created, no action needed
ls -la vercel.json
```

### Step 3: Deploy
```bash
# First deployment (interactive)
vercel deploy

# Production deployment
vercel deploy --prod
```

### Step 4: Set Environment Variables in Vercel
**Option A: Via CLI**
```bash
vercel env add NODE_ENV production
vercel env add DATABASE_URL "postgresql://postgres:PASSWORD@..."
vercel env add SUPABASE_URL "https://your-ref.supabase.co"
vercel env add SUPABASE_ANON_KEY "your-anon-key"
vercel env add SUPABASE_SERVICE_ROLE_KEY "your-service-role-key"
vercel env add SESSION_SECRET "your-random-secret"
vercel env add ALLOWED_ORIGINS "https://your-domain.com"
```

**Option B: Via Vercel Dashboard**
1. Go to https://vercel.com → Your Project
2. Settings → Environment Variables
3. Add each variable manually
4. After adding, run: `vercel deploy --prod`

### Step 5: Verify Backend
```bash
# After deployment, test the API
curl https://your-project.vercel.app/api/health

# Should return: {"status":"ok"}
```

## Frontend Deployment (Hostinger)

### Step 1: Build Frontend
```bash
# Set the backend URL (replace with your Vercel URL)
export VITE_API_URL=https://your-project.vercel.app/api

# Build
npm run build

# Output: dist/ folder with all files
```

### Step 2: Upload to Hostinger
```bash
# Option A: Using FTP (recommended)
# 1. Get FTP credentials from Hostinger → Hosting → FTP Accounts
# 2. Use FileZilla or similar:
#    - Host: your-ftp-host
#    - Username: your-ftp-user
#    - Password: your-ftp-password
#    - Port: 21
# 3. Upload contents of 'dist/' to public_html/

# Option B: Using Hostinger File Manager (via website)
# 1. Login to Hostinger
# 2. Go to Hosting → File Manager
# 3. Navigate to public_html/
# 4. Upload dist/ contents
```

### Step 3: Configure Hostinger for React Router

**Create/Update: public_html/.htaccess**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Quick Reference URLs

After deployment, you'll have:
```
Frontend:  https://your-domain.com (or your Hostinger domain)
Backend:   https://your-project.vercel.app/api
Database:  Supabase Dashboard

Testing:
- Backend Health: https://your-project.vercel.app/api/health
- Frontend: https://your-domain.com
```

## Environment Variables Summary

### For Backend (.env.production)
```
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres
SUPABASE_URL=https://PROJECT-REF.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SESSION_SECRET=your-random-secret-string
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### For Frontend (.env.production.frontend)
```
VITE_API_URL=https://your-project.vercel.app/api
```

## Testing Checklist

- [ ] Backend deployment to Vercel successful
- [ ] `/api/health` endpoint returns 200
- [ ] All environment variables set in Vercel
- [ ] Frontend builds without errors
- [ ] Frontend uploaded to Hostinger
- [ ] `.htaccess` file is in place
- [ ] Frontend page loads without 404
- [ ] API calls from frontend reach backend
- [ ] No CORS errors in browser console
- [ ] Login/authentication works end-to-end
- [ ] Database queries return expected results

## Troubleshooting Quick Links

**502/503 Errors on Vercel:**
```bash
# Check Vercel logs
vercel logs <project-name>

# Redeploy
vercel deploy --prod
```

**CORS Errors:**
- Update `ALLOWED_ORIGINS` in `.env.production`
- Redeploy: `vercel deploy --prod`

**Database Connection Issues:**
- Test locally first: `npm run server`
- Check `DATABASE_URL` format
- Verify Supabase IP whitelist: Settings → Network

**Frontend shows 404s on routes:**
- Verify `.htaccess` is uploaded
- Test with `curl -I https://your-domain.com/any-path`
- Should redirect to index.html (200), not 404

## Important Files Created

✓ `vercel.json` - Vercel deployment config
✓ `.env.production` - Backend secrets
✓ `.env.production.frontend` - Frontend build vars
✓ `DEPLOYMENT_GUIDE.md` - Full deployment steps
✓ `DEPLOYMENT_CHECKLIST.md` - This file
