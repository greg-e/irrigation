const path = require("path");
const { defineConfig, devices } = require("@playwright/test");

const mobileV4Path = path.resolve(__dirname, "prototype/v4/mobileV4.html");
const mobileV4Url = `file://${mobileV4Path.replace(/\\/g, "/")}`;

module.exports = defineConfig({
  testDir: "./tests/regression",
  timeout: 45_000,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: false,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.MOBILE_V4_URL || mobileV4Url,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium-mobile",
      use: {
        ...devices["Pixel 7"],
      },
    },
  ],
});
