/**
 * サンプルE2Eテスト用 Playwright 設定
 *
 * 実行コマンド: pnpm test:e2e:samples
 *
 * サンプルドメインのE2Eテスト専用設定。
 * リリースZIP展開後のプロジェクトには含まれない。
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/samples/tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  timeout: 60000,
  expect: {
    timeout: 15000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    actionTimeout: 15000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
