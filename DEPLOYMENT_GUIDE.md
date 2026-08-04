# TraitEdu Deployment Guide

Complete guide to deploy your school management platform to production.

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│         User's Browser                          │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│  Frontend (React + Vite)                        │
│  Hosted on: Vercel / Netlify / AWS S3           │
│  URL: yourapp.com                               │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│  Backend API (Node.js + Express)                │
│  Hosted on: Heroku / Railway / AWS / DigitalOcean
│  URL: api.yourapp.com                           │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│  Database (PostgreSQL)                          │
│  Hosted on: Supabase (Already configured!)      │
│  URL: pserepeylqabzxrourbv.supabase.co          │
└─────────────────────────────────────────────────┘
```

---

## Option 1: Deploy Everything (Recommended for Production)

### Part A: Prepare for Production

#### 1. Update Environment Variables

Create `.env.production`:

```bash
cp .env.production.example .env.production
```

Edit `.env.production` with production values:

```env
NODE_ENV=production
PORT=4000

# Supabase (already configured)
SUPABASE_URL=https://pserepeylqabzxrourbv.supabase.co
SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_ROLE_KEY=your_key_here

# Security (IMPORTANT: Change these!)
SESSION_SECRET=generate-a-long-random-string-here

# Seed passwords (if needed)
SEED_SUPERADMIN_PASSWORD=secure-password
SEED_BRANCH_ADMIN_PASSWORD=secure-password
SEED_STUDENT_PASSWORD=secure-password
SEED_TEACHER_PASSWORD=secure-password
```

**Generate a secure SESSION_SECRET:**
```bash
# On macOS/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

#### 2. Build the Frontend

```bash
npm run build
```

This creates a `dist/` folder with optimized production build.

#### 3. Verify Configuration

```bash
# Check that .env.production exists
ls -la .env.production

# Verify Supabase connection works
node -e "require('dotenv').config({path: '.env.production'}); console.log('SUPABASE_URL:', process.env.SUPABASE_URL)"
```

---

### Part B: Deploy Backend

Choose one option based on your preference:

#### **Option B1: Deploy to Railway (Easiest)**

Railway is the easiest for beginners - automatic deployment from GitHub.

**Setup:**

1. **Create Railway Account**
   - Go to: https://railway.app
   - Sign up with GitHub

2. **Connect GitHub Repository**
   - Click "New Project" → "Deploy from GitHub"
   - Select your TraitEdu repository
   - Authorize Railway

3. **Configure Environment Variables**
   - In Railway dashboard, go to your project
   - Click "Variables" tab
   - Add all variables from `.env.production`:
     ```
     NODE_ENV=production
     PORT=4000
     SUPABASE_URL=...
     SUPABASE_ANON_KEY=...
     SUPABASE_SERVICE_ROLE_KEY=...
     SESSION_SECRET=...
     ```

4. **Add Start Script**
   - Railway auto-detects `npm start` from `package.json`
   - Add this to your `package.json` if not present:
     ```json
     "start": "node server/server.js"
     ```

5. **Deploy**
   - Push code to GitHub
   - Railway automatically builds and deploys
   - Get your API URL from Railway dashboard

**Result:**
- Backend running at: `https://your-app.up.railway.app`

---

#### **Option B2: Deploy to Heroku**

Classic and reliable platform.

**Setup:**

1. **Create Heroku Account**
   - Go to: https://heroku.com
   - Sign up

2. **Install Heroku CLI**
   ```bash
   brew tap heroku/brew && brew install heroku
   ```

3. **Login to Heroku**
   ```bash
   heroku login
   ```

4. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set PORT=4000
   heroku config:set SUPABASE_URL=https://pserepeylqabzxrourbv.supabase.co
   heroku config:set SUPABASE_ANON_KEY=your_key
   heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_key
   heroku config:set SESSION_SECRET=your_secret
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

7. **View Logs**
   ```bash
   heroku logs --tail
   ```

**Result:**
- Backend running at: `https://your-app-name.herokuapp.com`

---

#### **Option B3: Deploy to DigitalOcean**

More control, slightly more setup.

**Setup:**

1. **Create DigitalOcean Account**
   - Go to: https://digitalocean.com
   - Sign up (get $200 free credit)

2. **Create Droplet (Virtual Server)**
   - Click "Create" → "Droplets"
   - Choose: Ubuntu 22.04 LTS
   - Size: Basic ($5-6/month)
   - Choose datacenter region closest to users
   - Add SSH key (or password)
   - Create Droplet

3. **Connect to Droplet**
   ```bash
   ssh root@your_droplet_ip
   ```

4. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   node --version
   ```

5. **Install PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   ```

6. **Clone Your Repository**
   ```bash
   git clone https://github.com/yourusername/Trait-Edu.git
   cd Trait-Edu
   npm install
   npm run build
   ```

7. **Create .env.production**
   ```bash
   nano .env.production
   # Paste your production environment variables
   ```

8. **Start with PM2**
   ```bash
   pm2 start "npm run server" --name "traitedu-api"
   pm2 startup
   pm2 save
   ```

9. **Setup Nginx (Reverse Proxy)**
   ```bash
   sudo apt-get install nginx
   sudo nano /etc/nginx/sites-available/default
   ```

   Add this configuration:
   ```nginx
   server {
       listen 80 default_server;
       listen [::]:80 default_server;
       
       server_name api.yourapp.com;
       
       location / {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Then restart Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

**Result:**
- Backend running at: `https://api.yourapp.com`

---

### Part C: Deploy Frontend

Choose one option:

#### **Option C1: Deploy to Vercel (Easiest)**

Vercel is made by the creators of Next.js and works great with Vite.

**Setup:**

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Sign up with GitHub

2. **Import Your Project**
   - Click "New Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Build Settings**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables:
     ```
     VITE_API_URL=https://your-api-url.com
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Get your URL: `https://your-app.vercel.app`

5. **Configure API URL**
   - Update your frontend code to use production API:
     ```javascript
     const API_URL = process.env.VITE_API_URL || 'http://localhost:4000'
     ```

**Result:**
- Frontend running at: `https://your-app.vercel.app`

---

#### **Option C2: Deploy to Netlify**

Alternative to Vercel.

**Setup:**

1. **Go to Netlify**
   - Visit: https://netlify.com
   - Sign up with GitHub

2. **New Site from Git**
   - Click "New site from Git"
   - Select GitHub repository

3. **Configure Build**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Add Environment Variables**
   - Under "Site settings" → "Build & deploy" → "Environment"
   - Add: `VITE_API_URL=https://your-api-url.com`

5. **Deploy**
   - Netlify automatically deploys on push to main

**Result:**
- Frontend running at: `https://your-site.netlify.app`

---

#### **Option C3: Deploy to AWS S3 + CloudFront**

Most scalable option.

**Setup:**

1. **Create S3 Bucket**
   ```bash
   # Using AWS CLI
   aws s3 mb s3://your-app-name
   aws s3 cp dist/ s3://your-app-name/ --recursive
   ```

2. **Enable Static Website Hosting**
   - AWS Console → S3 → Your bucket → Properties
   - Enable "Static website hosting"
   - Index: `index.html`

3. **Setup CloudFront**
   - AWS Console → CloudFront → Create distribution
   - Origin: Your S3 bucket
   - Viewer Policy: Redirect HTTP to HTTPS

**Result:**
- Frontend running at: CloudFront URL

---

## Part D: Connect Frontend to Backend

### 1. Update API Endpoints

In your frontend code, find API calls and update them:

**Before (Development):**
```javascript
const API_URL = 'http://localhost:4000'
```

**After (Production):**
```javascript
const API_URL = process.env.VITE_API_URL || 'http://localhost:4000'
```

### 2. Update Environment in Vite Config

In `vite.config.js`, add proxy for development:

```javascript
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  }
}
```

### 3. Enable CORS on Backend

Update `server/server.js`:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

Then set `FRONTEND_URL` in production environment:
```bash
FRONTEND_URL=https://your-frontend-url.com
```

---

## Option 2: Quick Deploy (All-in-One)

If you want everything in one place, use:

### **Railway (Easiest)**

Deploy both frontend and backend on Railway:

1. Go to Railway.app
2. New Project → Deploy from GitHub
3. Select your repository
4. Railway detects Node.js and auto-configures
5. Set environment variables (as shown above)
6. Add custom domain
7. Done!

Cost: $5-10/month for both

---

## Deployment Checklist

- [ ] Created `.env.production` with all variables
- [ ] Generated secure `SESSION_SECRET`
- [ ] Verified Supabase database is accessible
- [ ] Built frontend: `npm run build`
- [ ] Deployed backend to Railway/Heroku/DigitalOcean
- [ ] Deployed frontend to Vercel/Netlify/AWS
- [ ] Updated API URL in frontend code
- [ ] Configured CORS on backend
- [ ] Added custom domain (optional)
- [ ] Tested all APIs in production
- [ ] Set up error logging/monitoring
- [ ] Configured backups for database

---

## Post-Deployment

### 1. Test Your App

```bash
# Test backend
curl https://your-api-url.com/api/health

# Test frontend
Visit: https://your-frontend-url.com
```

### 2. Monitor Logs

**Railway:**
- Dashboard → Logs

**Heroku:**
```bash
heroku logs --tail
```

**DigitalOcean:**
```bash
ssh root@your_ip
pm2 logs
```

### 3. Setup Error Tracking

Add error monitoring (optional but recommended):

```bash
npm install sentry-cli
```

Then configure in your code to catch errors in production.

### 4. Enable HTTPS

Most platforms do this automatically. If not:

**Let's Encrypt (Free):**
```bash
sudo apt-get install certbot
sudo certbot certonly --standalone -d your-domain.com
```

### 5. Setup Backups

For Supabase, backups are automatic. For custom setup:
```bash
# Backup Supabase data
pg_dump postgresql://... > backup.sql
```

---

## Troubleshooting Deployment

### App won't start
```bash
# Check logs
heroku logs --tail  # or railway logs

# Common issues:
# - Missing environment variables
# - Port already in use
# - Database connection failed
```

### Frontend can't reach API
```bash
# Check CORS configuration
# Verify API URL in frontend
# Check firewall rules
curl https://your-api-url.com/api/health
```

### Database connection error
```bash
# Verify Supabase credentials
# Check IP whitelist (Supabase → Settings → Database)
# Ensure schema is applied
```

### High latency
```bash
# Deploy closer to users (use regional servers)
# Enable caching
# Optimize database queries
```

---

## Cost Estimates (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| Supabase | Free-$25 | Included, managed DB |
| Backend (Railway) | $5-20 | Scales with usage |
| Frontend (Vercel) | Free-$20 | Free for most apps |
| **Total** | **~$10-40** | Scalable as you grow |

---

## Next Steps

1. **Choose hosting**: Railway (easiest) or Heroku (most popular)
2. **Deploy backend**: Follow Part B above
3. **Deploy frontend**: Follow Part C above
4. **Test**: Verify everything works
5. **Monitor**: Check logs regularly

Need help with any specific platform? Let me know!
