const path = require('path')
const { sharedHelper } = require(path.join(
  process.env.AURORA_E2E_ROOT,
  'helpers/paths'
))
const { test, expect } = require('@playwright/test')
const { T } = sharedHelper('timeouts')
const { gotoLoggedIn, step, attachScreenshot, hasCredentials } = sharedHelper('login')
const { clickReady, confirmOkIfVisible } = sharedHelper('ready')
const {
  openCalendar,
  openCreateEvent,
  fillEventSubject,
  saveEvent,
  openEventByTitle,
  waitForEventOnGrid,
  eventOnGrid,
  eventDialog,
  setEventAllDay,
  changeEventStartTime,
  getEventDatesSummary,
} = require('./helpers/calendar')


test.describe('Desktop calendar events', () => {
  test.skip(!hasCredentials(), 'Set E2E_LOGIN_PRIMARY in .env.e2e')

  test('creates an event and it appears on the grid', async ({ page }) => {
    test.setTimeout(T(180000))
    const title = `e2e-event-${Date.now()}`

    await gotoLoggedIn(page)
    await openCalendar(page)

    await step('Create event', async () => {
      await openCreateEvent(page)
      await fillEventSubject(page, title)
      await saveEvent(page)
    })

    await step('Expect event on grid', async () => {
      await waitForEventOnGrid(page, title)
      await attachScreenshot(page, 'calendar-event-created')
    })
  })

  test('edits event title and saves', async ({ page }) => {
    test.setTimeout(T(180000))
    const title = `e2e-edit-${Date.now()}`
    const renamed = `${title}-renamed`

    await gotoLoggedIn(page)
    await openCalendar(page)

    await openCreateEvent(page)
    await fillEventSubject(page, title)
    await saveEvent(page)
    await waitForEventOnGrid(page, title)

    await step('Edit title', async () => {
      await openEventByTitle(page, title)
      await fillEventSubject(page, renamed)
      await saveEvent(page)
    })

    await step('Expect renamed event on grid', async () => {
      await waitForEventOnGrid(page, renamed)
      await expect(eventOnGrid(page, title)).toHaveCount(0)
      await attachScreenshot(page, 'calendar-event-edited')
    })
  })

  test('edits event start time and saves', async ({ page }) => {
    test.setTimeout(T(180000))
    const title = `e2e-time-${Date.now()}`

    await gotoLoggedIn(page)
    await openCalendar(page)
    await clickReady(page.getByTestId('calendar-view-week'))

    await openCreateEvent(page)
    await fillEventSubject(page, title)
    await saveEvent(page)
    await waitForEventOnGrid(page, title)

    let newTime = ''
    await step('Edit start time', async () => {
      await openEventByTitle(page, title)
      const changed = await changeEventStartTime(page)
      newTime = changed.to
      console.log(`  → Start time: ${changed.from} → ${changed.to}`)
      await saveEvent(page)
    })

    await step('Expect updated time in event dialog', async () => {
      await openEventByTitle(page, title)
      const summary = await getEventDatesSummary(page)
      expect(summary).toContain(newTime)
      await attachScreenshot(page, 'calendar-event-time-edited')
    })
  })

  test('creates an all-day event', async ({ page }) => {
    test.setTimeout(T(180000))
    const title = `e2e-allday-${Date.now()}`

    await gotoLoggedIn(page)
    await openCalendar(page)
    await clickReady(page.getByTestId('calendar-view-month'))

    await step('Create all-day event', async () => {
      await openCreateEvent(page)
      await fillEventSubject(page, title)
      await setEventAllDay(page, true)
      await saveEvent(page)
    })

    await step('Expect all-day event on month grid', async () => {
      await waitForEventOnGrid(page, title)
      await openEventByTitle(page, title)
      const dates = page.getByTestId('calendar-event-dates')
      if (await dates.isVisible().catch(() => false)) {
        await clickReady(dates)
      }
      await expect(page.getByTestId('calendar-event-allday')).toBeChecked({
        timeout: T(15000),
      })
      await attachScreenshot(page, 'calendar-event-allday')
    })
  })

  test('deletes an event', async ({ page }) => {
    test.setTimeout(T(180000))
    const title = `e2e-del-${Date.now()}`

    await gotoLoggedIn(page)
    await openCalendar(page)

    await openCreateEvent(page)
    await fillEventSubject(page, title)
    await saveEvent(page)
    await waitForEventOnGrid(page, title)

    await step('Delete event', async () => {
      await openEventByTitle(page, title)
      await clickReady(page.getByTestId('calendar-event-delete'))
      await confirmOkIfVisible(page, 3000)
      await expect(eventDialog(page)).toBeHidden({
        timeout: T(30000),
      })
    })

    await step('Event gone from grid', async () => {
      await expect(eventOnGrid(page, title)).toHaveCount(0, {
        timeout: T(30000),
      })
      await attachScreenshot(page, 'calendar-event-deleted')
    })
  })
})
