# Deploy TraitEdu to Hostinger (Step-by-Step)

Complete guide to deploy your TraitEdu app on Hostinger hosting.

## Prerequisites

✅ Hostinger account with hosting/VPS plan  
✅ Domain name (or Hostinger subdomain)  
✅ Supabase database configured (already done!)  
✅ Code pushed to GitHub (recommended)

---

## Part 1: Check Your Hostinger Plan

Hostinger offers different plans. Check what you have:

### 1. Shared Hosting
- Limited Node.js support
- Best for: Static sites only
- Not ideal for this app (needs Node.js backend)

### 2. Premium/Business Hosting  
- Better Node.js support
- Recommended for this app
- Check control panel for Node.js option

### 3. VPS Hosting
- Full control
- Best for Node.js apps
- Requires more technical setup
- Recommended option

**To check your plan:**
1. Log in to Hostinger: https://www.hostinger.com/client
2. Go to **"Hosting"** or **"VPS"**
3. Click your domain
4. Check plan type

---

## Part 2: Setup Backend on Hostinger

### Option A: Using Hostinger's Application Management (Easiest)

If your Hostinger plan supports Node.js apps:

#### Step 1: Connect GitHub Repository

1. In Hostinger Control Panel → **"Git Repositories"**
2. Click **"Add Git Repository"**
3. Connect your GitHub account
4. Select your **Trait-Edu** repository
5. Choose branch: **main**

#### Step 2: Deploy Node.js Application

1. Click **"Deploy Website"** or **"Deploy App"**
2. Select **"Node.js"** as runtime
3. Set Node version: **18** or **20**
4. Entry point: **server/server.js**
5. Click **"Deploy"**

#### Step 3: Add Environment Variables

1. Go to **"App Settings"** or **"Environment"**
2. Add these variables:

```
NODE_ENV=production
PORT=4000
SUPABASE_URL=https://pserepeylqabzxrourbv.supabase.co
SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_ROLE_KEY=your_key_here
SESSION_SECRET=your-generated-secret
SEED_SUPERADMIN_PASSWORD=SecurePassword@123
SEED_BRANCH_ADMIN_PASSWORD=SecurePassword@123
SEED_STUDENT_PASSWORD=SecurePassword@123
SEED_TEACHER_PASSWORD=SecurePassword@123
```

#### Step 4: Auto-Deployment

- Hostinger will auto-deploy when you push to GitHub
- Check deployment status in **"Deployments"** tab
- Your backend will be at: `https://your-domain.com` or subdomain

---

### Option B: Manual Deployment via SSH (More Control)

If Hostinger's automatic deployment isn't available:

#### Step 1: Connect via SSH

1. In Hostinger Control Panel → **"SSH/FTP Access"**
2. Create SSH account (if not exists)
3. Copy SSH credentials
4. Connect from your computer:

```bash
ssh username@your-host.com
# Enter password when prompted
```

#### Step 2: Install Node.js (if not installed)

```bash
# Check if Node is installed
node --version

# If not installed, ask Hostinger support to install Node.js
# Or use NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
node --version
```

#### Step 3: Clone Your Repository

```bash
cd /home/your-username
git clone https://github.com/your-username/Trait-Edu.git
cd Trait-Edu
npm install
npm run build
```

#### Step 4: Create .env File

```bash
nano .env.production
```

Add production environment variables:

```
NODE_ENV=production
PORT=4000
SUPABASE_URL=https://pserepeylqabzxrourbv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
SESSION_SECRET=your-generated-secret
```

Press `Ctrl+O`, then `Enter`, then `Ctrl+X` to save.

#### Step 5: Install PM2 (Process Manager)

```bash
npm install -g pm2
cd /home/your-username/Trait-Edu
pm2 start "npm run server" --name "traitedu-api"
pm2 startup
pm2 save
```

#### Step 6: Setup Nginx (Reverse Proxy)

```bash
# Check if Nginx is installed (ask Hostinger if not)
sudo systemctl status nginx

# Create config file
sudo nano /etc/nginx/sites-available/default
```

Replace with:

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    server_name your-domain.com www.your-domain.com;
    
    # Redirect API requests to Node.js
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Serve frontend static files
    location / {
        root /home/your-username/Trait-Edu/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

Save and restart Nginx:

```bash
sudo systemctl restart nginx
```

---

## Part 3: Deploy Frontend

### Option A: Deploy on Hostinger (Easiest)

If using Hostinger's file manager:

#### Step 1: Build Frontend Locally

```bash
npm run build
```

This creates a `dist/` folder.

#### Step 2: Upload to Hostinger

1. In Hostinger Control Panel → **"File Manager"**
2. Go to `public_html` folder
3. Delete existing files
4. Upload contents of your `dist/` folder
5. Done!

#### Step 3: Configure .htaccess (for routing)

Create `.htaccess` in `public_html`:

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

This enables React Router to work properly.

#### Step 4: Update API URL

Before deploying, update your frontend code:

In `src/main.jsx` or where you make API calls:

```javascript
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:4000'
  : 'https://your-domain.com'
```

### Option B: Deploy Frontend on Vercel (Recommended)

Keep your frontend on Vercel (faster, more reliable):

1. Go to https://vercel.com
2. Import your repository
3. Set environment variable:
   - `VITE_API_URL=https://your-hostinger-domain.com`
4. Deploy

Then only deploy the backend on Hostinger.

---

## Part 4: Setup Domain & SSL

### 1. Point Domain to Hostinger

1. In your domain registrar (GoDaddy, Namecheap, etc.)
2. Go to DNS settings
3. Point to Hostinger nameservers (provided by Hostinger)
4. Wait 24 hours for DNS to propagate

### 2. Enable SSL Certificate

1. Hostinger Control Panel → **"SSL Certificate"**
2. Click **"Manage SSL"**
3. Enable **"Free Let's Encrypt SSL"**
4. Wait for certificate to be issued (5 minutes)

### 3. Force HTTPS

Edit `.htaccess`:

```apache
# Force HTTPS
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

---

## Part 5: Complete Setup Checklist

```
Backend Setup
☐ SSH into Hostinger
☐ Clone GitHub repository
☐ Install dependencies: npm install
☐ Build app: npm run build
☐ Create .env.production with Supabase credentials
☐ Install PM2: npm install -g pm2
☐ Start app: pm2 start "npm run server"
☐ Setup Nginx reverse proxy
☐ Test backend: curl https://your-domain.com/api/health

Frontend Setup
☐ Build locally: npm run build
☐ Upload dist/ files to Hostinger public_html
☐ Create .htaccess for routing
☐ Update API URL in code

Domain & SSL
☐ Point domain to Hostinger nameservers
☐ Enable Let's Encrypt SSL
☐ Force HTTPS in .htaccess
☐ Verify certificate is active

Testing
☐ Visit https://your-domain.com
☐ Check console for errors
☐ Test API: curl https://your-domain.com/api/health
☐ Test login functionality
☐ Check Hostinger logs for errors
```

---

## Part 6: Environment Variables Setup

### On Hostinger (if using Node.js app deployment):

In Control Panel → Environment:

```
NODE_ENV=production
PORT=4000
SUPABASE_URL=https://pserepeylqabzxrourbv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZXJlcGV5bHFhYnp4cm91cmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NzI3MzQsImV4cCI6MjEwMTA0ODczNH0.v1V4Cioa_9LgElHcacdeTeaGUoQK7Mq7IeCZPP59h1M
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZXJlcGV5bHFhYnp4cm91cmJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQ3MjczNCwiZXhwIjoyMTAxMDQ4NzM0fQ.WSIxaagENPY50nCJgEZd2ic0V3IOnnLnm-xK2YiC5UU
SESSION_SECRET=your-generated-secret-here
SEED_SUPERADMIN_PASSWORD=SecureAdmin@123
SEED_BRANCH_ADMIN_PASSWORD=SecureAdmin@123
SEED_STUDENT_PASSWORD=SecureStudent@123
SEED_TEACHER_PASSWORD=SecureTeacher@123
```

---

## Part 7: Monitor & Maintain

### Check Status

**If using PM2:**
```bash
ssh username@your-host.com
pm2 status
pm2 logs traitedu-api
```

**If using Hostinger's app management:**
- Control Panel → Deployments → View logs

### Update Code

**Method 1: Auto-deployment (if enabled)**
```bash
# Just push to GitHub
git push origin main
# Hostinger automatically deploys
```

**Method 2: Manual update**
```bash
ssh username@your-host.com
cd Trait-Edu
git pull origin main
npm install
npm run build
pm2 restart traitedu-api
```

### Monitor Logs

**Hostinger Control Panel:**
- Go to **"Logs"** → **"Error Logs"** or **"Access Logs"**
- Check for any issues

**Via SSH:**
```bash
pm2 logs traitedu-api
tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

### Problem: "Application not starting"

**Solution:**
1. Check environment variables are set
2. Verify Supabase credentials are correct
3. Check logs: `pm2 logs`
4. Test Supabase connection:
   ```bash
   node -e "require('dotenv').config(); const pg = require('pg'); const pool = new pg.Pool({connectionString: process.env.SUPABASE_URL}); pool.query('SELECT 1', (err, res) => console.log(err || 'OK'))"
   ```

### Problem: "Frontend can't reach API"

**Solution:**
1. Check API URL in frontend code
2. Verify backend is running: `curl https://your-domain.com/api/health`
3. Check CORS configuration in `server/server.js`
4. Verify domain DNS is pointing to Hostinger

### Problem: "SSL certificate not working"

**Solution:**
1. Wait 24 hours for DNS propagation
2. Re-issue certificate in Hostinger control panel
3. Clear browser cache
4. Try different browser

### Problem: "High latency/slow load times"

**Solution:**
1. Enable gzip compression in Nginx
2. Optimize database queries in Supabase
3. Enable caching in Nginx
4. Consider upgrading Hostinger plan

### Problem: "Database connection timeout"

**Solution:**
1. Verify Supabase credentials in environment variables
2. Check Supabase project is active (dashboard)
3. Verify IP whitelist in Supabase settings
4. Test connection manually:
   ```bash
   psql "postgresql://postgres:password@host:5432/postgres"
   ```

---

## Performance Tips

### 1. Enable Gzip Compression

In Nginx config:

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### 2. Enable Caching

```nginx
# Cache static files for 1 year
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Optimize Database

In Supabase dashboard:
- Enable query performance monitoring
- Check slow queries
- Add indexes for frequently queried columns

---

## Production Checklist

```
Before Going Live
☐ Test all functionality on staging
☐ Verify SSL certificate is valid
☐ Setup error logging/monitoring
☐ Configure database backups
☐ Set up admin email alerts
☐ Test all user roles (admin, student, teacher)
☐ Verify all images/files load correctly
☐ Test on mobile devices
☐ Performance test with load testing tool

After Going Live
☐ Monitor error logs daily
☐ Check server uptime
☐ Monitor database usage
☐ Verify backups are working
☐ Plan for scaling if needed
☐ Keep Node.js updated
☐ Keep packages updated monthly
```

---

## Support

**Hostinger Issues:**
- Email: Hostinger Support
- Knowledge Base: https://support.hostinger.com

**Node.js/App Issues:**
- Check logs with `pm2 logs`
- Review this guide's troubleshooting section

**Database Issues:**
- Supabase Docs: https://supabase.com/docs
- Check Supabase dashboard

---

## Cost

- Hostinger Hosting: $2.99-$20/month (your current plan)
- Supabase Database: Free-$25/month
- Domain: $0-15/year (if using Hostinger)
- **Total: ~$5-35/month**

---

## Next Steps

1. Decide: Hostinger app deployment or manual SSH setup
2. Follow Part 2 (Backend setup)
3. Follow Part 3 (Frontend setup)
4. Follow Part 4 (Domain & SSL)
5. Test everything thoroughly
6. Monitor logs and performance

Need help with specific Hostinger features? Let me know!
