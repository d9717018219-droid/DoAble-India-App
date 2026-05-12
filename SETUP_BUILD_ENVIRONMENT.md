# 🔧 Setup Build Environment - DoAble India App

Java aur Android SDK install karne ka guide hai ye.

---

## ✅ Prerequisites Check

```bash
# Terminal mein run karo:
java -version
echo $ANDROID_HOME
```

**Agar dono commands error de** → Setup karna padega neeche.

---

## 1️⃣ Install Java Development Kit (JDK)

### Option A: Using Homebrew (Recommended - Mac)

```bash
# Homebrew install karo pehle (agar nahi hai):
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then JDK install karo:
brew install openjdk@17

# Add to PATH:
echo 'export PATH="/usr/local/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify:
java -version
```

### Option B: Direct Download

1. Go to: https://www.oracle.com/java/technologies/downloads/
2. Download: **JDK 17** (or latest LTS version)
3. Install .dmg file
4. Verify: `java -version`

### Option C: Using sdkman (If you use multiple Java versions)

```bash
# Install sdkman
curl -s "https://get.sdkman.io" | bash

# Install Java
sdk install java 17.0.1-oracle

# Verify
java -version
```

---

## 2️⃣ Install Android SDK

### Option A: Android Studio (Recommended)

1. Download: https://developer.android.com/studio
2. Open .dmg and drag to Applications
3. Launch Android Studio
4. Go to: **Android Studio > Preferences > SDK Manager**
5. Install:
   - ✅ Android SDK
   - ✅ Android SDK Platform (latest)
   - ✅ Android Emulator
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Tools

### Option B: Using Homebrew

```bash
# Install Android SDK command-line tools
brew install android-sdk

# Set environment variable:
echo 'export ANDROID_HOME=~/Library/Android/sdk' >> ~/.zshrc
source ~/.zshrc

# Verify:
echo $ANDROID_HOME
```

### Option C: Manual Setup

1. Download SDK from: https://developer.android.com/studio
2. Extract to: `~/Library/Android/sdk`
3. Add to ~/.zshrc:
   ```bash
   export ANDROID_HOME=~/Library/Android/sdk
   export PATH=$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH
   ```
4. Run: `source ~/.zshrc`

---

## 3️⃣ Verify Installation

```bash
# Check Java
java -version
# Should show: openjdk version "17.x.x"

# Check Android SDK
echo $ANDROID_HOME
# Should show: /Users/yourusername/Library/Android/sdk

# Check Android tools
sdkmanager --list
# Should show list of installed packages
```

---

## 🔑 Environment Variables Setup

### For Mac (Permanent):

Edit `~/.zshrc` file:

```bash
# Open editor
nano ~/.zshrc

# Add these lines at the end:
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export ANDROID_HOME=~/Library/Android/sdk
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH

# Save: Press Ctrl+X, then Y, then Enter

# Reload:
source ~/.zshrc
```

### Verify:

```bash
echo $JAVA_HOME
echo $ANDROID_HOME
java -version
```

---

## 📦 Required SDK Packages

Make sure these are installed in Android SDK:

```bash
# List installed packages:
sdkmanager --list_installed

# Install specific packages:
sdkmanager "platforms;android-34"
sdkmanager "build-tools;34.0.0"
sdkmanager "platform-tools"
```

---

## 🚀 Build APK

After setup complete, run:

```bash
# Make script executable
chmod +x /Users/deepak/Downloads/DoAble-India-App/BUILD_APK.sh

# Run build
/Users/deepak/Downloads/DoAble-India-App/BUILD_APK.sh
```

---

## ⚡ Quick Setup (Copy-Paste for Mac)

Sab ek command mein:

```bash
# 1. Install Java
brew install openjdk@17
echo 'export PATH="/usr/local/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc

# 2. Add to ~/.zshrc
cat >> ~/.zshrc << 'EOF'
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export ANDROID_HOME=~/Library/Android/sdk
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH
EOF

# 3. Reload
source ~/.zshrc

# 4. Verify
java -version
echo $ANDROID_HOME
```

---

## 🐛 Troubleshooting

### Issue: "java: command not found"
```
❌ Problem: Java not installed or not in PATH
✅ Solution: 
  brew install openjdk@17
  source ~/.zshrc
```

### Issue: "ANDROID_HOME not set"
```
❌ Problem: Android SDK path not configured
✅ Solution:
  echo 'export ANDROID_HOME=~/Library/Android/sdk' >> ~/.zshrc
  source ~/.zshrc
```

### Issue: "Android SDK not found"
```
❌ Problem: SDK tools missing
✅ Solution:
  sdkmanager "platforms;android-34"
  sdkmanager "build-tools;34.0.0"
```

### Issue: "Gradle daemon failed"
```
❌ Problem: Gradle cache corrupted
✅ Solution:
  cd /Users/deepak/Downloads/DoAble-India-App/android
  ./gradlew clean
  ./gradlew assembleRelease
```

---

## ✅ Final Checklist

- [ ] Java installed: `java -version` shows version
- [ ] ANDROID_HOME set: `echo $ANDROID_HOME` shows path
- [ ] Android SDK installed: Folder exists at ~/Library/Android/sdk
- [ ] Build tools available: `sdkmanager --list_installed` shows build-tools
- [ ] Can run gradlew: `./gradlew --version` works

---

## 📝 Time Estimates

| Step | Time |
|------|------|
| Java Installation | 5 min |
| Android Studio | 10 min (if not installed) |
| SDK Setup | 10 min |
| Environment Setup | 5 min |
| **Total** | **~30 minutes** |

---

## 🎯 Next Steps

After setup:

1. Run: `./BUILD_APK.sh`
2. Wait for build (2-5 minutes)
3. APK generated at: `android/app/build/outputs/apk/release/app-release.apk`
4. Install on device
5. Test notifications! 🎉

---

## 📞 Resources

- **Java Download:** https://www.oracle.com/java/technologies/downloads/
- **Android Studio:** https://developer.android.com/studio
- **Gradle Docs:** https://gradle.org/install/
- **Android Dev Docs:** https://developer.android.com/docs

---

**Generated:** 2026-05-12  
**App:** DoAble India Tutors  
**Status:** Ready for Build Setup
