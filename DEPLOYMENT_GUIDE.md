# Deployment Guide: Hostinger (Frontend) + Vercel (Backend) + Supabase (Database)

## Architecture Overview
```
Frontend (Hostinger)  →  Backend (Vercel)  →  Database (Supabase/PostgreSQL)
```

---

## Phase 1: Database Setup (Supabase)

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to initialize
4. Go to **Settings** → **Database** → **Connection strings**
5. Copy the **URI** (PostgreSQL connection string)
6. Also copy:
   - `SUPABASE_URL` from Settings → API
   - `SUPABASE_ANON_KEY` from Settings → API
   - `SUPABASE_SERVICE_ROLE_KEY` from Settings → API

### 1.2 Run Database Migrations
```bash
# Create .env.production with your Supabase DATABASE_URL
export DATABASE_URL="postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres"

# Run migrations (if you have any)
npm run db:seed
npm run db:students
```

---

## Phase 2: Deploy Backend to Vercel

### 2.1 Prepare Environment Variables
1. Update `.env.production` with your Supabase credentials:
```
DATABASE_URL=postgresql://postgres:your_password@db.project-ref.supabase.co:5432/postgres
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SESSION_SECRET=generate-a-random-string-here
```

### 2.2 Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel deploy --prod

# OR if already authenticated
vercel --prod
```

### 2.3 Set Environment Variables in Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add all variables from `.env.production`:
   - `DATABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET`
   - `NODE_ENV=production`

### 2.4 Redeploy After Setting Variables
```bash
vercel --prod
```

### 2.5 Test Backend
```
https://your-project.vercel.app/api/health
```

---

## Phase 3: Deploy Frontend to Hostinger

### 3.1 Build Frontend
```bash
# Set your Vercel backend URL
export VITE_API_URL=https://your-project.vercel.app/api

# Build the frontend
npm run build

# This creates a 'dist' folder with production files
```

### 3.2 Upload to Hostinger
1. Go to **Hostinger** → **File Manager**
2. Connect via FTP/SFTP or Hostinger File Manager
3. Upload contents of `dist/` folder to your public HTML directory
4. Usually this is `public_html/` or similar

### 3.3 Configure Hostinger for React SPA
1. Create/Update `.htaccess` file in the root directory:

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

This ensures all routes go to index.html for React Router to handle.

### 3.4 Configure CORS (if needed)
If you get CORS errors, update your Vercel backend `server/app.js`:

```javascript
const allowedOrigins = [
  'https://your-domain.com',
  'https://www.your-domain.com',
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

---

## Phase 4: Testing & Verification

### 4.1 Test Backend
```bash
curl https://your-project.vercel.app/api/health
```

Expected response:
```json
{"status": "ok"}
```

### 4.2 Test Frontend Build Locally
```bash
npm run build
npm run preview
# Visit http://localhost:4173
```

### 4.3 Test Frontend on Hostinger
1. Visit `https://your-domain.com`
2. Open browser DevTools → Network tab
3. Check that API calls go to your Vercel backend
4. Should see requests like: `https://your-project.vercel.app/api/...`

---

## Phase 5: Custom Domain (Optional)

### 5.1 Vercel Custom Domain
1. Go to Vercel Dashboard → Your Project
2. Settings → Domains
3. Add your custom domain (e.g., `api.yourdomain.com`)
4. Update your frontend `.env.production.frontend`:
   ```
   VITE_API_URL=https://api.yourdomain.com/api
   ```

### 5.2 Hostinger Custom Domain
1. Go to Hostinger → Domains
2. Point your domain to Hostinger's nameservers
3. Configure the domain to point to your public_html folder

---

## Troubleshooting

### Frontend can't reach backend
- Check `VITE_API_URL` is set correctly during build
- Check browser DevTools Network tab for actual API URLs
- Verify CORS is enabled on Vercel backend
- Check firewall/security settings

### Database connection fails
- Verify `DATABASE_URL` is correct
- Check database credentials match Supabase project
- Ensure Vercel IP is whitelisted (Supabase → Settings → Network)
- Test connection locally first

### 404 errors on frontend routes
- Ensure `.htaccess` is uploaded to Hostinger
- Verify `RewriteEngine` is enabled on your hosting

### Environment variables not working
- Redeploy after setting variables in Vercel
- Use `vercel env` CLI to verify variables
- Check Vercel logs: `vercel logs <project-name>`

---

## Deployment Checklist

- [ ] Supabase project created and initialized
- [ ] Database migrations run successfully
- [ ] `.env.production` filled with all required values
- [ ] Backend deployed to Vercel
- [ ] All environment variables set in Vercel dashboard
- [ ] Backend API health check working (`/api/health`)
- [ ] Frontend built with correct `VITE_API_URL`
- [ ] Frontend uploaded to Hostinger
- [ ] `.htaccess` configured for React Router
- [ ] Frontend routes working (no 404s)
- [ ] API calls from frontend reaching backend
- [ ] CORS working properly
- [ ] Database queries working in production

---

## Important Notes

1. **Secrets**: Never commit `.env.production` to git. Use Vercel's environment variables UI.
2. **DATABASE_URL**: Always use the full PostgreSQL connection string, not separate host/port variables.
3. **CORS**: Update allowed origins when you have a custom domain.
4. **Session Secret**: Use a strong random value, not something predictable.
5. **Database Backups**: Set up automated backups in Supabase Settings → Backups.
