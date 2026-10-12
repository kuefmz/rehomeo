import { test, expect } from "@playwright/test";
import site from "../../src/data/site.json" with { type: "json" };
import formCopy from "../../src/data/form.json" with { type: "json" };
import { endpoint } from "../../src/lib/websiteli";
const langs = ["de", "en", "fr", "it"] as const;
for (const lang of langs) {
  test(`${lang}: mobile layout, equivalent page switching and validation`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`/${lang}/`);
    await expect(page.locator("h1")).toContainText(site[lang].hero);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page.keyboard.press("Tab");
    await expect(page.locator(".skip")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
    const menu = page.locator(".mobile-nav");
    await menu.locator("summary").click();
    await expect(menu.locator("a").first()).toBeVisible();
    const route = `/${lang}/${site[lang].routes.contact}/`;
    await page.route(endpoint, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ ok: true }),
      }),
    );
    await page.goto(route);
    await page.locator("button[type=submit]").click();
    await expect(page.locator("#name")).toBeFocused();
    await expect(page.locator("#name-error")).not.toBeEmpty();
    await expect(page.locator("input[type=file]")).toHaveCount(0);
    await page.locator("#name").fill("[TEST ONLY] Browser fixture");
    await page.locator("#email").fill("test@example.invalid");
    await page.locator("#postcode").fill("8000");
    await page.locator("#town").fill("Test town");
    await page.locator("#floor").fill("1");
    await page.locator("#service").selectOption("clearance");
    await page.locator("#lift").selectOption("yes");
    await page.locator("#dismantling").selectOption("no");
    await page.locator("#description").fill("[TEST ONLY] No real collection.");
    await page.locator("#privacy").check();
    await page.locator("button[type=submit]").click();
    await expect(page.locator("#date-error")).not.toBeEmpty();
    await page.locator("#flexible").check();
    await page.waitForTimeout(2100);
    await page.locator("button[type=submit]").click();
    await expect(page.locator("#form-status")).toContainText(
      formCopy[lang].success,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    for (const other of langs)
      await expect(
        page.locator(`.language-dropdown nav a[lang=${other}]`),
      ).toHaveAttribute("href", `/${other}/${site[other].routes.contact}/`);
    expect(errors).toEqual([]);
    await page.screenshot({
      path: `test-results/${lang}-contact-mobile.png`,
      fullPage: true,
    });
    await page.goto(`/${lang}/`);
    await page.screenshot({
      path: `test-results/${lang}-home-mobile.png`,
      fullPage: true,
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({
      path: `test-results/${lang}-home-desktop.png`,
      fullPage: true,
    });
  });
}
test("quote loading, duplicate prevention, confirmed success and actionable errors", async ({
  page,
}) => {
  const route = "/en/request-a-quote/";
  await page.goto(route);
  await page.locator("#quote-form").evaluate((el) => {
    (el as HTMLElement).dataset.enabled = "true";
  });
  for (const [id, v] of Object.entries({
    name: "[TEST ONLY] Mock test",
    email: "test@example.invalid",
    postcode: "8000",
    town: "Test town",
    floor: "1",
    description: "[TEST ONLY] No real delivery",
  }))
    await page.locator("#" + id).fill(v);
  for (const [id, v] of Object.entries({
    service: "clearance",
    lift: "yes",
    dismantling: "no",
  }))
    await page.locator("#" + id).selectOption(v);
  await page.locator("#privacy").check();
  await page.locator("#flexible").check();
  await page.waitForTimeout(2100);
  let calls = 0;
  await page.route(endpoint, async (route) => {
    calls++;
    await new Promise((r) => setTimeout(r, 250));
    await route.fulfill({
      status: 200,
      json: { ok: true },
      headers: { "access-control-allow-origin": "*" },
    });
  });
  await page.locator("button[type=submit]").click();
  await expect(page.locator("button[type=submit]")).toBeDisabled();
  await expect(page.locator("#form-status")).toContainText("Sending");
  await expect(page.locator("#form-status")).toContainText("accepted");
  expect(calls).toBe(1);
  await page.reload();
  await page.locator("#quote-form").evaluate((el) => {
    (el as HTMLElement).dataset.enabled = "true";
  });
  for (const [id, v] of Object.entries({
    name: "[TEST ONLY] Mock test",
    email: "test@example.invalid",
    postcode: "8000",
    town: "Test town",
    floor: "1",
    description: "[TEST ONLY] No real delivery",
  }))
    await page.locator("#" + id).fill(v);
  for (const [id, v] of Object.entries({
    service: "clearance",
    lift: "yes",
    dismantling: "no",
  }))
    await page.locator("#" + id).selectOption(v);
  await page.locator("#privacy").check();
  await page.locator("#flexible").check();
  await page.waitForTimeout(2100);
  await page
    .locator("#description")
    .fill("[TEST ONLY] Distinct failure fixture");
  await page.unroute(endpoint);
  await page.route(endpoint, (route) =>
    route.fulfill({
      status: 502,
      json: { ok: false },
      headers: { "access-control-allow-origin": "*" },
    }),
  );
  await page.locator("button[type=submit]").click();
  await expect(page.locator("#form-status")).toContainText(
    "could not be confirmed",
  );
  await expect(page.locator("#description")).not.toHaveValue("");
  await expect(page.locator("button[type=submit]")).toBeEnabled();
});
test("all rendered language routes load and fit a narrow viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  const fs = await import("node:fs/promises");
  async function walk(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return (
      await Promise.all(
        entries.map((e) =>
          e.isDirectory() ? walk(dir + "/" + e.name) : [dir + "/" + e.name],
        ),
      )
    ).flat();
  }
  const paths = (await walk("dist"))
    .filter((p) => p.endsWith("index.html"))
    .map((p) => "/" + p.slice(5).replace(/index\.html$/, ""));
  for (const p of paths) {
    const res = await page.goto(p);
    expect(res?.status(), p).toBe(200);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      p,
    ).toBeTruthy();
  }
});
