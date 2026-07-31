# Quick Deployment Checklist - traitedu.traitsoftwares.com

**⏱️ Total Time: ~30 minutes**

---

## ✅ Step 1: Point Domain to Hostinger (5 min)

- [ ] Log in to traitsoftwares.com domain registrar
- [ ] Find DNS/Nameserver settings
- [ ] Add Hostinger nameservers:
  ```
  ns1.hostinger.com
  ns2.hostinger.com
  ns3.hostinger.com
  ns4.hostinger.com
  ```
- [ ] Save changes
- [ ] Wait 24 hours for DNS propagation
- [ ] Verify: `nslookup traitedu.traitsoftwares.com`

---

## ✅ Step 2: Setup Subdomain (2 min)

- [ ] Go to Hostinger Control Panel
- [ ] Click: Hosting → Domains
- [ ] Add Subdomain: `traitedu` for `traitsoftwares.com`
- [ ] Create new folder: `traitedu`
- [ ] Wait 5 minutes

---

## ✅ Step 3: Deploy Backend (5 min)

- [ ] Go to Hostinger Control Panel
- [ ] Click: Git Repositories
- [ ] Click: Add Git Repository
- [ ] Connect GitHub → Select `nextM365/TraitEdu`
- [ ] Branch: `main`
- [ ] Click: Deploy
- [ ] Wait 2-3 minutes for deployment to complete
- [ ] Check status: Should show "Active" or "Running"

---

## ✅ Step 4: Add Environment Variables (3 min)

In Hostinger, add these variables:

```
NODE_ENV = production
PORT = 4000
SUPABASE_URL = https://pserepeylqabzxrourbv.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZXJlcGV5bHFhYnp4cm91cmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0NzI3MzQsImV4cCI6MjEwMTA0ODczNH0.v1V4Cioa_9LgElHcacdeTeaGUoQK7Mq7IeCZPP59h1M
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZXJlcGV5bHFhYnp4cm91cmJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTQ3MjczNCwiZXhwIjoyMTAxMDQ4NzM0fQ.WSIxaagENPY50nCJgEZd2ic0V3IOnnLnm-xK2YiC5UU
SESSION_SECRET = (run: openssl rand -base64 32)
SEED_SUPERADMIN_PASSWORD = SecureAdmin@123
SEED_BRANCH_ADMIN_PASSWORD = SecureAdmin@123
SEED_STUDENT_PASSWORD = SecureStudent@123
SEED_TEACHER_PASSWORD = SecureTeacher@123
```

- [ ] Generate SESSION_SECRET: `openssl rand -base64 32`
- [ ] Add all variables one by one
- [ ] Save

---

## ✅ Step 5: Upload Frontend (5 min)

- [ ] Open `dist/` folder on your computer
- [ ] In Hostinger: Go to File Manager
- [ ] Navigate to: `public_html/traitedu/`
- [ ] Delete existing files (if any)
- [ ] Upload all files from `dist/` folder
- [ ] Verify: `index.html` is in `public_html/traitedu/`

---

## ✅ Step 6: Create .htaccess (1 min)

- [ ] In File Manager: `public_html/traitedu/`
- [ ] Create new file: `.htaccess`
- [ ] Paste:
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
- [ ] Save

---

## ✅ Step 7: Enable SSL (2 min)

- [ ] Go to Hostinger Control Panel
- [ ] Click: SSL Certificate
- [ ] Click: Manage SSL
- [ ] Enable: Free Let's Encrypt SSL
- [ ] Wait 5-10 minutes
- [ ] Verify: Green lock 🔒 appears

---

## ✅ Step 8: Test Deployment (5 min)

### Test Frontend:
```bash
# Open in browser:
https://traitedu.traitsoftwares.com
```
- [ ] Page loads
- [ ] No console errors (F12)
- [ ] Green lock 🔒 visible

### Test Backend:
```bash
curl https://traitedu.traitsoftwares.com/api/health
```
- [ ] Returns response

### Test Login:
- [ ] Username: `admin`
- [ ] Password: `SecureAdmin@123`
- [ ] Should login successfully

---

## 🎉 Deployment Complete!

### Your App is Live! 🚀

**URL:** https://traitedu.traitsoftwares.com

### Next Steps:
1. Share URL with users
2. Monitor Hostinger logs daily
3. Update via GitHub push
4. Check performance regularly

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Domain not found | Wait 24h, verify DNS pointing to Hostinger |
| Blank page | Create `.htaccess`, clear cache |
| API not connecting | Verify env variables, check logs |
| Can't login | Verify SEED_*_PASSWORD variables |
| No SSL lock | Wait 10 min, clear cache, check status |

---

## 📖 Full Guide

For detailed instructions, see: `DEPLOY_TRAITSOFTWARES.md`
