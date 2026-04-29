# 🚀 Setup GitHub Auto-Deploy in 5 Minutes

Everything is ready! Follow these 5 simple steps to enable automatic deployment.

---

## **Step 1: Connect to GitHub** (1 minute)

Run these commands in your terminal:

```bash
cd /Users/deepak/Downloads/DoAble-India-App-main

# Connect to your existing GitHub repo
git remote add origin https://github.com/d9717018219-droid/DoAble-India-App.git

# Push code to GitHub
git push -u origin main
```

✅ Your code is now on GitHub with auto-deploy workflow ready!

---

## **Step 2: Add GitHub Secrets** (2 minutes)

Your Hostinger credentials need to be stored securely in GitHub.

1. **Go to GitHub**: https://github.com/d9717018219-droid/DoAble-India-App
2. Click **Settings** (top right)
3. Click **Secrets and variables** → **Actions** (left menu)
4. Click **New repository secret**

### Add These 4 Secrets:

**Secret 1: HOSTINGER_HOST**
- Name: `HOSTINGER_HOST`
- Value: Your server IP (from Hostinger → SSH settings)
- Example: `123.45.67.89` or `app.yourdomain.com`
- Click **Add secret**

**Secret 2: HOSTINGER_USERNAME**
- Name: `HOSTINGER_USERNAME`
- Value: Your SSH username (from Hostinger → SSH settings)
- Example: `cp123456`
- Click **Add secret**

**Secret 3: HOSTINGER_PASSWORD**
- Name: `HOSTINGER_PASSWORD`
- Value: Your SSH password
- Example: `YourPassword123`
- Click **Add secret**

**Secret 4: HOSTINGER_APP_PATH**
- Name: `HOSTINGER_APP_PATH`
- Value: Path to your app folder on Hostinger
- Example: `/home/cp123456/public_html` or `/home/cp123456/apps/doable`
- Click **Add secret**

✅ Secrets are now encrypted and secure!

---

## **Step 3: Set Up App on Hostinger** (2 minutes)

### First Time Setup Only

**Via SSH** (Recommended):
```bash
# Connect to Hostinger
ssh cp123456@yourdomain.com  # (use your credentials)

# Navigate to your app folder
cd /home/cp123456/public_html  # (or your path)

# Initialize Git
git init
git remote add origin https://github.com/d9717018219-droid/DoAble-India-App.git
git pull origin main

# Install dependencies
npm install --production

# Build app
npm run build
```

**Or Via File Manager**:
1. Hostinger File Manager → Upload `dist/`, `package.json`, `server.ts`
2. SSH in and run:
   ```bash
   git init
   git remote add origin https://github.com/d9717018219-droid/DoAble-India-App.git
   npm install --production
   ```

---

## **Step 4: Create Node.js App in Hostinger** (1 minute)

1. Log in to **Hostinger Dashboard**
2. Go to **Advanced** → **Application Manager**
3. Click **Create Application**
4. Set these values:
   - **App Type**: Node.js
   - **Node Version**: 18.x
   - **Entry Point**: `server.ts`
   - **Root Directory**: Your app path
   - **Port**: 3000 (or auto-assign)
5. Click **Install**
6. Wait for green "Running" status ✅

---

## **Step 5: Test Auto-Deployment** (Optional but recommended)

Make a test change and watch it deploy automatically:

```bash
# Make a change locally
echo "# Updated: $(date)" >> README.md

# Commit and push
git add README.md
git commit -m "Test auto-deployment"
git push origin main
```

**Watch the deployment**:
1. Go to GitHub → **Actions** tab
2. See the workflow running in real-time
3. Watch it build, test, and deploy
4. ✅ See success status

---

## ✨ Now Every Push Automatically Deploys!

```
Make changes locally
    ↓
git commit -m "Your message"
    ↓
git push origin main
    ↓
GitHub Actions triggers automatically
    ↓
Builds app on GitHub
    ↓
Deploys to Hostinger
    ↓
✅ Live in 2-3 minutes!
```

---

## 📊 Monitoring Deployments

After setup, you can monitor deployments anytime:

1. **GitHub Actions Tab**: https://github.com/d9717018219-droid/DoAble-India-App/actions
2. **See all deployments** with status (Success/Failed)
3. **Click any deployment** to see full logs
4. **Know exactly what changed** with commit messages

---

## 🔄 Example: Make Updates

### Adding a new feature:

```bash
# Pull latest code
git pull origin main

# Make changes
nano src/components/TutorFilterButton.tsx

# Test locally (optional)
npm run dev

# Commit with descriptive message
git add .
git commit -m "Improve filter button styling with hover effects"

# Push to deploy
git push origin main

# ✅ Automatically deployed to Hostinger!
# Check GitHub Actions tab to see progress
```

---

## 🚨 Troubleshooting

**Deployment Failed?**
1. Go to GitHub → **Actions** tab
2. Click the failed workflow
3. See detailed error message
4. Fix the issue and push again

**Common Issues**:
- ❌ `SSH authentication failed` → Check GitHub secrets are correct
- ❌ `npm install failed` → Check package.json is valid
- ❌ `Build failed` → Check code for TypeScript errors
- ❌ `Cannot connect to Hostinger` → Check IP/domain in secret

---

## ✅ Checklist

- [ ] Pushed code to GitHub
- [ ] Added 4 GitHub secrets
- [ ] Set up Node.js app in Hostinger
- [ ] App shows green "Running" status
- [ ] Tested with a commit (optional)
- [ ] Can see deployments in GitHub Actions

---

## 🎉 You're Done!

Your app now has **professional CI/CD pipeline**:
- ✅ Version control on GitHub
- ✅ Automatic builds
- ✅ Secure credential storage
- ✅ One-click deployments (just push code!)
- ✅ Easy to monitor and rollback
- ✅ Production-ready setup

**From now on**:
```bash
git add .
git commit -m "Your message"
git push origin main
# ✅ Done! App updates automatically
```

---

**Need help?** Check `GITHUB_AUTO_DEPLOY.md` for detailed guide.
