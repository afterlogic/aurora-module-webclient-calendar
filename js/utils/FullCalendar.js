'use strict';

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

		const now = new Date();
		const curSeconds = (now.getHours() * 60 * 60) + (now.getMinutes() * 60) + now.getSeconds();
		const percentOfDay = curSeconds / 86400; //24 * 60 * 60 = 86400, % of seconds in a day
		const topLoc = Math.floor(parentDiv.height() * percentOfDay);

		timeline.css('top', `${topLoc}px`);
	}
};
