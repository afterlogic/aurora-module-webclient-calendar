'use strict';

var Types = require('%PathToCoreWebclientModule%/js/utils/Types.js');

module.exports = {
	ServerModuleName: 'Calendar',
	HashModuleName: 'calendar',
	
	AllowAppointments: true,
	AllowShare: true,
	DefaultTab: '3', // 1 - day, 2 - week, 3 - month
	HighlightWorkingDays: true,
	HighlightWorkingHours: true,
	PublicCalendarId: '',
	WeekStartsOn: '0', // 0 - sunday
	WorkdayEnds: '18',
	WorkdayStarts: '9',
	
	init: function (oAppDataSection) {
		if (oAppDataSection)
		{
			this.AllowAppointments = !!oAppDataSection.AllowAppointments;
			this.AllowShare = !!oAppDataSection.AllowShare;
			this.DefaultTab = Types.pString(oAppDataSection.DefaultTab); // 1 - day, 2 - week, 3 - month
			this.HighlightWorkingDays = !!oAppDataSection.HighlightWorkingDays;
			this.HighlightWorkingHours = !!oAppDataSection.HighlightWorkingHours;
			this.PublicCalendarId = Types.pString(oAppDataSection.PublicCalendarId);
			this.WeekStartsOn = Types.pString(oAppDataSection.WeekStartsOn); // 0 - sunday
			this.WorkdayEnds = Types.pString(oAppDataSection.WorkdayEnds);
			this.WorkdayStarts = Types.pString(oAppDataSection.WorkdayStarts);
		}
	},
	
	update: function (bHighlightWorkingDays, bHighlightWorkingHours, iWorkDayStarts, iWorkDayEnds, iWeekStartsOn, iDefaultTab) {
		this.DefaultTab = iDefaultTab.toString();
		this.HighlightWorkingDays = bHighlightWorkingDays;
		this.HighlightWorkingHours = bHighlightWorkingHours;
		this.WeekStartsOn = iWeekStartsOn;
		this.WorkdayEnds = iWorkDayEnds.toString();
		this.WorkdayStarts = iWorkDayStarts.toString();
	}
};
