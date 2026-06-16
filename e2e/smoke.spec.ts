import { test, expect } from '@playwright/test'

test('home page loads and shows hero', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Wedding/i)
  await expect(page.locator('main')).toBeVisible()
})
