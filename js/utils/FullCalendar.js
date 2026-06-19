'use strict';

const CalendarUtils = require('modules/%ModuleName%/js/utils/Calendar.js')

const moment = require('moment')

let currentDate = new Date();

module.exports = {
	recreateIfDateChanged(calendarGrid, recreateFullCalendar) {
		const nowDate = new Date();
		const isDateChanged = currentDate.getFullYear() !== nowDate.getFullYear()
				|| currentDate.getMonth() !== nowDate.getMonth()
				|| currentDate.getDate() !== nowDate.getDate();
		if (isDateChanged) {
			currentDate = nowDate;
			const todayDate = calendarGrid.fullCalendar('getDate').toDate();
			const viewName = calendarGrid.fullCalendar('getView').name;
			recreateFullCalendar(viewName);
			calendarGrid.fullCalendar('gotoDate', todayDate);
		}
	},

	setTimeline() {
		// find timeline
		const parentDiv = $('.fc-slats:visible').parent();
		let timeline = parentDiv.children('.timeline');

		// if timeline isn't there, add it
		if (timeline.length === 0) {
			timeline = $('<hr>').addClass('timeline');
			parentDiv.prepend(timeline);
		}

		timeline.css('left', $('td .fc-axis').width() + 10);
		timeline.show();

		const currentTimezone = CalendarUtils.getCalendarTimeZone();

		const now = moment().tz(currentTimezone);
		const curSeconds = (now.hours() * 60 * 60) + (now.minutes() * 60) + now.seconds();
		const percentOfDay = curSeconds / 86400;
		const topLoc = Math.floor(parentDiv.height() * percentOfDay); // 24 * 60 * 60 = 86400, % of seconds in a day

		timeline.css('top', `${topLoc}px`);
	}
};
