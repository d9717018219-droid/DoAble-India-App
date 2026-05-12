# Deploy Backend to Railway.app (Simple, No CLI Needed!)

## Step 1: Go to Railway.app
Visit: https://railway.app

## Step 2: Sign Up / Login
- Click "Login with GitHub"
- Or create account with email

## Step 3: Create New Project
- Click "Create New Project"
- Select "Deploy from GitHub repo"
- Click "Configure GitHub App" 
- Allow access to your repo

## Step 4: Select Your Repository
- Find: `DoAble-India-App`
- Click to select

## Step 5: Configure Variables
- Railway will auto-detect Node.js
- Add environment variable:
  - Key: `PORT`
  - Value: `8080`

## Step 6: Deploy
- Click "Deploy"
- Wait for build to complete (2-3 minutes)
- Copy the URL shown (like `https://doable-prod.up.railway.app`)

## Step 7: Update App
Edit `src/App.tsx` line 258:

Change:
```typescript
const [leadsRes, tutorsRes] = await Promise.all([fetch('/api/leads'), fetch('/api/tutors')]);
```

To (use YOUR Railway URL):
```typescript
const API_BASE = 'https://doable-prod.up.railway.app';
const [leadsRes, tutorsRes] = await Promise.all([
  fetch(`${API_BASE}/api/leads`), 
  fetch(`${API_BASE}/api/tutors`)
]);
```

## Step 8: Rebuild & Upload
```bash
npm run build
cd android && ./gradlew bundleRelease
# Upload to Google Play
```

Done! ✅
