import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 앱인토스 콘솔에 등록한 appName과 똑같아야 한다. 콘솔에서 한 번 등록하면 바꿀 수 없다.
  appName: 'kaku-jlpt',
  brand: {
    primaryColor: '#c4432b', // 카쿠 주홍
  },
  permissions: [],
  webBundleDir: 'dist',
});
