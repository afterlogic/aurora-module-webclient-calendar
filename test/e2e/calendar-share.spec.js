const path = require('path')
const { sharedHelper } = require(path.join(
  process.env.AURORA_E2E_ROOT,
  'helpers/paths'
))
const { test, expect } = require('@playwright/test')
const { T } = sharedHelper('timeouts')
const {
  gotoLoggedIn,
  step,
  attachScreenshot,
  hasCredentials,
  hasSecondaryCredentials,
  getSecondaryCredentials,
} = sharedHelper('login')
const { clickReady } = sharedHelper('ready')
const {
  openCalendar,
  openCalendarItemMenu,
  addCalendarShareGuest,
  saveCalendarShareDialog,
} = require('./helpers/calendar')


test.describe('Desktop calendar share', () => {
  test.skip(!hasCredentials(), 'Set E2E_LOGIN_PRIMARY in .env.e2e')

  test('creates a calendar and opens the share dialog', async ({ page }) => {
    test.setTimeout(T(180000))
    const name = `e2e-cal-${Date.now()}`

    await gotoLoggedIn(page)
    await openCalendar(page)

    await step('Create calendar', async () => {
      await clickReady(page.getByTestId('calendar-create-calendar'))
      await expect(page.getByTestId('calendar-create-dialog')).toBeVisible({
        timeout: T(15000),
      })
      await page.getByTestId('calendar-create-name').fill(name)
      await clickReady(page.getByTestId('calendar-create-save'))
      await expect(page.getByTestId('calendar-create-dialog')).toBeHidden({
        timeout: T(30000),
      })
    })

    const item = page.getByTestId('calendar-item').filter({ hasText: name }).first()
    await expect(item).toBeVisible({ timeout: T(30000) })

    await step('Open share dialog from calendar menu', async () => {
      await openCalendarItemMenu(page, item)
      const share = page.getByTestId('calendar-menu-share').locator('visible=true')
      await expect(share).toBeVisible({ timeout: T(15000) })
      await clickReady(share)
      await expect(page.getByTestId('calendar-share-dialog')).toBeVisible({
        timeout: T(15000),
      })
      await attachScreenshot(page, 'calendar-share-dialog')
    })

    if (hasSecondaryCredentials()) {
      const { login } = getSecondaryCredentials()
      await step(`Add SECONDARY ${login} as guest`, async () => {
        await addCalendarShareGuest(page, login)
        await saveCalendarShareDialog(page)
      })
    } else {
      await saveCalendarShareDialog(page)
    }
  })
})
