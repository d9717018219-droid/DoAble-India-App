# GitHub Auto-Deployment to Hostinger

## Overview

This guide sets up **automatic deployment** from GitHub to Hostinger Cloud. Every time you push code to `main` branch, it automatically:

1. Builds the app
2. Installs dependencies
3. Deploys to Hostinger
4. Starts the new version

## Prerequisites

- ✅ GitHub account (you have: d9717018219-droid)
- ✅ Hostinger Cloud account
- ✅ SSH access to Hostinger server
- ✅ Domain configured

---

## 📋 Setup Steps

### Step 1: Push Code to GitHub

```bash
cd /Users/deepak/Downloads/DoAble-India-App-main

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: DoAble India app with advanced filtering"

# Connect to GitHub (replace with your actual repo URL)
git remote add origin https://github.com/d9717018219-droid/DoAble-India-App.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 2: Set Up GitHub Secrets

GitHub Secrets store your Hostinger credentials securely (encrypted).

1. Go to your **GitHub Repository**
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets one by one:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `HOSTINGER_HOST` | Your server IP or domain | `123.45.67.89` or `app.yourdomain.com` |
| `HOSTINGER_USERNAME` | SSH username | `cp123456` |
| `HOSTINGER_PASSWORD` | SSH password | `your_ssh_password` |
| `HOSTINGER_APP_PATH` | Path to app on server | `/home/cp123456/public_html` |

### Step 3: Get Your Hostinger SSH Credentials

1. Log in to **Hostinger Dashboard**
2. Go to **Hosting** → **Manage**
3. Click **SSH/Shell** in the left menu
4. You'll see:
   - **Username**: `cp123456` (or similar)
   - **Password**: Your SSH password
   - **Host**: IP address or domain

Use these for the GitHub secrets above.

### Step 4: Set Up App on Hostinger (One-time)

First time only:

1. **Upload initial files** (via File Manager or SSH):
   ```bash
   scp -r dist/ package.json server.ts your_username@your_domain.com:~/public_html/
   ```

2. **SSH into server**:
   ```bash
   ssh your_username@your_domain.com
   cd public_html
   ```

3. **Initialize Git** on server:
   ```bash
   git init
   git remote add origin https://github.com/d9717018219-droid/DoAble-India-App.git
   git pull origin main
   npm install --production
   ```

4. **Create Node.js app** in Hostinger Application Manager:
   - Type: Node.js
   - Entry Point: `server.ts`
   - Port: 3000
   - Click Install

### Step 5: Test Auto-Deployment

Make a small change and push:

```bash
# Make a change (e.g., update README)
echo "# App deployed at: https://yourdomain.com" >> README.md

# Commit and push
git add README.md
git commit -m "Update README"
git push origin main
```

**Watch the magic** ✨:
1. Go to GitHub **Actions** tab
2. See the workflow running
3. Wait for ✅ completion
4. Your app updates automatically!

---

## 🔄 How It Works

```
You push code to GitHub
    ↓
GitHub Actions triggers workflow
    ↓
Builds app (npm run build)
    ↓
SSH into Hostinger
    ↓
Pulls latest code (git pull)
    ↓
Installs dependencies (npm install)
    ↓
Builds on server (npm run build)
    ↓
✅ Code is live!
```

---

## 🎯 Future Updates

After setup, just:

```bash
# Make changes locally
nano src/components/TutorFilterButton.tsx

# Commit
git add .
git commit -m "Improve filter button styling"

# Push to deploy
git push origin main

# ✅ Automatically deployed to Hostinger!
```

---

## 🔒 Security Best Practices

✅ **What's Secure**:
- Secrets are encrypted in GitHub
- Never stored in your code
- Only GitHub Actions can access them
- Each deployment is logged

✅ **Keep Secure**:
- Never share SSH credentials
- Never put passwords in code
- Use GitHub secrets for everything sensitive
- Rotate passwords periodically

---

## 🚨 Troubleshooting

### Deployment Failed

1. **Check GitHub Actions logs**:
   - Go to repo → **Actions** tab
   - Click the failed workflow
   - See error details

2. **Common issues**:
   - SSH credentials incorrect → Update secrets
   - Port conflict → Check Hostinger ports
   - Build failed → Check npm error message
   - Path incorrect → Verify `HOSTINGER_APP_PATH`

### Manual Deployment (if GitHub fails)

```bash
# SSH into Hostinger
ssh your_username@your_domain.com

# Navigate to app
cd public_html

# Manual update
git pull origin main
npm install
npm run build

# Restart in Application Manager
```

---

## 📝 Environment Variables

If you need environment variables on Hostinger:

1. Create `.env.production` locally:
```
PORT=3000
NODE_ENV=production
VITE_FIREBASE_API_KEY=your_key
```

2. **Don't commit** `.env` to GitHub (it's in .gitignore)

3. **Add to Hostinger** manually via SSH or File Manager

---

## 🔗 GitHub Actions Status Badge

Add to your README.md:

```markdown
![Deploy to Hostinger](https://github.com/d9717018219-droid/DoAble-India-App/actions/workflows/deploy.yml/badge.svg)
```

---

## 📚 Learning Resources

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **SSH Guide**: https://linux.com/training/tutorial/lsb-ssh
- **Hostinger SSH**: https://support.hostinger.com/en/articles/7269009

---

## ✨ Summary

**Benefits of GitHub Auto-Deploy**:
- ✅ No manual uploads needed
- ✅ Every push to main = instant deployment
- ✅ Version control for all code
- ✅ Easy to rollback if issues
- ✅ Secure credential storage
- ✅ Professional CI/CD pipeline

**Your workflow becomes**:
```
Edit code → Commit → Push → Auto-deployed! 🚀
```

---

**Questions?** Check the GitHub Actions logs for detailed error messages!
