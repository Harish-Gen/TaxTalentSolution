import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.TTS.app',
  appName: 'Tax Talent Solution',
  webDir: 'build',
  server: {
    // Use https scheme on Android (required for Web Crypto API / SHA-256 password hashing)
    androidScheme: 'https',
    // Allow mixed content (local assets + external API calls to Supabase)
    cleartext: false,
  },
  android: {
    // Allow the WebView to access the internet for Supabase / external requests
    allowMixedContent: false,
    // Capture the back button to allow in-app navigation instead of exiting
    captureInput: true,
    // Target Android 14 (API 34) minimum supported API 22 (Android 5.1)
    minWebViewVersion: 60,
  },
  plugins: {
    // SplashScreen settings — shown while the app JS bundle loads
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      spinnerColor: '#0066cc',
    },
  },
};

export default config;
