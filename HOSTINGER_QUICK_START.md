# Hostinger Quick Start (Choose Your Path)

## Step 0: Prepare Your Code

```bash
# Build frontend
npm run build

# Create production environment file
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

Add to `.env.production`:
```
NODE_ENV=production
PORT=4000
SUPABASE_URL=https://pserepeylqabzxrourbv.supabase.co
SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_ROLE_KEY=your_key_here
SESSION_SECRET=your-generated-secret
```

Push to GitHub:
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

---

## Which Hostinger Plan Do You Have?

### ✅ Path A: If You Have Shared/Premium Hosting with Node.js Support

**Time: 10 minutes**

**Steps:**

1. **Hostinger Control Panel** → **"Git Repositories"**
2. Click **"Add Git Repository"**
3. Connect GitHub → Select **Trait-Edu** repo
4. Click **"Deploy"**
5. Add Environment Variables:
   ```
   NODE_ENV=production
   SUPABASE_URL=https://pserepeylqabzxrourbv.supabase.co
   SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   SESSION_SECRET=...
   ```
6. Wait for deployment (2-3 minutes)
7. Upload `dist/` folder to `public_html` via File Manager
8. Create `.htaccess` in `public_html`:
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
9. Enable SSL (Hostinger Control Panel → SSL)
10. Done! Visit `https://your-domain.com`

---

### ✅ Path B: If You Have VPS Hosting (Full Control)

**Time: 20 minutes**

**Steps:**

1. **SSH into Hostinger:**
   ```bash
   ssh username@your-ip-address
   # Enter password
   ```

2. **Install dependencies:**
   ```bash
   node --version  # Check if Node installed
   
   # If not installed, ask Hostinger to enable Node.js
   # Or install NVM:
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   ```

3. **Clone and setup:**
   ```bash
   cd /home/username
   git clone https://github.com/your-username/Trait-Edu.git
   cd Trait-Edu
   npm install
   npm run build
   ```

4. **Create environment file:**
   ```bash
   nano .env.production
   ```
   
   Paste:
   ```
   NODE_ENV=production
   PORT=4000
   SUPABASE_URL=https://pserepeylqabzxrourbv.supabase.co
   SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_key
   SESSION_SECRET=your_secret
   ```
   
   Save: `Ctrl+O` → `Enter` → `Ctrl+X`

5. **Install PM2:**
   ```bash
   npm install -g pm2
   pm2 start "npm run server" --name "traitedu-api"
   pm2 startup
   pm2 save
   ```

6. **Setup Nginx:**
   ```bash
   sudo nano /etc/nginx/sites-available/default
   ```
   
   Replace with (replace your-domain.com):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       
       location /api {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       location / {
           root /home/username/Trait-Edu/dist;
           try_files $uri $uri/ /index.html;
       }
   }
   ```
   
   Save and restart:
   ```bash
   sudo systemctl restart nginx
   ```

7. **Enable SSL:**
   ```bash
   sudo apt-get install certbot
   sudo certbot certonly --standalone -d your-domain.com
   ```

8. **Update Nginx for HTTPS:**
   ```bash
   sudo nano /etc/nginx/sites-available/default
   ```
   
   Add:
   ```nginx
   server {
       listen 443 ssl http2;
       server_name your-domain.com www.your-domain.com;
       
       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
       
       # ... rest of config
   }
   ```

9. **Redirect HTTP to HTTPS:**
   ```bash
   # Add before the HTTPS block:
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       return 301 https://$server_name$request_uri;
   }
   ```

10. **Restart Nginx:**
    ```bash
    sudo systemctl restart nginx
    ```

11. **Done!** Visit `https://your-domain.com`

---

### ❓ Not Sure Which Plan You Have?

**Check in Hostinger Control Panel:**

1. Log in to https://www.hostinger.com/client
2. Look for:
   - **"Hosting"** → You have Shared/Premium Hosting → Use **Path A**
   - **"VPS"** → You have VPS Hosting → Use **Path B**
   - **"Cloud Hosting"** → Use **Path B**

---

## Common Issues & Fixes

### Issue: "Cannot find module 'pg'"

**Fix:**
```bash
npm install
npm run build
```

### Issue: "Port 4000 already in use"

**Fix:**
```bash
sudo lsof -i :4000
sudo kill -9 <PID>
pm2 restart traitedu-api
```

### Issue: "Supabase connection failed"

**Fix:**
1. Check environment variables are set
2. Verify SUPABASE_SERVICE_ROLE_KEY is correct (not anon key)
3. Check Supabase project is active
4. Verify IP whitelist in Supabase dashboard

### Issue: "Frontend can't reach API"

**Fix:**
1. Verify backend is running:
   ```bash
   curl https://your-domain.com/api/health
   ```
2. Check API URL in frontend code
3. Verify CORS is enabled in `server/server.js`

### Issue: "SSL certificate not working"

**Fix:**
1. Wait 24 hours for DNS propagation
2. Clear browser cache
3. Try: `https://www.ssl-shopper.com/ssl-checker/` to verify

---

## Testing

### Test Backend

```bash
curl https://your-domain.com/api/health
```

Should return a response (might be an error, but server is running).

### Test Frontend

1. Open `https://your-domain.com` in browser
2. Check console for errors (F12)
3. Try to login

### Test Credentials

Use seed data from `.env.production`:
- Username: Try `admin`, `teacher`, `student`
- Password: Check your SEED_*_PASSWORD values

---

## Auto-Updates (Optional)

### If Using Git Deployment:

Every time you push to GitHub, Hostinger automatically redeploys:

```bash
git add .
git commit -m "Update app"
git push origin main
# Hostinger auto-deploys!
```

### If Using Manual SSH:

To update manually:

```bash
ssh username@your-host.com
cd Trait-Edu
git pull origin main
npm install
npm run build
pm2 restart traitedu-api
```

---

## Monitoring

### Check if App is Running

**Hostinger Control Panel:**
- Go to Deployments tab
- Should show "Active" or "Running"

**Via SSH:**
```bash
ssh username@your-host.com
pm2 status
pm2 logs traitedu-api
```

### Check Logs for Errors

**Hostinger Control Panel:**
- Logs → Error Logs
- Look for any HTTP 500 errors

**Via SSH:**
```bash
tail -f /var/log/nginx/error.log
pm2 logs traitedu-api
```

---

## Performance Optimization

After deployment, optimize:

### 1. Enable Compression

Add to Nginx config:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### 2. Enable Caching

```nginx
location ~* \.(js|css|png|jpg)$ {
    expires 30d;
}
```

### 3. Monitor Database

In Supabase Dashboard:
- Check query performance
- Add indexes if needed

---

## Support

**Need Help?**

1. **See detailed guide:** `DEPLOY_HOSTINGER.md`
2. **Hostinger support:** https://support.hostinger.com
3. **Check logs** for specific error messages
4. **Test Supabase connection** manually

---

## Summary

### Shared/Premium Hosting (Path A):
- ✅ Easy: 10 minutes
- ✅ Auto-deployment
- ✅ No SSH needed
- ❌ Limited customization

### VPS Hosting (Path B):
- ✅ Full control
- ✅ Better performance
- ✅ Customizable
- ❌ More setup: 20 minutes

**Recommended:** VPS if you want better control and performance!

---

## Next Steps

1. **Identify** your Hostinger plan
2. **Follow** Path A or B above
3. **Test** your app at `https://your-domain.com`
4. **Monitor** logs and performance
5. **Celebrate** 🎉

Questions? Check `DEPLOY_HOSTINGER.md` for detailed instructions!
