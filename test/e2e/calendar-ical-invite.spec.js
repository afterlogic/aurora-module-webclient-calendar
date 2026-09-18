const path = require('path')
const { sharedHelper, moduleHelper } = require(path.join(
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
const { clickReady } = sharedHelper('ready')
const {
  openCalendar,
  openCreateEvent,
  fillEventSubject,
  addEventGuest,
  saveEvent,
  waitForEventOnGrid,
} = require('./helpers/calendar')
const {
  waitForInboxList,
  waitForMessageInFolder,
  clickMessageListItem,
  FOLDER_TYPES,
} = moduleHelper('MailWebclient', 'mail')

function icalAppointmentBlock(page) {
  return page
    .locator(
      '.separate_layout_mode.separate_message_opened [data-test-id="mail-ical-appointment"], .separate_layout_mode.separate_message_opened .appointment'
    )
    .or(
      page.locator(
        '.message_viewer [data-test-id="mail-ical-appointment"], .message_viewer .appointment, [data-test-id="mail-message-view"] [data-test-id="mail-ical-appointment"]'
      )
    )
    .first()
}

function icalAcceptButton(page) {
  const block = icalAppointmentBlock(page)
  return block
    .getByTestId('mail-ical-accept')
    .or(block.locator('.buttons .button').filter({ hasText: /accept/i }).first())
    .first()
}

test.describe('Desktop calendar iCal invite from mail', () => {
  test.skip(!hasCredentials(), 'Set E2E_LOGIN_PRIMARY in .env.e2e')
  test.skip(
    !hasSecondaryCredentials(),
    'Set E2E_LOGIN_SECONDARY and E2E_PASSWORD_SECONDARY in .env.e2e'
  )

  test('accepts calendar invitation from Inbox message', async ({
    page,
    browser,
    baseURL,
  }) => {
    test.setTimeout(T(360000))
    const title = `e2e-invite-${Date.now()}`
    const guestEmail = getSecondaryCredentials().login

    await gotoLoggedIn(page)

    const calTab = page.getByTestId('nav-calendar')
    test.skip(
      !(await calTab.isVisible().catch(() => false)),
      'Calendar module/tab is not available on this stand'
    )

    await openCalendar(page)

    await step('Create event with SECONDARY as guest (sends invite)', async () => {
      await openCreateEvent(page)
      await fillEventSubject(page, title)
      await addEventGuest(page, guestEmail)
      await saveEvent(page)
      await waitForEventOnGrid(page, title)
      console.log(`  → Event created with invite to ${guestEmail}`)
      await attachScreenshot(page, 'ical-invite-01-created')
    })

    const invitee = await openLoggedInPage(browser, getSecondaryCredentials(), {
      baseURL,
    })
    try {
      await step('Open invitation in invitee Mail Inbox', async () => {
        await waitForInboxList(invitee.page)
        const item = await waitForMessageInFolder(
          invitee.page,
          FOLDER_TYPES.INBOX,
          title,
          { timeout: 180000 }
        )
        await clickMessageListItem(invitee.page, item, { waitForView: false })
        await expect(icalAppointmentBlock(invitee.page)).toBeVisible({
          timeout: T(120000),
        })
        await attachScreenshot(invitee.page, 'ical-invite-02-mail-open')
      })

      await step('Accept invitation in message', async () => {
        const block = icalAppointmentBlock(invitee.page)
        await expect(block).toBeVisible({ timeout: T(30000) })
        const accept = icalAcceptButton(invitee.page)
        test.skip(
          !(await accept.isVisible().catch(() => false)),
          'No accept/decline buttons on this invitation (old version or wrong message type)'
        )
        await clickReady(accept)
        await expect(accept).toHaveClass(/selected_button/, {
          timeout: T(60000),
        })
        console.log('  → Invitation accepted')
        await attachScreenshot(invitee.page, 'ical-invite-03-accepted')
      })
    } finally {
      await invitee.context.close()
    }
  })
})
