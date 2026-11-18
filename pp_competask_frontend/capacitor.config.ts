import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'CompeTask',
  webDir: 'www',
  plugins: {
    LocalNotifications: { smallIcon: 'ic_lembrete', iconColor: '#52008c' },
  },
};

export default config;
