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
  openLoggedInPage,
} = sharedHelper('login')
const {
  openCalendar,
  createCalendar,
  shareCalendarWithGuest,
  deleteCalendarByName,
} = require('./helpers/calendar')


test.describe('Desktop calendar multi-user share', () => {
  test.skip(!hasCredentials(), 'Set E2E_LOGIN_PRIMARY in .env.e2e')
  test.skip(
    !hasSecondaryCredentials(),
    'Set E2E_LOGIN_SECONDARY and E2E_PASSWORD_SECONDARY in .env.e2e'
  )

  test('PRIMARY shares calendar; SECONDARY sees it in the sidebar', async ({
    page,
    browser,
    baseURL,
  }) => {
    test.setTimeout(T(300000))
    const name = `e2e-cal-share-${Date.now()}`
    const secondaryEmail = getSecondaryCredentials().login

    await gotoLoggedIn(page)
    await openCalendar(page)

    await step('Create calendar as PRIMARY', async () => {
      await createCalendar(page, name)
      await attachScreenshot(page, 'calendar-share-mu-01-created')
    })

    await step(`Share calendar with SECONDARY ${secondaryEmail}`, async () => {
      await shareCalendarWithGuest(page, name, secondaryEmail)
    })

    const secondary = await openLoggedInPage(
      browser,
      getSecondaryCredentials(),
      { baseURL }
    )
    try {
      await step('SECONDARY opens Calendar and sees shared calendar', async () => {
        await openCalendar(secondary.page)
        const item = secondary.page
          .getByTestId('calendar-item')
          .filter({ hasText: name })
          .first()
        await expect(item).toBeVisible({ timeout: T(90000) })
        await attachScreenshot(secondary.page, 'calendar-share-mu-02-secondary')
      })

      await step('SECONDARY unsubscribes from shared calendar', async () => {
        await deleteCalendarByName(secondary.page, name)
      })
    } finally {
      await secondary.context.close()
    }

    await step('Cleanup: PRIMARY removes calendar', async () => {
      await openCalendar(page)
      await deleteCalendarByName(page, name)
      await attachScreenshot(page, 'calendar-share-mu-03-cleaned')
    })
  })
})
