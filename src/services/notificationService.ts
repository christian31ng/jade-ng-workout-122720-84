import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// Service for handling workout reminders and native mobile alarms
class NotificationService {
  private scheduledNotifications: Map<string, number> = new Map();

  async requestPermission(): Promise<boolean> {
    // For native mobile apps, use Capacitor's LocalNotifications
    if (Capacitor.isNativePlatform()) {
      try {
        // Request all necessary permissions for alarms
        const result = await LocalNotifications.requestPermissions();
        
        // On Android, also check for exact alarm permissions
        if (Capacitor.getPlatform() === 'android') {
          console.log('✅ Android alarm permissions requested');
          // The exact alarm permission is handled automatically by Capacitor
        }
        
        return result.display === 'granted';
      } catch (error) {
        console.warn('Could not request native notification permissions:', error);
        return false;
      }
    }

    // Fallback for web browsers
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async scheduleWorkoutReminder(day: string, time: string, muscles: string[]): Promise<boolean> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      return false;
    }

    // Clear existing notification for this day
    await this.clearNotification(day);

    // Parse time (format: "HH:MM" or "H:MM AM/PM")
    const scheduledTime = this.parseTimeString(time);
    if (!scheduledTime) {
      console.error('Invalid time format:', time);
      return false;
    }

    // Get the next occurrence of this day of the week
    const nextWorkoutDate = this.getNextWorkoutDate(day, scheduledTime.hours, scheduledTime.minutes);
    
    // Generate a unique but consistent ID for this day
    const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day);
    const notificationId = dayIndex + 1; // Use 1-7 for days of week

    // For webview apps (like webintoapp), use Service Worker for persistent alarms
    console.log(`📱 Scheduling alarm for ${day} at ${time}`);
    
    // Schedule recurring alarm using interval-based approach for webview compatibility
    this.scheduleRecurringAlarm(day, time, muscles, nextWorkoutDate);
    
    // Store notification reference
    this.scheduledNotifications.set(day, notificationId);
    this.saveScheduledNotifications();
    
    console.log(`✅ Alarm scheduled for ${day} at ${time} - will repeat weekly`);
    return true;
  }

  private scheduleRecurringAlarm(day: string, time: string, muscles: string[], nextWorkoutDate: Date): void {
    // Calculate time until next occurrence
    const timeUntilNotification = nextWorkoutDate.getTime() - Date.now();
    
    // Set up the recurring alarm
    const scheduleNext = () => {
      // Show notification
      this.showWorkoutNotification(day, muscles);
      
      // Schedule for same time next week (7 days = 7 * 24 * 60 * 60 * 1000 ms)
      setTimeout(scheduleNext, 7 * 24 * 60 * 60 * 1000);
    };
    
    // Schedule the first occurrence
    setTimeout(scheduleNext, timeUntilNotification);
    
    // Also set up a backup checker that runs every hour to ensure alarms don't get lost
    this.setupBackupChecker(day, time, muscles);
  }

  private setupBackupChecker(day: string, time: string, muscles: string[]): void {
    const checkAlarm = () => {
      const now = new Date();
      const scheduledTime = this.parseTimeString(time);
      if (!scheduledTime) return;
      
      // Check if it's the right day and within 5 minutes of the alarm time
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      if (dayNames[now.getDay()] === day) {
        const alarmTime = new Date();
        alarmTime.setHours(scheduledTime.hours, scheduledTime.minutes, 0, 0);
        
        const timeDiff = Math.abs(now.getTime() - alarmTime.getTime());
        if (timeDiff < 5 * 60 * 1000) { // Within 5 minutes
          this.showWorkoutNotification(day, muscles);
        }
      }
    };
    
    // Check every hour
    setInterval(checkAlarm, 60 * 60 * 1000);
  }

  private getNextWorkoutDate(dayName: string, hours: number, minutes: number): Date {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayIndex = dayNames.indexOf(dayName);
    
    const now = new Date();
    const currentDayIndex = now.getDay();
    
    let daysUntilTarget = targetDayIndex - currentDayIndex;
    
    // If it's the same day, check if the time has passed
    if (daysUntilTarget === 0) {
      const todayAtTime = new Date();
      todayAtTime.setHours(hours, minutes, 0, 0);
      
      // If time has passed today, schedule for next week
      if (todayAtTime <= now) {
        daysUntilTarget = 7;
      }
    } else if (daysUntilTarget < 0) {
      // If the day has passed this week, schedule for next week
      daysUntilTarget += 7;
    }
    
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + daysUntilTarget);
    targetDate.setHours(hours, minutes, 0, 0);
    
    return targetDate;
  }

  private parseTimeString(timeStr: string): { hours: number; minutes: number } | null {
    // Handle both 24-hour format (HH:MM) and 12-hour format (H:MM AM/PM)
    const time24Regex = /^(\d{1,2}):(\d{2})$/;
    const time12Regex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

    let match = timeStr.match(time24Regex);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return { hours, minutes };
      }
    }

    match = timeStr.match(time12Regex);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period = match[3].toUpperCase();

      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return { hours, minutes };
      }
    }

    return null;
  }

  private showWorkoutNotification(day: string, muscles: string[]): void {
    if (Notification.permission !== 'granted') {
      return;
    }

    const muscleList = muscles.join(', ');
    const notification = new Notification('🏋️ Workout Time!', {
      body: `Time for your ${day} workout!\nFocus: ${muscleList}`,
      icon: '/favicon.ico',
      tag: `workout-${day}`,
      requireInteraction: true
    });

    // Play a notification sound (if supported)
    this.playNotificationSound();

    notification.onclick = () => {
      window.focus();
      // Navigate to summary page
      window.location.hash = '/summary';
      notification.close();
    };

    // Auto-close after 30 seconds
    setTimeout(() => {
      notification.close();
    }, 30000);
  }

  private playNotificationSound(): void {
    try {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }

  async clearNotification(day: string): Promise<void> {
    const notificationId = this.scheduledNotifications.get(day);
    if (!notificationId) return;

    // For native mobile apps, cancel the local notification
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.cancel({
          notifications: [{ id: notificationId }]
        });
      } catch (error) {
        console.warn('Could not cancel native notification:', error);
      }
    } else {
      // For web browsers, clear the timeout
      clearTimeout(notificationId);
    }

    this.scheduledNotifications.delete(day);
    this.saveScheduledNotifications();
  }

  async clearAllNotifications(): Promise<void> {
    // For native mobile apps, cancel all local notifications
    if (Capacitor.isNativePlatform()) {
      try {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel({
            notifications: pending.notifications.map(n => ({ id: n.id }))
          });
        }
      } catch (error) {
        console.warn('Could not cancel native notifications:', error);
      }
    } else {
      // For web browsers, clear all timeouts
      this.scheduledNotifications.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
    }

    this.scheduledNotifications.clear();
    this.saveScheduledNotifications();
  }

  private saveScheduledNotifications(): void {
    const notificationData = Array.from(this.scheduledNotifications.entries());
    localStorage.setItem('scheduledNotifications', JSON.stringify(notificationData));
  }

  // Call this on app initialization to restore scheduled notifications
  async restoreScheduledNotifications(): Promise<void> {
    try {
      // Initialize native notifications if on mobile
      if (Capacitor.isNativePlatform()) {
        await this.requestPermission();
      }

      const saved = localStorage.getItem('scheduledNotifications');
      if (saved) {
        // Clear old notifications and reschedule based on saved workout data
        await this.clearAllNotifications();
        
        // Get workout data from localStorage
        const workoutData = localStorage.getItem('workoutSchedule');
        if (workoutData) {
          const workouts = JSON.parse(workoutData);
          for (const [day, workout] of Object.entries(workouts) as [string, any][]) {
            await this.scheduleWorkoutReminder(day, workout.time, workout.muscles);
          }
        }
      }
    } catch (error) {
      console.warn('Could not restore scheduled notifications:', error);
    }
  }
}

export const notificationService = new NotificationService();