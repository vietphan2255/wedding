import { test, expect, type Page } from '@playwright/test'

// Pre-seeding the intro envelope's session flag skips the overlay entirely.
const INTRO_KEY = 'vn-invitation-opened'

// Stub the photo CDNs with an instant local SVG so tile widths (and therefore
// the measured marquee period) never depend on the network.
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

// Scroll via wheel events — the input path Lenis owns (programmatic
// window.scrollTo gets reverted by its smoothing loop). Steps toward the
// target until close, then lets the smoothing settle and framer-motion
// recompute the scroll-linked transforms.
async function wheelScrollTo(page: Page, targetY: number) {
  await page.mouse.move(640, 360)
  for (let i = 0; i < 80; i++) {
    const y = await page.evaluate(() => window.scrollY)
    const delta = targetY - y
    if (Math.abs(delta) < 24) break
    await page.mouse.wheel(0, Math.max(-1200, Math.min(1200, delta)))
    await page.waitForTimeout(90)
  }
  // Let Lenis finish easing, then give the MotionValues a frame to propagate.
  await expect
    .poll(
      async () => {
        const a = await page.evaluate(() => window.scrollY)
        await page.waitForTimeout(120)
        const b = await page.evaluate(() => window.scrollY)
        return Math.abs(b - a)
      },
      { timeout: 10_000 },
    )
    .toBeLessThan(1)
  await page.evaluate(
    () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  )
}

type PinState = {
  sectionTop: number
  sectionH: number
  viewportH: number
  scrollY: number
  stickyTop: number | null
  trackXs: number[]
}

// Reads the runway geometry, the sticky inner's viewport offset, and each
// marquee track's translateX (parsed from the computed matrix).
const readPin = (page: Page): Promise<PinState> =>
  page.evaluate(() => {
    const section = document.querySelector('#gallery') as HTMLElement
    const sticky = section.querySelector(':scope > div.sticky')
    const tracks = Array.from(
      section.querySelectorAll<HTMLElement>('.flex.w-max'),
    )
    const parseX = (el: HTMLElement) => {
      const t = getComputedStyle(el).transform
      if (!t || t === 'none') return 0
      const nums = t.match(/-?[\d.]+/g)?.map(Number) ?? []
      return t.startsWith('matrix3d') ? (nums[12] ?? 0) : (nums[4] ?? 0)
    }
    return {
      sectionTop: section.getBoundingClientRect().top + window.scrollY,
      sectionH: section.offsetHeight,
      viewportH: window.innerHeight,
      scrollY: window.scrollY,
      stickyTop: sticky ? sticky.getBoundingClientRect().top : null,
      trackXs: tracks.map(parseX),
    }
  })

test('gallery pins at the viewport top and scroll scrubs both rows', async ({
  page,
}) => {
  await page.goto('/')
  // The connection gate lazy-loads the whole app; #gallery exists only after
  // Firebase reports connected and the bundle mounts.
  await page.locator('#gallery').waitFor({ state: 'attached', timeout: 20_000 })

  // Thumbnails are loading="lazy": nothing fetches (and tiles stay 0-wide, so
  // the marquee period stays unmeasured) until the gallery nears the viewport.
  // Wheel there first, then wait for a tile to gain real width — that's the
  // signal that the stubbed images landed, the period was measured, and the
  // runway height settled at its final proportional value.
  const roughTop = await page.evaluate(
    () =>
      (document.querySelector('#gallery')?.getBoundingClientRect().top ?? 0) +
      window.scrollY,
  )
  await wheelScrollTo(page, roughTop)
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .querySelector('#gallery button[aria-label^="Open photo"]')
            ?.getBoundingClientRect().width ?? 0,
      ),
    )
    .toBeGreaterThan(0)

  // Freeze the marquee's time-based drift (and its scroll-velocity boost) by
  // faking a hidden tab — the component pauses its rAF accumulator but the
  // scroll-scrub transform stays live. Row movement below is then *exactly*
  // the pin scrub, with no drift noise.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      get: () => true,
      configurable: true,
    })
    document.dispatchEvent(new Event('visibilitychange'))
  })

  const initial = await readPin(page)
  // Runway: the section is taller than the viewport (100svh + pinExtra).
  expect(initial.sectionH).toBeGreaterThan(initial.viewportH * 1.5)
  expect(initial.stickyTop).not.toBeNull()
  expect(initial.trackXs).toHaveLength(2)

  const pinRange = initial.sectionH - initial.viewportH

  // Just inside the pin: sticky inner locked to the viewport top.
  await wheelScrollTo(page, initial.sectionTop + 120)
  const atStart = await readPin(page)
  expect(Math.abs(atStart.stickyTop ?? 99)).toBeLessThanOrEqual(2)
  const p1 = (atStart.scrollY - initial.sectionTop) / pinRange

  // Deeper into the pin: still locked, and both rows have been scrubbed by
  // Δp × period (modulo wrapping, still ≥ min(d, period−d) — large for the
  // ~0.4 progress jump targeted here).
  await wheelScrollTo(page, initial.sectionTop + pinRange * 0.55)
  const atHalf = await readPin(page)
  expect(Math.abs(atHalf.stickyTop ?? 99)).toBeLessThanOrEqual(2)
  const p2 = (atHalf.scrollY - initial.sectionTop) / pinRange
  expect(p2 - p1).toBeGreaterThan(0.25)
  for (let i = 0; i < 2; i++) {
    const delta = Math.abs(atHalf.trackXs[i] - atStart.trackXs[i])
    expect(delta).toBeGreaterThan(150)
  }

  // Past the runway: the sticky releases and the section scrolls away.
  await wheelScrollTo(page, initial.sectionTop + pinRange + 400)
  const released = await readPin(page)
  expect(released.stickyTop ?? 0).toBeLessThan(-50)
})

test('reduced motion keeps the static, unpinned gallery', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const section = page.locator('#gallery')
  await expect(section).toBeVisible()

  // Today's padded static section: no runway height, no sticky inner, and the
  // two plain scroll rows instead of marquee tracks.
  await expect(section).toHaveClass(/section-padding/)
  const inlineHeight = await section.evaluate((el) => el.style.height)
  expect(inlineHeight).toBe('')
  await expect(page.locator('#gallery > div.sticky')).toHaveCount(0)
  await expect(page.locator('#gallery [class*="overflow-x-auto"]')).toHaveCount(2)
})

// Short / landscape viewports can't fit the heading + both marquee rows in one
// 100svh. The pinned box scales the tiles with svh and, via `safe center` under
// the reserved Navbar height, keeps the whole heading (title/subtitle/desc)
// below the fixed nav and never clips it — overflow spills off the bottom row.
test('gallery heading clears the fixed nav and stays fully visible on a short viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 812, height: 375 })
  await page.goto('/')
  await page.locator('#gallery').waitFor({ state: 'attached', timeout: 20_000 })

  const roughTop = await page.evaluate(
    () =>
      (document.querySelector('#gallery')?.getBoundingClientRect().top ?? 0) +
      window.scrollY,
  )
  await wheelScrollTo(page, roughTop)
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .querySelector('#gallery button[aria-label^="Open photo"]')
            ?.getBoundingClientRect().width ?? 0,
      ),
    )
    .toBeGreaterThan(0)

  // Wheel solidly into the pinned phase so the sticky inner locks to the top.
  const g = await page.evaluate(() => {
    const s = document.querySelector('#gallery') as HTMLElement
    return {
      top: s.getBoundingClientRect().top + window.scrollY,
      h: s.offsetHeight,
      vpH: window.innerHeight,
    }
  })
  await wheelScrollTo(page, g.top + (g.h - g.vpH) * 0.3)

  const geo = await page.evaluate(() => {
    const box = document.querySelector('#gallery > div.sticky') as HTMLElement
    const b = box.getBoundingClientRect()
    const heading = (box.children[0] as HTMLElement).getBoundingClientRect()
    const header = document.querySelector('header') as HTMLElement
    return {
      stickyTop: b.top,
      boxTop: b.top,
      boxBottom: b.bottom,
      headingTop: heading.top,
      headingBottom: heading.bottom,
      navBottom: header.getBoundingClientRect().bottom,
    }
  })

  // Pinned at the viewport top.
  expect(Math.abs(geo.stickyTop)).toBeLessThanOrEqual(2)
  // The whole heading sits below the fixed nav (title never hidden behind it) …
  expect(geo.headingTop).toBeGreaterThanOrEqual(geo.navBottom - 1)
  // … and is fully within the pinned viewport box (never clipped off the top).
  expect(geo.headingTop).toBeGreaterThanOrEqual(geo.boxTop - 1)
  expect(geo.headingBottom).toBeLessThanOrEqual(geo.boxBottom + 1)
})
