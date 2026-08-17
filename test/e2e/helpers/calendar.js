const path = require('path')
const { sharedHelper } = require(path.join(
  process.env.AURORA_E2E_ROOT,
  'helpers/paths'
))
const { expect } = require('@playwright/test')
const { step, attachScreenshot, fieldControl } = sharedHelper('login')
const { clickReady, clickNav, confirmOkIfVisible } = sharedHelper('ready')
const { T } = sharedHelper('timeouts')

async function openCalendar(page) {
  await step('Open Calendar', async () => {
    await clickNav(page, 'nav-calendar')
    await expect(page.getByTestId('calendar-screen')).toBeVisible({
      timeout: T(60000),
    })
    const grid = page.getByTestId('calendar-grid')
    await expect(grid).toBeVisible({ timeout: T(30000) })
    await expect(grid.locator('.fc, .fc-view, .fc-view-container').first()).toBeVisible({
      timeout: T(30000),
    })
  })
}

function eventOnGrid(page, title) {
  const exact = new RegExp(
    `^${String(title).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`
  )
  return page
    .locator('.fc-event, .fc-time-grid-event, .fc-day-grid-event')
    .filter({
      has: page.locator('.fc-title, .fc-event-title').filter({ hasText: exact }),
    })
    .first()
}

async function waitForEventOnGrid(page, title, timeout = T(30000)) {
  await expect(eventOnGrid(page, title)).toBeVisible({ timeout })
}

function eventDialog(page) {
  return page
    .locator('[data-test-id="calendar-event-dialog"], .popup.calendar_event')
    .first()
}

async function triggerKoClick(locator) {
  await locator.evaluate((el) => {
    const $ = window.jQuery || window.$
    if ($) {
      $(el).trigger('click')
      return
    }
    el.click()
  })
}

async function openCreateEvent(page) {
  const btn = page.getByTestId('calendar-create-event')
  await expect(btn).toBeVisible({ timeout: T(15000) })
  await expect(page.getByTestId('calendar-item').first()).toBeVisible({
    timeout: T(15000),
  })
  await triggerKoClick(btn)
  await expect(eventDialog(page)).toBeVisible({ timeout: T(15000) })
}

/**
 * Open the ⋮ menu for a sidebar calendar. Menus live in a sibling
 * `.dropdowns` list (one node per calendar), not inside the row.
 * Share is hidden for guest/subscribed calendars — wait for any
 * visible action (share, delete, or unsubscribe).
 */
async function openCalendarItemMenu(page, item) {
  const control = item.getByTestId('calendar-item-menu')
  await expect(control).toBeVisible({ timeout: T(15000) })
  // Real pointer click — `$(el).trigger('click')` has no originalEvent,
  // and the dropdown binding reads originalEvent.originalTarget.
  await clickReady(control)
  const share = page.getByTestId('calendar-menu-share').locator('visible=true')
  const unsubscribe = page
    .getByTestId('calendar-menu-unsubscribe')
    .locator('visible=true')
  const remove = page.getByTestId('calendar-menu-delete').locator('visible=true')
  await expect(share.or(unsubscribe).or(remove).first()).toBeVisible({
    timeout: T(15000),
  })
  return share
}

function calendarShareDialog(page) {
  return page.getByTestId('calendar-share-dialog')
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Add a guest in the share popup (Inputosaurus / team autocomplete).
 * Prefer picking a suggestion; Enter alone can leave KO out of sync and
 * Save will not call closePopup() when isValidShares() fails.
 */
async function addCalendarShareGuest(page, email) {
  const dialog = calendarShareDialog(page)
  const guests = dialog.getByRole('textbox').first()
  const emailRe = new RegExp(escapeRegExp(email), 'i')

  await expect(guests).toBeVisible({ timeout: T(15000) })
  await guests.click()
  await guests.fill(email)

  const suggestion = page
    .locator('.ui-autocomplete .ui-menu-item')
    .filter({ hasText: emailRe })
    .first()
  const pickedSuggestion = await suggestion
    .waitFor({ state: 'visible', timeout: T(15000) })
    .then(() => true)
    .catch(() => false)

  if (pickedSuggestion) {
    await clickReady(suggestion)
  } else {
    await guests.press('Enter')
  }

  await expect(
    dialog.getByRole('listitem').filter({ hasText: emailRe }).first()
  ).toBeVisible({ timeout: T(15000) })

  // parseOnBlur — sync guests() before Save.
  await dialog.locator('.popup_heading').click()
}

async function saveCalendarShareDialog(page) {
  const dialog = calendarShareDialog(page)
  await clickReady(dialog.getByTestId('calendar-share-save'))

  try {
    await expect(dialog).toBeHidden({ timeout: T(30000) })
  } catch {
    const uiError = (
      await page
        .locator(
          '.report_panel.error:not(.hide) .text, .alert.popup:visible .text'
        )
        .first()
        .innerText()
        .catch(() => '')
    ).trim()
    throw new Error(
      `Calendar share dialog did not close after Save.${
        uiError ? ` UI: ${uiError}` : ''
      }`
    )
  }
}

async function fillEventSubject(page, title) {
  const subject = page.getByTestId('calendar-event-subject')
  await expect(subject).toBeVisible({ timeout: T(15000) })
  await subject.click()
  await subject.fill('')
  await subject.pressSequentially(String(title), { delay: 15 })
  await subject.evaluate((el, t) => {
    const ko = window.ko
    const model = ko && ko.dataFor(el)
    if (model && typeof model.subject === 'function') {
      model.subject(t)
    }
  }, title)
}

async function saveEvent(page) {
  const mask = page.locator(
    '.popup.calendar_event .mask.clear, [data-test-id="calendar-event-dialog"] .mask.clear'
  )
  if (await mask.first().isVisible().catch(() => false)) {
    await clickReady(mask.first())
  }
  await clickReady(page.getByTestId('calendar-event-save'))
  await expect(eventDialog(page)).toBeHidden({ timeout: T(30000) })
}

async function openEventByTitle(page, title) {
  const event = eventOnGrid(page, title)
  await expect(event).toBeVisible({ timeout: T(15000) })
  await triggerKoClick(event)
  await expect(eventDialog(page)).toBeVisible({ timeout: T(15000) })
}

async function openEventDatesPanel(page) {
  const dates = page.getByTestId('calendar-event-dates')
  await expect(dates).toBeVisible({ timeout: T(15000) })
  await clickReady(dates)
  await expect(page.getByTestId('calendar-event-start-time')).toBeVisible({
    timeout: T(15000),
  })
}

async function getEventDatesSummary(page) {
  const dates = page.getByTestId('calendar-event-dates')
  await expect(dates).toBeVisible({ timeout: T(15000) })
  return (await dates.innerText()).replace(/\s+/g, ' ').trim()
}

function bumpHalfHour(value) {
  const match = String(value)
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?$/)
  if (!match) {
    return value === '15:30' ? '16:00' : '15:30'
  }
  let hours = Number(match[1])
  let minutes = Number(match[2])
  const mer = match[3]
  minutes += 30
  if (minutes >= 60) {
    minutes = 0
    hours += 1
  }
  const mm = String(minutes).padStart(2, '0')
  if (mer) {
    if (hours > 12) hours = 1
    if (hours < 1) hours = 12
    return `${hours}:${mm} ${mer.toUpperCase()}`
  }
  if (hours >= 24) hours = 0
  return `${String(hours).padStart(2, '0')}:${mm}`
}

async function closeEventDatesPanel(page) {
  const mask = eventDialog(page).locator('.mask.clear').first()
  if (await mask.isVisible().catch(() => false)) {
    await clickReady(mask)
  }
}

/**
 * Change start time via the customSelect list (typing leaves the dropdown
 * open; `.popup_heading` sits under `.dates_form` and cannot be clicked).
 */
async function changeEventStartTime(page) {
  await openEventDatesPanel(page)
  const start = page.getByTestId('calendar-event-start-time')
  await expect(start).toBeVisible({ timeout: T(15000) })
  const from = (await start.inputValue()).trim()
  const to = bumpHalfHour(from)
  await start.click()
  const option = eventDialog(page)
    .locator('.dates_form .dropdown_content')
    .getByText(to, { exact: true })
    .first()
  await expect(option).toBeVisible({ timeout: T(10000) })
  await clickReady(option)
  await expect(start).toHaveValue(to, { timeout: T(5000) })
  await closeEventDatesPanel(page)
  return { from, to }
}

async function createCalendar(page, name) {
  await clickReady(page.getByTestId('calendar-create-calendar'))
  await expect(page.getByTestId('calendar-create-dialog')).toBeVisible({
    timeout: T(15000),
  })
  await page.getByTestId('calendar-create-name').fill(name)
  await clickReady(page.getByTestId('calendar-create-save'))
  await expect(page.getByTestId('calendar-create-dialog')).toBeHidden({
    timeout: T(30000),
  })
  const item = page.getByTestId('calendar-item').filter({ hasText: name }).first()
  await expect(item).toBeVisible({ timeout: T(30000) })
  return item
}

async function shareCalendarWithGuest(page, calendarName, email) {
  const item = page
    .getByTestId('calendar-item')
    .filter({ hasText: calendarName })
    .first()
  await expect(item).toBeVisible({ timeout: T(30000) })
  await openCalendarItemMenu(page, item)
  const share = page.getByTestId('calendar-menu-share').locator('visible=true')
  await expect(share).toBeVisible({ timeout: T(15000) })
  await clickReady(share)
  await expect(calendarShareDialog(page)).toBeVisible({ timeout: T(15000) })
  await addCalendarShareGuest(page, email)
  await saveCalendarShareDialog(page)
}

async function deleteCalendarByName(page, calendarName) {
  const item = page
    .getByTestId('calendar-item')
    .filter({ hasText: calendarName })
    .first()
  if ((await item.count()) === 0) {
    return
  }
  await openCalendarItemMenu(page, item)
  const remove = page
    .getByTestId('calendar-menu-delete')
    .locator('visible=true')
    .first()
  const unsubscribe = page
    .getByTestId('calendar-menu-unsubscribe')
    .locator('visible=true')
    .first()
  if (await remove.isVisible().catch(() => false)) {
    await clickReady(remove)
  } else if (await unsubscribe.isVisible().catch(() => false)) {
    await clickReady(unsubscribe)
  } else {
    return
  }
  await confirmOkIfVisible(page, 10000)
  await expect(item).toHaveCount(0, { timeout: T(30000) })
}

async function setEventAllDay(page, value = true) {
  const dates = page.getByTestId('calendar-event-dates')
  if (await dates.isVisible().catch(() => false)) {
    await clickReady(dates)
  }
  const allday = page.getByTestId('calendar-event-allday')
  await expect(allday).toBeVisible({ timeout: T(15000) })
  const checked = await allday.isChecked()
  if (checked === value) {
    return
  }
  const textLabel = page.locator('label[for="allday"]')
  if (await textLabel.isVisible().catch(() => false)) {
    await clickReady(textLabel)
  } else {
    await clickReady(
      page.locator('label.custom_checkbox').filter({ has: allday })
    )
  }
  await allday.evaluate((el, v) => {
    const ko = window.ko
    const model = ko && ko.dataFor(el)
    if (model && typeof model.allDay === 'function') {
      model.allDay(v)
    }
  }, value)
  if (value) {
    await expect(allday).toBeChecked({ timeout: T(5000) })
  } else {
    await expect(allday).not.toBeChecked({ timeout: T(5000) })
  }
}

module.exports = {
  openCalendar,
  eventOnGrid,
  eventDialog,
  waitForEventOnGrid,
  triggerKoClick,
  openCalendarItemMenu,
  calendarShareDialog,
  addCalendarShareGuest,
  saveCalendarShareDialog,
  openCreateEvent,
  fillEventSubject,
  saveEvent,
  openEventByTitle,
  openEventDatesPanel,
  getEventDatesSummary,
  changeEventStartTime,
  createCalendar,
  shareCalendarWithGuest,
  deleteCalendarByName,
  setEventAllDay,
  clickReady,
  clickNav,
  confirmOkIfVisible,
  fieldControl,
  step,
  attachScreenshot,
  T,
}
