# Hostinger Cloud Deployment Guide

## Prerequisites
- Hostinger Cloud Hosting account
- Domain name configured
- SSH access to your Hostinger server
- Node.js 18+ installed on your Hostinger server

## Deployment Steps

### Step 1: Prepare Deployment Files

All necessary files are ready:
- **Built app**: `dist/` folder
- **Server**: `server.ts` 
- **Dependencies**: `package.json`

### Step 2: Upload to Hostinger

#### Option A: Using Hostinger's File Manager (Easiest)
1. Log in to your Hostinger account
2. Go to **Hosting Dashboard** → **File Manager**
3. Navigate to your public root or application folder
4. Upload these files/folders:
   - `package.json`
   - `server.ts`
   - `dist/` (entire folder)
   - `.env` (if you have one)

#### Option B: Using SSH (Recommended for Production)
```bash
# Connect to your Hostinger server
ssh your_username@your_domain.com

# Navigate to your app directory
cd public_html  # or your app folder

# Upload files (from your local machine, run this instead):
scp -r /Users/deepak/Downloads/DoAble-India-App-main/dist your_username@your_domain.com:~/
scp /Users/deepak/Downloads/DoAble-India-App-main/package.json your_username@your_domain.com:~/
scp /Users/deepak/Downloads/DoAble-India-App-main/server.ts your_username@your_domain.com:~/
```

#### Option C: Using Git (Best for Updates)
```bash
# SSH into Hostinger
ssh your_username@your_domain.com

# Clone the repository
git clone https://github.com/d9717018219-droid/DoAble-India-App.git
cd DoAble-India-App

# Install dependencies
npm install

# Build the app
npm run build
```

### Step 3: Install Dependencies on Hostinger

```bash
# SSH into your Hostinger server
ssh your_username@your_domain.com
cd your_app_directory

# Install npm packages
npm install --production
```

### Step 4: Configure Node.js Application

#### Using Hostinger's Application Manager (Easiest)
1. Go to **Hosting Dashboard** → **Advanced** → **Application Manager**
2. Click **Create Application**
3. Set these values:
   - **App Name**: DoAble India
   - **App Type**: Node.js
   - **Node Version**: 18.x or higher
   - **Root Directory**: Public root or your app folder
   - **Entry Point**: `server.ts`
   - **Port**: 3000 or auto-assigned

4. Click **Install**

#### Manual Configuration (if needed)
Create a `.env` file in your root directory:
```
PORT=3000
NODE_ENV=production
# Add your Firebase credentials if needed
```

### Step 5: Configure Your Domain

1. Go to **Domain Management**
2. Point your domain to your Hostinger server's IP address
3. Update DNS records if needed (usually automatic with Hostinger)
4. Wait for DNS propagation (5-30 minutes)

### Step 6: Set Up HTTPS/SSL Certificate

1. In Hostinger Dashboard, go to **SSL**
2. Install a free Let's Encrypt certificate
3. Enable auto-renewal

### Step 7: Test Your Application

```bash
# Check if app is running
curl https://yourdomain.com/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-04-29T..."}
```

### Step 8: Monitor and Restart

#### Check Logs
In Hostinger's **Application Manager**, click your app to view:
- Application logs
- Error messages
- CPU/Memory usage

#### Restart Application
If needed, go to **Application Manager** → Click your app → **Restart**

## Troubleshooting

### App not loading
1. Check application logs in Hostinger
2. Verify `dist/` folder is uploaded
3. Restart the application
4. Check domain DNS settings

### API endpoints returning 404
1. Verify `server.ts` is in root directory
2. Check that external APIs (doableindia.com) are accessible
3. Restart application

### Port conflicts
1. Use Hostinger's automatic port assignment
2. Don't use port 80 or 443 (reserved for HTTP/HTTPS)

### Firebase issues
1. Verify Firebase config in your code
2. Check Firebase project security rules allow your domain
3. Add your domain to Firebase project settings

## Environment Variables (if needed)

Create `.env` file:
```
PORT=3000
NODE_ENV=production
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project
# Add other variables as needed
```

## Updating the App

### Quick Update (for small changes)
```bash
# SSH into server
cd your_app_directory

# Update code
npm run build

# Restart app in Hostinger Application Manager
```

### Full Update (after major changes)
```bash
# SSH into server
cd your_app_directory

# Pull latest code
git pull origin main

# Reinstall dependencies
npm install

# Build
npm run build

# Restart
# Use Hostinger Application Manager
```

## Performance Optimization

1. **Enable Gzip Compression** in Hostinger → Performance
2. **Use CDN** for static assets (optional)
3. **Set Cache Headers** - Already configured in Express server
4. **Monitor Resources** in Application Manager

## Support

- **Hostinger Support**: https://www.hostinger.com/support
- **Node.js Docs**: https://nodejs.org/docs/
- **Express.js Docs**: https://expressjs.com/

---

**Your App is now live on the cloud! 🚀**
