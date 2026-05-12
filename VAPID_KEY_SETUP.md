# 🔑 VAPID Key Setup - Firebase Push Notifications

Firebase push notifications ke liye VAPID key zaroori hai. Ye guide step-by-step batata hai kaise set karna hai.

---

## 🎯 What is VAPID Key?

VAPID = Voluntary Application Server Identification

Ye ek pair of keys hai:
- **Public Key** - Browser ko dete ho (vapidKey in code)
- **Private Key** - Backend server ko dete ho (Server setup ke liye)

---

## 📝 Step-by-Step Setup

### Step 1: Firebase Console Kholo

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Sign in with your Google account
3. Select your project: **gen-lang-client-0533512936**

### Step 2: Cloud Messaging Settings

1. Click on **Project Settings** (gear icon)
2. Go to **Cloud Messaging** tab
3. Scroll to **Web push certificates** section

### Step 3: Generate Key Pair

1. Under "Web push certificates", click **Generate Key Pair**
2. A dialog will appear with:
   - **Key pair** (this is your public key - COPY karo!)
3. Click **Save** button at bottom

### Step 4: Copy Public Key

1. Find the "Web push certificates" section again
2. Look for the certificate entry you just created
3. **Right-click** on the long key value → **Copy**
4. Ye ho gaya aapka VAPID key!

---

## 💻 Add to Code

### File: `src/firebase.ts`

Find this line (around line 44):

```typescript
const token = await getToken(messaging, {
  vapidKey: 'YOUR_VAPID_KEY_HERE'
});
```

Replace `'YOUR_VAPID_KEY_HERE'` with your actual key:

```typescript
const token = await getToken(messaging, {
  vapidKey: 'BGo8mPHAd2Y6H6n_w8jkzhEYJ2bNr-KvSGYIVxr9OLpCDfWqRHgRqS0hpExPLGGQ5wfvWwDWfTjnz-kQyCRlD5Y'
});
```

**Example (aapka key different hoga):**
```
BGo8mPHAd2Y6H6n_w8jkzhEYJ2bNr-KvSGYIVxr9OLpCDfWqRHgRqS0hpExPLGGQ5wfvWwDWfTjnz-kQyCRlD5Y
```

---

## ✅ Verification

### 1. Browser Console Check

App kholo, browser console mein dekho:

```
✅ Firebase Cloud Messaging initialized
✅ FCM Token obtained: APA91b...
✅ Message handler setup complete
```

Agar error aaye toh VAPID key galat hai.

### 2. Token Generation

```javascript
// Browser console mein
localStorage.getItem('fcmToken')

// Output: APA91bGd...some_long_token...
```

Token dikhna chahiye. Nahi dikha = VAPID key problem.

### 3. Test Notification

Firebase Console se:
1. **Cloud Messaging** → **Send your first message**
2. Title: "Test"
3. Body: "Testing VAPID setup"
4. Click **Send test message**
5. Select current browser/device
6. **Notification milna chahiye!**

---

## 🔒 Security Notes

⚠️ **Important:**

```
✅ Public VAPID key: Browser mein share kar sakte ho (code mein likha hai)
❌ Private VAPID key: KABHI backend mein COPY mat karo (Firebase backend ko manage karta hai)
```

---

## 🐛 Troubleshooting

### Issue: "QuotaExceededError"
```
Error: QuotaExceededError: localStorage quota exceeded
Solution: Clear browser cache/localStorage
  localStorage.clear()
  location.reload()
```

### Issue: "NotAllowedError"
```
Error: NotAllowedError: User denied notification permission
Solution: 
  1. Check browser notification settings
  2. Allow notifications for your site
  3. Reload page
```

### Issue: "Invalid VAPID key"
```
Error: Invalid VAPID key format
Solution:
  1. Verify key length (should be ~100+ characters)
  2. No spaces at beginning/end
  3. Copy directly from Firebase Console (no formatting)
```

### Issue: Token is null
```
Problem: FCM Token nahi ban rahe
Solution:
  1. Notification permission check karo
  2. VAPID key correct hai ki nahi verify karo
  3. Browser DevTools → Application → Storage → Check localStorage
  4. Try in incognito window
```

---

## 📱 Android Notifications

Android par ye step zaroori hai:

1. ✅ google-services.json already added
2. ✅ build.gradle already configured  
3. ✅ Capacitor push notifications installed
4. ✅ VAPID key web code mein add kiya

Ab APK rebuild karo:
```bash
npx ionic capacitor build android
# Ya
./gradlew assembleRelease
```

---

## 🔄 Updating VAPID Key

Agar kabhi key change karna ho:

1. Firebase Console → Cloud Messaging
2. Delete old key (if needed)
3. Generate new key pair
4. Update code: `src/firebase.ts`
5. Rebuild app

---

## 📊 Verification Checklist

Setup verify karne ke liye:

- [ ] VAPID key added in `src/firebase.ts` line 44
- [ ] No error messages in browser console
- [ ] FCM Token stored in localStorage
- [ ] Test notification received in browser
- [ ] Android app rebuilt with new code
- [ ] Device can receive push notifications
- [ ] Background notifications work

---

## 🚀 Next: Backend Integration

VAPID key secure set up ho gaya. Next steps:

1. **Firebase Admin SDK setup** (backend)
2. **Create notification API endpoint**
3. **Store user FCM tokens** in database
4. **Send notifications** to specific users

---

## 📞 Quick Reference

**Current Project Info:**
```
Project ID: gen-lang-client-0533512936
Project Name: gen-lang-client
API Key: AIzaSyDXYr10YWmsf0EGKP0bWmE5khFL_-ynanw
Messaging Sender ID: 503686229174
```

**File Locations:**
```
VAPID Key Location: src/firebase.ts (line ~44)
Firebase Config: firebase-applet-config.json
Google Services: android/app/google-services.json
Notification Hook: src/hooks/useNotifications.ts
```

---

**Status:** 🔧 Setup Ready - Just add VAPID key and test!

Last Updated: 2026-05-12
