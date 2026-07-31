# Deploy TraitEdu to traitedu.traitsoftwares.com

Complete step-by-step guide to deploy your TraitEdu application on Hostinger Premium Hosting.

---

## Prerequisites ✅

- [x] Hostinger Premium Hosting account
- [x] Domain: traitedu.traitsoftwares.com
- [x] Code pushed to GitHub: https://github.com/nextM365/TraitEdu
- [x] Supabase database configured
- [x] Frontend built (`dist/` folder ready)

---

## Step 1: Point Domain to Hostinger (5 minutes)

**Your domain registrar:** traitsoftwares.com

### 1.1 Get Hostinger Nameservers

1. **Log in to Hostinger:** https://www.hostinger.com/client
2. **Go to:** Your Hosting → Domain Settings
3. **Copy nameservers:**
   ```
   ns1.hostinger.com
   ns2.hostinger.com
   ns3.hostinger.com
   ns4.hostinger.com
   ```

### 1.2 Update Domain DNS

1. **Go to your domain registrar** (where you bought traitsoftwares.com)
2. **Find:** DNS Settings or Nameservers
3. **Replace** current nameservers with Hostinger's nameservers (above)
4. **Save changes**
5. **Wait:** 24 hours for DNS propagation (usually 1-2 hours)

**To verify DNS is updated:**
```bash
nslookup traitedu.traitsoftwares.com
# Should show Hostinger's IP
```

---

## Step 2: Setup Subdomain in Hostinger (2 minutes)

**Once DNS is updated:**

1. **Log in to Hostinger Control Panel**
2. **Go to:** Hosting → Domains
3. **Add Subdomain:**
   - Subdomain: `traitedu`
   - Main domain: `traitsoftwares.com`
   - Points to: Create new folder `traitedu`
4. **Click:** Add
5. **Wait:** 5 minutes for Hostinger to configure

✅ **Your subdomain is now set up!**

---

## Step 3: Deploy Backend (5 minutes)

**In Hostinger Control Panel:**

### 3.1 Connect GitHub Repository

1. **Click:** Your hosting account
2. **Click:** **"Git Repositories"** (left sidebar)
3. **Click:** **"Add Git Repository"**
4. **Click:** **"Connect GitHub Account"**
   - Authorize Hostinger to access GitHub
5. **Select Repository:**
   - Choose: **`nextM365/TraitEdu`**
   - Branch: **`main`**
6. **Click:** **"Deploy"**

✅ **Backend deployment started!** (2-3 minutes)

### 3.2 Verify Backend is Running

1. **Check Status:**
   - Go to **"Deployments"** tab
   - Should show **"Active"** or **"Running"**

2. **Test API:**
   ```bash
   curl https://traitedu.traitsoftwares.com/api/health
   ```
   Should return a response (may be an error, but server is running)

✅ **Backend is live!**

---

## Step 4: Add Environment Variables (3 minutes)

**Still in Hostinger Control Panel:**

1. **Click:** Your deployed app
2. **Click:** **"Environment"** or **"Variables"** tab
3. **Click:** **"Add Variable"** for each:

### Add These Variables:

```
NODE_ENV
Value: production

PORT
Value: 4000

SUPABASE_URL
Value: https://pserepeylqabzxrourbv.supabase.co

SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZXJlcGV5bHFhYnp4cm91cmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NzI3MzQsImV4cCI6MjEwMTA0ODczNH0.v1V4Cioa_9LgElHcacdeTeaGUoQK7Mq7IeCZPP59h1M

SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZXJlcGV5bHFhYnp4cm91cmJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQ3MjczNCwiZXhwIjoyMTAxMDQ4NzM0fQ.WSIxaagENPY50nCJgEZd2ic0V3IOnnLnm-xK2YiC5UU

SESSION_SECRET
Value: (Generate with: openssl rand -base64 32)

SEED_SUPERADMIN_PASSWORD
Value: SecureAdmin@123

SEED_BRANCH_ADMIN_PASSWORD
Value: SecureAdmin@123

SEED_STUDENT_PASSWORD
Value: SecureStudent@123

SEED_TEACHER_PASSWORD
Value: SecureTeacher@123
```

### Generate SESSION_SECRET:

Run in your terminal:
```bash
openssl rand -base64 32
```

Copy the output and paste as SESSION_SECRET value.

✅ **Environment variables set!**

---

## Step 5: Deploy Frontend (5 minutes)

### 5.1 Upload Frontend Files

**In Hostinger Control Panel:**

1. **Click:** **"File Manager"**
2. **Navigate to:** `public_html` → `traitedu` folder (or your subdomain folder)
3. **Delete** all existing files (if any)
4. **Upload dist/ folder:**
   - From your computer, open the `dist/` folder
   - Select all files inside it
   - Drag & drop to the folder in Hostinger
   - Or click upload button and select files

**Important:** Upload contents of `dist/`, not the folder itself!

Structure should be:
```
public_html/traitedu/
├── index.html
├── assets/
│   ├── index-CqZNlAAn.css
│   └── index-vr4AHJY1.js
```

✅ **Frontend files uploaded!**

### 5.2 Create .htaccess for Routing

**In Hostinger File Manager:**

1. **Right-click** in `public_html/traitedu` folder
2. **Create** new file → Name: `.htaccess`
3. **Paste this content:**

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

4. **Save**

✅ **React Router configured!**

---

## Step 6: Enable SSL Certificate (2 minutes)

**HTTPS is required for security:**

1. **Go to:** Hostinger Control Panel
2. **Click:** Your domain
3. **Click:** **"SSL Certificate"**
4. **Click:** **"Manage SSL"**
5. **Select:** **"Free Let's Encrypt SSL"**
6. **Click:** **"Enable"**
7. **Wait:** 5-10 minutes

**Verify SSL:**
```bash
# After SSL is enabled, visit:
https://traitedu.traitsoftwares.com

# Should show green lock 🔒
```

✅ **HTTPS enabled!**

---

## Step 7: Test Your Deployment (5 minutes)

### 7.1 Frontend Test

**Open browser:**
```
https://traitedu.traitsoftwares.com
```

You should see:
- ✅ TraitEdu login page loads
- ✅ No console errors (F12 to check)
- ✅ Green lock icon 🔒
- ✅ URL shows: `https://traitedu.traitsoftwares.com`

### 7.2 Backend Test

```bash
curl https://traitedu.traitsoftwares.com/api/health
```

Should return a response (JSON or error message - confirms server is running)

### 7.3 Login Test

1. **Open:** https://traitedu.traitsoftwares.com
2. **Try to login:**
   - Username: `admin`
   - Password: `SecureAdmin@123` (your SEED_SUPERADMIN_PASSWORD)
3. **Should login successfully** ✓

---

## 📋 Complete Deployment Checklist

```
Domain Setup
☐ DNS pointed to Hostinger nameservers
☐ Subdomain created in Hostinger
☐ DNS updated and propagated (wait 24h)

Backend Deployment
☐ GitHub repository connected
☐ App deployed via Git
☐ Status shows "Active" or "Running"
☐ Backend API responds to curl

Environment Configuration
☐ NODE_ENV = production
☐ SUPABASE_URL configured
☐ SUPABASE_ANON_KEY added
☐ SUPABASE_SERVICE_ROLE_KEY added
☐ SESSION_SECRET generated and added
☐ SEED_*_PASSWORD variables set

Frontend Deployment
☐ dist/ folder contents uploaded to public_html
☐ .htaccess created in public_html
☐ All files uploaded successfully

SSL & Security
☐ Let's Encrypt SSL enabled
☐ HTTPS working (green lock 🔒)
☐ HTTP redirects to HTTPS

Testing
☐ Frontend loads at https://traitedu.traitsoftwares.com
☐ API responds to curl
☐ Login works with seed credentials
☐ Console has no errors
```

---

## 🔗 Important URLs

| Service | URL |
|---------|-----|
| **App** | https://traitedu.traitsoftwares.com |
| **API** | https://traitedu.traitsoftwares.com/api |
| **Hostinger Control Panel** | https://www.hostinger.com/client |
| **Supabase Database** | https://pserepeylqabzxrourbv.supabase.co |
| **GitHub Repository** | https://github.com/nextM365/TraitEdu |

---

## 🐛 Troubleshooting

### Issue: "Domain not found" or "Can't reach server"

**Solution:**
1. Check DNS propagation: `nslookup traitedu.traitsoftwares.com`
2. Wait 24 hours for DNS to fully propagate
3. Verify nameservers are set to Hostinger's in your domain registrar

### Issue: Frontend shows blank page

**Solution:**
1. Check browser console (F12)
2. Verify `.htaccess` is in correct folder
3. Clear browser cache (Ctrl+Shift+Delete)
4. Reload page

### Issue: "API connection failed" or 404 errors

**Solution:**
1. Verify backend is running: `curl https://traitedu.traitsoftwares.com/api/health`
2. Check environment variables are set correctly
3. Verify Supabase credentials (SUPABASE_SERVICE_ROLE_KEY)
4. Check Hostinger deployment logs

### Issue: "Can't login" or authentication error

**Solution:**
1. Verify SEED_SUPERADMIN_PASSWORD is set
2. Try username: `admin` with correct password
3. Check Supabase is accessible
4. Check session storage in browser (F12 → Application tab)

### Issue: SSL certificate not showing (no green lock 🔒)

**Solution:**
1. Wait 10-15 minutes after enabling SSL
2. Clear browser cache
3. Try: `https://www.ssl-shopper.com/ssl-checker/`
4. Verify certificate is issued in Hostinger

### Issue: Auto-deployment not working

**Solution:**
1. Verify GitHub connection is authorized
2. Re-connect GitHub in "Git Repositories"
3. Push code to GitHub again: `git push origin main`
4. Check deployment status in Hostinger

---

## 📊 Monitoring After Deployment

### Daily Checks:

**1. Check Backend Status:**
```bash
# In terminal, run daily
curl https://traitedu.traitsoftwares.com/api/health
```

**2. View Logs:**
- Hostinger Control Panel → Deployments → View Logs
- Check for error messages

**3. Monitor Performance:**
- Hostinger → Overview → Resource usage
- Supabase Dashboard → Query performance

### Setup Error Alerts (Optional):

1. **Hostinger:** Control Panel → Notifications
   - Enable email alerts for deployment failures

2. **Supabase:** Dashboard → Database → Logs
   - Monitor for connection errors

---

## 🔄 Updating Your App

### Push New Changes to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update: description of changes"
git push origin main
```

### Hostinger Auto-Deploys:

- Backend automatically redeploys when you push to GitHub
- Frontend: Re-upload `dist/` folder (manual or via script)

---

## 🚀 Post-Deployment Checklist

- [x] Domain configured
- [x] Backend deployed
- [x] Frontend uploaded
- [x] SSL enabled
- [x] App tested and working
- [ ] Share URL with users: https://traitedu.traitsoftwares.com
- [ ] Monitor logs daily
- [ ] Plan regular backups
- [ ] Schedule security updates

---

## 📞 Support

**Need help?**

1. **Hostinger Issues:** https://support.hostinger.com
2. **Supabase Issues:** https://supabase.com/docs
3. **GitHub Issues:** Check repository issues
4. **App Issues:** Check browser console (F12)

**Quick Diagnosis:**
- Test backend: `curl https://traitedu.traitsoftwares.com/api/health`
- Test frontend: Open in browser and check console
- Check Hostinger logs: Deployments tab
- Check Supabase: Dashboard → Logs

---

## ✨ Congratulations!

Your TraitEdu application is now live at:

# 🎉 https://traitedu.traitsoftwares.com

**You can now:**
- Share the URL with users
- Monitor performance
- Make updates via GitHub push
- Scale as needed

**Time to celebrate!** 🚀
