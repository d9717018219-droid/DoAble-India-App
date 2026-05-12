package com.doableindia;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

public class BootReceiver extends BroadcastReceiver {
    private static final String TAG = "DoAbleBootReceiver";
    private static final String CHANNEL_ID = "doable_channel_v6";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            Log.d(TAG, "📱 Device Boot Completed - Initializing Notification Channels");
            createNotificationChannels(context);
        }
    }

    private void createNotificationChannels(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager notificationManager =
                    (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

            if (notificationManager != null) {
                // Check if channel already exists
                if (notificationManager.getNotificationChannel(CHANNEL_ID) == null) {
                    NotificationChannel channel = new NotificationChannel(
                            CHANNEL_ID,
                            "DoAble Job Alerts",
                            NotificationManager.IMPORTANCE_MAX
                    );

                    channel.setDescription("Important job notifications - Shows even when phone is locked");
                    channel.enableLights(true);
                    channel.setLightColor(0xFFFF6B35);
                    channel.enableVibration(true);
                    channel.setVibrationPattern(new long[]{0, 250, 250, 250});

                    // Set sound
                    Uri soundUri = Uri.parse("android.resource://" + context.getPackageName() + "/raw/blackberry");
                    AudioAttributes audioAttributes = new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_NOTIFICATION_COMMUNICATION_INSTANT)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build();
                    channel.setSound(soundUri, audioAttributes);

                    channel.setShowBadge(true);
                    channel.setBypassDnd(true); // Bypass DND mode for high priority alerts
                    notificationManager.createNotificationChannel(channel);

                    Log.d(TAG, "✅ Notification Channel Created on Boot: " + CHANNEL_ID);
                } else {
                    Log.d(TAG, "ℹ️ Notification Channel Already Exists: " + CHANNEL_ID);
                }
            }
        }
    }
}
