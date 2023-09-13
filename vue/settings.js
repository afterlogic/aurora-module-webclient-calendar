import _ from 'lodash'

import typesUtils from 'src/utils/types'

class CalendarSettings {
  constructor (appData) {
    const calendarData = typesUtils.pObject(appData.Calendar)
    if (!_.isEmpty(calendarData)) {
      this.allowTasks = typesUtils.pBool(calendarData.AllowTasks)
      this.defaultTab = typesUtils.pInt(calendarData.DefaultTab) // 1 - day, 2 - week, 3 - month
      this.highlightWorkingDays = typesUtils.pBool(calendarData.HighlightWorkingDays)
      this.highlightWorkingHours = typesUtils.pBool(calendarData.HighlightWorkingHours)
      this.showWeekNumbers = typesUtils.pBool(calendarData.ShowWeekNumbers)
      this.publicCalendarId = typesUtils.pString(calendarData.PublicCalendarId)
      this.weekStartsOn = typesUtils.pInt(calendarData.WeekStartsOn) // 0 - sunday
      this.workdayEnds = typesUtils.pInt(calendarData.WorkdayEnds)
      this.workdayStarts = typesUtils.pInt(calendarData.WorkdayStarts)
    }
  }

  saveCalendarSettings ({ highlightWorkingDays, highlightWorkingHours, workdayStarts, workdayEnds, weekStartsOn, defaultTab, showWeekNumbers }) {
    this.defaultTab = defaultTab
    this.highlightWorkingDays = highlightWorkingDays
    this.highlightWorkingHours = highlightWorkingHours
    this.showWeekNumbers = showWeekNumbers
    this.weekStartsOn = weekStartsOn
    this.workdayEnds = workdayEnds
    this.workdayStarts = workdayStarts
  }
}

let settings = null

export default {
  init (appData) {
    settings = new CalendarSettings(appData)
  },
  saveCalendarSettings (data) {
    settings.saveCalendarSettings(data)
  },
  getCalendarSettings () {
    return {
      highlightWorkingDays: settings.highlightWorkingDays,
      highlightWorkingHours: settings.highlightWorkingHours,
      showWeekNumbers: settings.showWeekNumbers,
      workdayStarts: settings.workdayStarts,
      workdayEnds: settings.workdayEnds,
      weekStartsOn: settings.weekStartsOn,
      defaultTab: settings.defaultTab
    }
  },
}
