import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.6ca441199d4b4208b965dde82c098536',
  appName: 'jade-ng-workout-32',
  webDir: 'dist',
  server: {
    url: 'https://6ca44119-9d4b-4208-b965-dde82c098536.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#22c55e", // Green fitness color
      sound: "default", // Use system default alarm sound for reliability
      // Android-specific alarm settings
      requestPermissions: true,
      scheduleExact: true, // For precise timing on Android
      allowWhileIdle: true, // Allow notifications even in doze mode
    },
  },
  // Automatically include Android permissions for alarms and notifications
  android: {
    permissions: [
      'android.permission.SCHEDULE_EXACT_ALARM',
      'android.permission.USE_EXACT_ALARM',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.WAKE_LOCK',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.VIBRATE'
    ]
  }
};

export default config;