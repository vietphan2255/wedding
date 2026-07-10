import { test, expect } from '@playwright/test'

test('home page loads and shows hero', async ({ page }) => {
  await page.goto('/')
  // Matches the static <title> in index.html (Vietnamese since the metadata
  // rewrite: "Quốc Việt & Thảo Nguyên · Đám cưới 2026").
  await expect(page).toHaveTitle(/Đám cưới/i)
  await expect(page.locator('main')).toBeVisible()
})
