# Hostinger Cloud Deployment Checklist

## Quick Start ✅

### Pre-Deployment (5 minutes)
- [ ] Have Hostinger Cloud account ready
- [ ] Know your domain name
- [ ] Have SSH access credentials (username, password/key)
- [ ] Node.js 18+ is available on server

### Upload Files (10 minutes)
Choose ONE option:

**Option A - File Manager (Easiest for beginners)**
- [ ] Log into Hostinger Dashboard
- [ ] Go to File Manager
- [ ] Upload `deployment-package/dist/` folder
- [ ] Upload `deployment-package/package.json`
- [ ] Upload `deployment-package/server.ts`

**Option B - SSH Upload (Recommended)**
```bash
scp -r deployment-package/* your_username@your_domain.com:~/public_html/
```

**Option C - Git Clone (Best for updates)**
```bash
cd your_app_folder
git clone https://github.com/d9717018219-droid/DoAble-India-App.git
cd DoAble-India-App
npm install --production
npm run build
```

### Server Setup (5 minutes)
- [ ] SSH into Hostinger server
- [ ] Navigate to app directory
- [ ] Run: `npm install --production`
- [ ] Verify Node.js version: `node --version`

### Application Manager Configuration (5 minutes)
- [ ] Open Hostinger Dashboard
- [ ] Go to **Advanced** → **Application Manager**
- [ ] Click **Create Application**
- [ ] Set **App Type**: Node.js
- [ ] Set **Entry Point**: `server.ts`
- [ ] Set **Node Version**: 18.x
- [ ] Click **Install**
- [ ] Wait for green "Running" status

### Domain Configuration (Automatic, 5-30 minutes)
- [ ] Domain is already pointed to your server
- [ ] DNS records are configured
- [ ] SSL certificate is installed (or installing)
- [ ] HTTPS is enabled

### Testing (5 minutes)
```bash
# Test health endpoint
curl https://yourdomain.com/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-04-29T..."}

# Test tutors API
curl https://yourdomain.com/api/tutors

# Should return tutor data
```

### Post-Deployment
- [ ] App loads at https://yourdomain.com
- [ ] Tutors tab shows filter button
- [ ] Filter button opens modal with all filters
- [ ] Filters apply correctly to tutor list
- [ ] API endpoints respond with data

---

## Important Information

### Your Deployment Files
All files are in `/Users/deepak/Downloads/DoAble-India-App-main/deployment-package/`

```
deployment-package/
├── dist/                         # Built React app
├── package.json                  # Dependencies
├── server.ts                     # Express server
└── HOSTINGER_DEPLOYMENT.md       # Full guide
```

### What Each File Does

| File | Purpose |
|------|---------|
| `dist/` | Your compiled React app (static files) |
| `server.ts` | Node.js server that serves the app and APIs |
| `package.json` | Lists all dependencies needed |

### Server Responsibilities

The Node.js server (`server.ts`) will:
1. ✅ Serve your React app (loads at /)
2. ✅ Provide API endpoints (/api/tutors, /api/leads, /api/health)
3. ✅ Fetch data from external APIs (doableindia.com)
4. ✅ Return JSON responses

### Troubleshooting Guide

**Problem**: "App not found" error
- Solution: Check that `dist/` folder is uploaded correctly

**Problem**: "Cannot find module" error
- Solution: Run `npm install --production` on server

**Problem**: "Port 3000 already in use"
- Solution: Hostinger will auto-assign a different port - no action needed

**Problem**: "API endpoints return 404"
- Solution: Verify `server.ts` is in root directory, restart app

**Problem**: "HTTPS not working"
- Solution: Wait for SSL certificate (usually instant), refresh browser

---

## Support Resources

- **Hostinger Help Center**: https://support.hostinger.com/
- **Node.js Support**: https://nodejs.org/support/
- **Your Domain Support**: Contact your domain registrar

---

## Next Steps

1. ✅ **Prepare** - You're ready! All files are built and packaged
2. 🔄 **Upload** - Use File Manager or SSH to upload files
3. ⚙️ **Configure** - Set up Node.js app in Application Manager
4. 🧪 **Test** - Verify app is working with curl commands
5. 🎉 **Deploy** - Your app is now live!

---

**Total Time to Deploy**: ~30-45 minutes (mostly waiting for DNS/SSL)

**Questions?** Check `HOSTINGER_DEPLOYMENT.md` for detailed instructions
