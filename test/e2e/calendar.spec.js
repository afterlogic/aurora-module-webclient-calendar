const path = require('path')
const { sharedHelper } = require(path.join(
  process.env.AURORA_E2E_ROOT,
  'helpers/paths'
))
const { test, expect } = require('@playwright/test')
const { T } = sharedHelper('timeouts')
const { gotoLoggedIn, step, attachScreenshot, hasCredentials } = sharedHelper('login')
const { clickReady } = sharedHelper('ready')
const { openCalendar } = require('./helpers/calendar')


test.describe('Desktop calendar views', () => {
  test.skip(!hasCredentials(), 'Set E2E_LOGIN_PRIMARY in .env.e2e')

  test('opens Calendar and switches Day / Week / Month / Today', async ({
    page,
  }) => {
    test.setTimeout(T(180000))
    await gotoLoggedIn(page)
    await openCalendar(page)
    await attachScreenshot(page, 'calendar-views-01')

    for (const [id, name] of [
      ['calendar-view-day', 'Day'],
      ['calendar-view-week', 'Week'],
      ['calendar-view-month', 'Month'],
    ]) {
      await step(`Switch to ${name} view`, async () => {
        await clickReady(page.getByTestId(id))
        await expect(page.getByTestId(id)).toHaveClass(/selected/, {
          timeout: T(10000),
        })
        await expect(page.getByTestId('calendar-grid')).toBeVisible({
          timeout: T(15000),
        })
        console.log(`  → ${name} view selected`)
      })
    }

    await step('Click Today', async () => {
      await clickReady(page.getByTestId('calendar-today'))
      await expect(page.getByTestId('calendar-grid')).toBeVisible({
        timeout: T(15000),
      })
      await attachScreenshot(page, 'calendar-views-today')
    })
  })
})
