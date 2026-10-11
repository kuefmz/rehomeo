import { defineConfig } from "@playwright/test";
export default defineConfig({
  timeout: 120000,
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://localhost:4321",
    headless: true,
    launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : {},
  },
  webServer: {
    command: "node server/index.mjs",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
  },
  reporter: "list",
});
