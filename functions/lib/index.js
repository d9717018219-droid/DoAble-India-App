"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAlertNotification = exports.sendTestNotification = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
// Test function to send manual notification
exports.sendTestNotification = functions.https.onCall(async (data, context) => {
    console.log("📨 Test Notification Request received");
    try {
        const tokensSnap = await admin.firestore().collection("fcm_tokens").get();
        const registrationTokens = [];
        tokensSnap.forEach(doc => {
            registrationTokens.push(doc.id);
            console.log("📱 Found Token:", doc.id);
        });
        console.log("📊 Total Tokens Found:", registrationTokens.length);
        if (registrationTokens.length === 0) {
            console.log("⚠️ No registration tokens found in Firestore!");
            return { success: false, message: "No tokens found", tokenCount: 0 };
        }
        const testPayload = {
            notification: {
                title: "🔥 DoAble TEST Alert",
                body: "This is a test notification from DoAble India - Killed State Test",
            },
            data: {
                title: "🔥 DoAble TEST Alert",
                body: "This is a test notification from DoAble India",
                testId: Date.now().toString(),
            },
            android: {
                priority: "high",
                notification: {
                    channelId: "doable_channel_v6",
                    sound: "blackberry",
                },
            },
            tokens: registrationTokens,
        };
        const response = await admin.messaging().sendEachForMulticast(testPayload);
        console.log("✅ Sent to", response.successCount, "devices");
        console.log("❌ Failed on", response.failureCount, "devices");
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    console.error("Failed Token:", registrationTokens[idx], "Error:", resp.error);
                    failedTokens.push(registrationTokens[idx]);
                }
            });
        }
        return {
            success: true,
            message: `Sent to ${response.successCount} devices`,
            successCount: response.successCount,
            failureCount: response.failureCount,
            totalTokens: registrationTokens.length
        };
    }
    catch (error) {
        console.error("❌ Error in sendTestNotification:", error);
        return { success: false, message: String(error), error: JSON.stringify(error) };
    }
});
exports.sendAlertNotification = functions.firestore
    .document("alerts/{alertId}")
    .onCreate(async (snap, context) => {
    const newValue = snap.data();
    const message = newValue.message || "New Alert from DoAble India";
    console.log("📨 Alert Created - Message:", message);
    // 1. Fetch all registration tokens from Firestore
    try {
        const tokensSnap = await admin.firestore().collection("fcm_tokens").get();
        const registrationTokens = [];
        tokensSnap.forEach(doc => {
            registrationTokens.push(doc.id);
            console.log("📱 Token found:", doc.id.substring(0, 20) + "...");
        });
        console.log("📊 Total tokens available:", registrationTokens.length);
        if (registrationTokens.length === 0) {
            console.log("⚠️ WARNING: No registration tokens found in Firestore!");
            return { error: "No tokens" };
        }
        // 2. Build the Multicast Message (Custom Service will handle)
        const payload = {
            notification: {
                title: "📢 DoAble India Alert",
                body: message,
            },
            data: {
                title: "📢 DoAble India Alert",
                body: message,
                notificationId: context.eventId,
                timestamp: new Date().toISOString(),
            },
            android: {
                priority: "high",
                notification: {
                    channelId: "doable_channel_v6",
                    sound: "blackberry",
                    tag: "doable_alert",
                    icon: "ic_stat_name",
                    color: "#FF6B35",
                },
                ttl: 86400 // 24 hours
            },
            apns: {
                headers: {
                    "apns-priority": "10",
                    "apns-push-type": "alert"
                },
                payload: {
                    aps: {
                        alert: {
                            title: "📢 DoAble India Alert",
                            body: message
                        },
                        sound: "blackberry.caf",
                        "mutable-content": 1,
                        badge: 1,
                        "content-available": 1
                    }
                }
            },
            tokens: registrationTokens,
        };
        // 3. Send notifications
        try {
            console.log("🚀 Sending FCM notifications to", registrationTokens.length, "devices...");
            const response = await admin.messaging().sendEachForMulticast(payload);
            console.log(`✅ Successfully sent ${response.successCount} messages`);
            console.log(`❌ Failed on ${response.failureCount} devices`);
            if (response.failureCount > 0) {
                const failedTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        console.error("Failed Token Error:", resp.error?.message || resp.error);
                        failedTokens.push(registrationTokens[idx].substring(0, 20) + "...");
                    }
                });
                console.log('Failed tokens:', failedTokens);
            }
            return {
                success: true,
                successCount: response.successCount,
                failureCount: response.failureCount
            };
        }
        catch (error) {
            console.error("❌ Error sending multicast message:", error);
            return { success: false, error: String(error) };
        }
    }
    catch (error) {
        console.error("❌ Error in sendAlertNotification:", error);
        return { success: false, error: String(error) };
    }
});
//# sourceMappingURL=index.js.map