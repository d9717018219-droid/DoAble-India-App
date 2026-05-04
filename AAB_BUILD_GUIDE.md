# DoAble India - Android App Bundle (.aab) Build Guide

## Status: Ready for keystore creation and building

Your project is now configured for Android builds with package name `com.doableindia`. Follow these steps:

### Step 1: Create Your Signing Keystore

You need to create a keystore file to sign your app. Choose ONE method:

#### Method A: Using Android Studio (Recommended)
1. Open Android Studio
2. Go to **Build** → **Generate Signed Bundle/APK**
3. Select **Android App Bundle (AAB)**
4. Click **Create New**
5. Fill in the details:
   - **Key store path**: `/Users/deepak/Downloads/code/DoAble-India-App/android/app/com.doableindia.keystore`
   - **Password**: `doable@123456`
   - **Alias**: `doableindia-key`
   - **Password**: `doable@123456`
6. Click **Create Keystore**
7. Complete the signing process to generate the .aab file

#### Method B: Using Terminal (If Java is installed)
```bash
cd /Users/deepak/Downloads/code/DoAble-India-App/android/app

keytool -genkey -v -keystore com.doableindia.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias doableindia-key \
  -storepass doable@123456 \
  -keypass doable@123456 \
  -dname "CN=DoAble India, O=DoAble, L=India, ST=India, C=IN"
```

### Step 2: Build the .aab File

Once the keystore is created, run:

```bash
cd /Users/deepak/Downloads/code/DoAble-India-App
npm run build  # Already done ✓
cd android
./gradlew bundleRelease
```

The .aab file will be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Step 3: Upload to Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app with ID `com.doableindia`
3. Go to **Release** → **Production**
4. Click **Create new release**
5. Upload the `.aab` file
6. Add release notes and publish

## Important Details

- **App ID**: `com.doableindia`
- **App Name**: `DoAble India`
- **Keystore Location**: `android/app/com.doableindia.keystore`
- **Keystore Alias**: `doableindia-key`
- **Build Output**: `android/app/build/outputs/bundle/release/app-release.aab`

## Troubleshooting

### If you get "Java not found"
- Install Java: https://www.java.com
- Or use Android Studio's built-in tools

### If Gradle build fails
- Make sure Android SDK is installed
- Update Android Studio
- Check that Java version is 11 or higher

## What's Already Done

✓ React app built to `dist/`
✓ Capacitor initialized
✓ Android project created
✓ Gradle signing configured with `com.doableindia` package
✓ Build configuration ready

## Next Steps

1. Create the keystore (choose Method A or B above)
2. Run `./gradlew bundleRelease`
3. Upload the .aab to Play Store Console
