# Capacitor ProGuard Rules
-keep class com.getcapacitor.** { *; }
-keep class com.codetrixstudio.capacitor.googleauth.** { *; }
-keep class com.capacitorjs.plugins.** { *; }

# Firebase ProGuard Rules
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Prevent shrinking of JS interfaces
-keepattributes JavascriptInterface
-keepattributes *Annotation*

# Preserve line numbers for better crash reports
-keepattributes SourceFile,LineNumberTable
