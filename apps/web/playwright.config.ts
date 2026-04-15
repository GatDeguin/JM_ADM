import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "smoke-mocked",
      grep: /smoke\//,
    },
    {
      name: "real-api-db",
      grep: /real\//,
    },
  ],
  webServer: {
    command: "pnpm dev",
    port: 3000,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
