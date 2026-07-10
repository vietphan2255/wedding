import { test, expect, type Page } from '@playwright/test'

// Pre-seeding the intro envelope's session flag skips the overlay entirely.
const INTRO_KEY = 'vn-invitation-opened'

// Stub the photo CDNs with an instant local SVG so image readiness (and the
// drag test's bounding boxes) never depends on the network.
const STUB_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#999"/></svg>'

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => sessionStorage.setItem(key, '1'), INTRO_KEY)
  for (const pattern of [
    'https://picsum.photos/**',
    'https://*.cloudinary.com/**',
  ]) {
    await page.route(pattern, (route) =>
      route.fulfill({ contentType: 'image/svg+xml', body: STUB_SVG }),
    )
  }
})

const scrollY = (page: Page) => page.evaluate(() => window.scrollY)

// Swiper updates the counter at transition START (slideChange), so a passed
// assertion doesn't mean the slide settled — and input mid-transition can be
// dropped (loop-mode slidePrev no-ops while animating). Wait for the real end.
const waitForSlideSettled = (page: Page) =>
  expect
    .poll(() =>
      page.evaluate(() => {
        const el = document.querySelector('[role="dialog"] .swiper') as
          | (HTMLElement & { swiper?: { animating: boolean } })
          | null
        return el?.swiper ? el.swiper.animating : true
      }),
    )
    .toBe(false)

// The marquee tiles drift every frame, so a real click would fail Playwright's
// stability check — dispatch the click event instead (React's delegated
// onClick receives it all the same). Also works for the static reduced-motion
// rows. Ends with the mouse parked over the Swiper so wheel events land on it.
async function openLightbox(page: Page) {
  await page.goto('/')
  const tile = page.locator('#gallery button[aria-label^="Open photo"]').first()
  await tile.dispatchEvent('click')
  const dialog = page.locator('[role="dialog"]')
  await expect(dialog).toContainText('01 /')
  await page.mouse.move(640, 360)
  return dialog
}

test('lightbox freezes the page behind and wheel-swipes navigate', async ({
  page,
}) => {
  const dialog = await openLightbox(page)
  // Lenis is stopped while the lightbox is open.
  await expect(page.locator('html')).toHaveClass(/lenis-stopped/)

  // Horizontal two-finger swipe (wheel deltaX) → Swiper Mousewheel → next.
  await page.mouse.wheel(120, 0)
  await expect(dialog).toContainText('02 /')

  // Nudges below LIGHTBOX_WHEEL_THRESHOLD_DELTA (per-event floor) must not
  // navigate — that's also what keeps macOS momentum-tail jitter quiet.
  await page.mouse.wheel(10, 0)
  await page.mouse.wheel(10, 0)
  await expect(dialog).toContainText('02 /')

  // Vertical wheel must not scroll the page behind the dialog.
  await page.mouse.wheel(0, 900)
  await page.waitForTimeout(400)
  expect(await scrollY(page)).toBe(0)

  // Escape closes: the dialog must actually leave the DOM (framer-motion v11
  // presence-leak regression check) and Lenis must resume.
  await page.keyboard.press('Escape')
  await expect(page.locator('[role="dialog"]')).toHaveCount(0)
  await expect(page.locator('html')).not.toHaveClass(/lenis-stopped/)
  await page.mouse.wheel(0, 700)
  await expect.poll(() => scrollY(page)).toBeGreaterThan(0)
})

test('pointer drag left navigates', async ({ page }) => {
  const dialog = await openLightbox(page)
  // Every slide renders an img now — target the active one only.
  const img = dialog.locator('.swiper-slide-active img')
  await expect(img).toHaveJSProperty('complete', true)

  // Drag left across >50% of the slide width: Playwright's stepped moves take
  // longer than Swiper's 300ms short-swipe window, so the gesture lands in the
  // long-swipe branch, which needs longSwipesRatio (0.5) of the 1280px slide.
  await page.mouse.move(1000, 360)
  await page.mouse.down()
  await page.mouse.move(200, 360, { steps: 10 })
  await page.mouse.up()
  await expect(dialog).toContainText('02 /')
})

test('arrow keys navigate, clicking outside the photo closes', async ({
  page,
}) => {
  const dialog = await openLightbox(page)

  // Keyboard module drives the arrows now.
  await page.keyboard.press('ArrowRight')
  await expect(dialog).toContainText('02 /')
  await waitForSlideSettled(page)
  await page.keyboard.press('ArrowLeft')
  await expect(dialog).toContainText('01 /')

  // Click the dark area inside the slide but outside the centered photo
  // (top-center: clear of the counter and close button corners) → close.
  await page.mouse.click(640, 10)
  await expect(page.locator('[role="dialog"]')).toHaveCount(0)
})

test('arrow keys navigate after the page has scrolled to the gallery', async ({
  page,
}) => {
  // Production repro: Swiper's Keyboard module defaults to onlyInViewport,
  // whose check adds window.scrollY to the fixed dialog's rect and compares
  // the result against the viewport box — so once the page is scrolled past
  // one viewport (every real visit; the gallery sits far down the page) all
  // four corners "leave" the window and arrows are silently ignored.
  // openLightbox() above opens at scrollY=0, which is why the arrow test
  // there never caught it.
  await page.goto('/')
  // The app mounts behind the Firebase connection gate — wait for the gallery
  // before wheeling, or the page has no scroll height yet.
  const tile = page.locator('#gallery button[aria-label^="Open photo"]').first()
  await tile.waitFor({ state: 'attached' })
  // Wheel is the input path Lenis owns (programmatic window.scrollTo gets
  // reverted by its smoothing loop) — step past one viewport, then settle.
  await page.mouse.move(640, 360)
  for (let i = 0; i < 40; i++) {
    const past = await page.evaluate(
      () => window.scrollY > window.innerHeight * 1.5,
    )
    if (past) break
    await page.mouse.wheel(0, 1200)
    await page.waitForTimeout(90)
  }
  await expect
    .poll(async () => {
      const a = await scrollY(page)
      await page.waitForTimeout(120)
      const b = await scrollY(page)
      return Math.abs(b - a)
    })
    .toBeLessThan(1)
  expect(await scrollY(page)).toBeGreaterThan(720)

  await tile.dispatchEvent('click')
  const dialog = page.locator('[role="dialog"]')
  await expect(dialog).toContainText('01 /')
  const scrollAtOpen = await scrollY(page)

  await page.keyboard.press('ArrowRight')
  await expect(dialog).toContainText('02 /')
  await waitForSlideSettled(page)
  await page.keyboard.press('ArrowLeft')
  await expect(dialog).toContainText('01 /')

  // Arrows must act on the slides only — never scroll the frozen page.
  expect(await scrollY(page)).toBe(scrollAtOpen)
})

test('reduced motion: wheel navigation works, page stays frozen', async ({
  page,
}) => {
  // No Lenis mounts at all in this mode — the lightbox's own preventDefault
  // and body overflow must do the freezing; Swiper runs at speed 0.
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const dialog = await openLightbox(page)

  await page.mouse.wheel(120, 0)
  await expect(dialog).toContainText('02 /')

  await page.mouse.wheel(0, 900)
  await page.waitForTimeout(300)
  expect(await scrollY(page)).toBe(0)

  await page.keyboard.press('Escape')
  await expect(page.locator('[role="dialog"]')).toHaveCount(0)
})
