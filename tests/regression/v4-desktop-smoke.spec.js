const path = require("path");
const { test, expect } = require("@playwright/test");

function v4FileUrl(fileName) {
  const absolute = path.resolve(__dirname, "../../prototype/v4", fileName);
  return `file://${absolute.replace(/\\/g, "/")}`;
}

test("desktop V4 page renders primary tabs", async ({ page }) => {
  await page.goto(v4FileUrl("desktopV4.html"));

  await expect(page).toHaveTitle(/V4 Desktop Workspace Prototype/i);
  await expect(page.locator("#record-title")).toContainText("Irrigation Asset Setup");
  await expect(page.locator('button[data-tab-target="map"]')).toBeVisible();
  await expect(page.locator('button[data-tab-target="program"]')).toBeVisible();
});

test("desktop index report renders queue section", async ({ page }) => {
  await page.goto(v4FileUrl("index.html"));

  await expect(page).toHaveTitle(/Desktop Asset Setup Prototype/i);
  await expect(page.locator("#queue-body")).toHaveCount(1);
  await expect(page.locator("#total-records")).toBeVisible();
});

test("controller program page opens and closes modal", async ({ page }) => {
  await page.goto(`${v4FileUrl("controller_program.html")}?controllerId=CTRL-001&controllerName=Controller%20A`);

  await expect(page).toHaveTitle(/Irrigation Controller Programs/i);
  await expect(page.locator("#program-new-btn")).toBeVisible();

  await page.locator("#program-new-btn").click();
  await expect(page.locator("#program-modal")).not.toHaveClass(/hidden/);

  await page.locator("#program-cancel-btn").click();
  await expect(page.locator("#program-modal")).toHaveClass(/hidden/);
});
