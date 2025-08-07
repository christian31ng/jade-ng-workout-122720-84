# JadeNg Training App

A comprehensive workout scheduling app with native mobile alarm capabilities.

## Features

- **Weekly Workout Planning**: Schedule workouts for each day of the week
- **Native Mobile Alarms**: Real phone alarms that trigger at scheduled workout times
- **Exercise Timer**: Built-in timer with music support
- **Progress Tracking**: Track completed exercises with visual progress
- **Responsive Design**: Optimized for mobile devices with safe area support

## Mobile App Setup

This app uses Capacitor to provide native mobile capabilities, including:
- Native alarm notifications
- Mobile-optimized UI with safe area support
- Offline functionality

### Development Setup

To develop and test the mobile app:

1. **Export to GitHub**: Use the "Export to GitHub" button to transfer the project
2. **Clone and Install**:
   ```bash
   git clone [your-repo-url]
   cd jade-ng-workout-sync-97
   npm install
   ```

3. **Add Mobile Platforms**:
   ```bash
   npx cap add ios     # For iOS (requires Mac + Xcode)
   npx cap add android # For Android (requires Android Studio)
   ```

4. **Update Dependencies**:
   ```bash
   npx cap update ios     # For iOS
   npx cap update android # For Android
   ```

5. **Build and Sync**:
   ```bash
   npm run build
   npx cap sync
   ```

6. **Run on Device**:
   ```bash
   npx cap run ios     # For iOS
   npx cap run android # For Android
   ```

### Native Alarm Features

The app automatically schedules native phone alarms when you:
1. Set up a workout for any day
2. Specify a workout time
3. Save the workout

The alarm will trigger at the exact time with:
- Custom notification sound
- Workout details (day and muscle groups)
- Direct link to start the workout

### Mobile UI Optimizations

- Safe area support for devices with notches/home indicators
- Bottom padding to prevent UI elements from being covered
- Touch-optimized buttons and inputs (minimum 44px touch targets)
- Responsive layout for different screen sizes

## Technologies Used

- **React + TypeScript**: Frontend framework
- **Capacitor**: Native mobile capabilities
- **Tailwind CSS**: Styling with mobile-first design
- **Local Notifications**: Native alarm scheduling
- **Web Audio API**: Workout timer sounds

## Browser Support

While the app works in browsers, native alarm functionality requires the mobile app. Browser users will receive web notifications instead of system alarms.

For the best experience, install the mobile app using the instructions above.

## Learn More

For detailed mobile development guides, visit: https://lovable.dev/blogs/capacitor-mobile-app-development

---

## Original Project Info

**URL**: https://lovable.dev/projects/97e7f89b-4971-4bdc-b769-149b9565153d

This project was created using [Lovable](https://lovable.dev) - an AI-powered app builder.