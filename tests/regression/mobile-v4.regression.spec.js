const { test, expect } = require("@playwright/test");
const path = require("path");

function mobileV4FileUrl() {
  const absolute = path.resolve(__dirname, "../../prototype/v4/mobileV4.html");
  return `file://${absolute.replace(/\\/g, "/")}`;
}

async function enterMapWorkspace(page) {
  await page.goto(mobileV4FileUrl());

  const woliListItems = page.locator(".woli-item");
  if (await woliListItems.count()) {
    await expect(woliListItems.first()).toBeVisible();
    await woliListItems.first().click();
  }

  await expect(page.locator("#tab-map")).toHaveCount(1);
  await page.locator("#tab-map").click();
  await expect(page.locator("#map-control-panel")).toBeVisible();
}

async function seedMappedZone(page, assetId = "zone-regression-1") {
  await page.evaluate((id) => {
    window.postMessage(
      {
        type: "SPATIAL_COMPONENT_CREATED",
        asset: {
          id,
          type: "zone",
          name: "Zone Regression",
          mapX: 42,
          mapY: 58,
          description: "Auto-seeded for regression coverage",
        },
      },
      "*"
    );
  }, assetId);

  await expect(page.locator("#map-sheet-selected")).toContainText("Selected:");
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {
      // file:// localStorage can throw in some environments; safe to ignore.
    }
  });
});

test("map control baseline renders with expected button state", async ({ page }) => {
  await enterMapWorkspace(page);

  await expect(page.locator("#map-add-marker")).toBeVisible();
  await expect(page.locator("#map-edit-toggle")).toBeDisabled();
  await expect(page.locator("#map-delete-geometry")).toBeDisabled();
  await expect(page.locator("#map-toggle-fullscreen")).toBeVisible();
  await expect(page.locator(".map-control-label-row span")).toHaveCount(6);
});

test("fullscreen map mode toggles on, off, and via Escape", async ({ page }) => {
  await enterMapWorkspace(page);

  const shell = page.locator(".phone-shell");
  const fullscreenToggle = page.locator("#map-toggle-fullscreen");

  await expect(shell).not.toHaveClass(/map-fullscreen-active/);
  await fullscreenToggle.click();
  await expect(shell).toHaveClass(/map-fullscreen-active/);
  await expect(fullscreenToggle).toHaveAttribute("aria-label", "Exit Full Screen");

  await page.keyboard.press("Escape");
  await expect(shell).not.toHaveClass(/map-fullscreen-active/);
  await expect(fullscreenToggle).toHaveAttribute("aria-label", "Full Screen");
});

test("fullscreen mode exits automatically when leaving MAP tab", async ({ page }) => {
  await enterMapWorkspace(page);

  const shell = page.locator(".phone-shell");
  await page.locator("#map-toggle-fullscreen").click();
  await expect(shell).toHaveClass(/map-fullscreen-active/);

  await page.evaluate(() => {
    if (typeof window.setActiveTab === "function") {
      window.setActiveTab("details");
    }
  });
  await expect(shell).not.toHaveClass(/map-fullscreen-active/);
});

test("asset tooltip hides additional metadata chips", async ({ page }) => {
  await enterMapWorkspace(page);
  await seedMappedZone(page);

  const selectionCard = page.locator("#gis-selection-card");
  await expect(selectionCard).toBeVisible();

  const metadataFields = page.locator("#gis-selection-fields");
  await expect(metadataFields).toHaveClass(/hidden/);

  const metadataChildren = await metadataFields.evaluate((node) => node.children.length);
  expect(metadataChildren).toBe(0);
});

test("opening add asset from Assets closes Assets dialog and opens create sheet", async ({ page }) => {
  await enterMapWorkspace(page);

  await page.locator("#map-open-assets").click();
  await expect(page.locator("#assets-sheet")).not.toHaveClass(/hidden/);

  await page.locator("#add-asset-button").click();
  await expect(page.locator("#assets-sheet")).toHaveClass(/hidden/);
  await expect(page.locator("#asset-create-sheet")).not.toHaveClass(/hidden/);
});

test("opening checklist from tooltip closes Output dialog and opens checklist composer", async ({ page }) => {
  await enterMapWorkspace(page);
  await seedMappedZone(page, "zone-regression-2");

  await page.locator("#map-open-output").click();
  await expect(page.locator("#output-submit-sheet")).not.toHaveClass(/hidden/);

  await page.evaluate(() => {
    if (typeof window.openChecklistForAsset === "function") {
      window.openChecklistForAsset("zone:zone-regression-2", "map", "map");
    }
  });

  await expect(page.locator("#output-submit-sheet")).toHaveClass(/hidden/);
  await expect(page.locator("#asset-detail-sheet")).not.toHaveClass(/hidden/);
  await expect(page.locator("#detail-callout-composer")).not.toHaveClass(/hidden/);
});
