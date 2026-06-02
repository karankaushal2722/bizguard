import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.bizguard.app',
  appName: 'BizGuard',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'automatic'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0D0B14',
      iosSpinnerStyle: 'small',
      spinnerColor: '#F97316',
      showSpinner: true
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#0D0B14'
    }
  }
};

export default config;
