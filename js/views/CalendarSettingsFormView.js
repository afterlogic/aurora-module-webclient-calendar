'use strict';

var
	_ = require('underscore'),
	ko = require('knockout'),
	
	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js'),
	TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),
	
	App = require('%PathToCoreWebclientModule%/js/App.js'),
	UserSettings = require('%PathToCoreWebclientModule%/js/Settings.js'),
	ModulesManager = require('%PathToCoreWebclientModule%/js/ModulesManager.js'),
	CAbstractSettingsFormView = App.getUserRole() === Enums.UserRole.SuperAdmin ? ModulesManager.run('AdminPanelWebclient', 'getAbstractSettingsFormViewClass') : ModulesManager.run('SettingsWebclient', 'getAbstractSettingsFormViewClass'),
	
	CalendarUtils = require('modules/%ModuleName%/js/utils/Calendar.js'),
	
	CalendarCache = require('modules/%ModuleName%/js/Cache.js'),
	Settings = require('modules/%ModuleName%/js/Settings.js')
;

function GetClosestValue(aTimes, sValue)
{
	var
		oTime = _.find(aTimes, function (oTmpTime) {
			return oTmpTime.value === sValue;
		})
	;
	return (oTime || !aTimes[0]) ? sValue : aTimes[0].value;
}

/**
 * @constructor
 */
function CCalendarSettingsFormView()
{
	CAbstractSettingsFormView.call(this, Settings.ServerModuleName);

	this.availableTimes = ko.observableArray(CalendarUtils.getTimeListStepHour((UserSettings.timeFormat() !== Enums.TimeFormat.F24) ? 'hh:mm A' : 'HH:mm'));
	UserSettings.timeFormat.subscribe(function () {
		this.availableTimes(CalendarUtils.getTimeListStepHour((UserSettings.timeFormat() !== Enums.TimeFormat.F24) ? 'hh:mm A' : 'HH:mm'));
	}, this);

	/* Editable fields */
	this.showWeekends = ko.observable(Settings.HighlightWorkingDays);
	this.selectedWorkdayStarts = ko.observable(GetClosestValue(this.availableTimes(), Settings.WorkdayStarts));
	this.selectedWorkdayEnds = ko.observable(GetClosestValue(this.availableTimes(), Settings.WorkdayEnds));
	this.showWorkday = ko.observable(Settings.HighlightWorkingHours);
	this.weekStartsOn = ko.observable(Settings.WeekStartsOn);
	this.defaultTab = ko.observable(Settings.DefaultTab);
	this.defaultReminders = ko.observable(Settings.DefaultReminders);
	/*-- Editable fields */

	this.bAllowDefaultReminders = Settings.AllowDefaultReminders;

	const reminderOptions = _.union(Settings.DefaultReminders, Settings.ReminderValuesInMinutes).map((iMinutes) => {
		const bSelected = Settings.DefaultReminders.indexOf(iMinutes) >= 0;
		return {
			'value': iMinutes,
			'label': TextUtils.i18n('%MODULENAME%/INFO_REMINDER', {'REMINDERS': CalendarUtils.getReminderFiendlyTitle(iMinutes)}),
			'selected': ko.observable(bSelected)
		};
	});
	this.reminderOptions = ko.observableArray(reminderOptions);
	this.displayReminderSelector = ko.observable(false);

	this.selectedReminderOptions = ko.computed(function () {
		const selectedOptions = _.sortBy(this.reminderOptions().filter(option => option.selected()), 'value');
		this.defaultReminders(selectedOptions.map(option => option.value));
		this.displayReminderSelector(selectedOptions.length <= 4);

		return selectedOptions;
	}, this);
	
	this.selectedReminder = ko.observable(null);
	this.selectedReminder.subscribe(function (v) {
		const oFoundOption = this.reminderOptions().find((option)=> {
			return option.value === Types.pInt(v);
		});
		if (oFoundOption) {
			this.selectReminder(oFoundOption);
			this.selectedReminder('');
		}
	}, this);
}

_.extendOwn(CCalendarSettingsFormView.prototype, CAbstractSettingsFormView.prototype);

CCalendarSettingsFormView.prototype.ViewTemplate = '%ModuleName%_CalendarSettingsFormView';

CCalendarSettingsFormView.prototype.getCurrentValues = function()
{
	return [
		this.showWeekends(),
		this.selectedWorkdayStarts(),
		this.selectedWorkdayEnds(),
		this.showWorkday(),
		this.weekStartsOn(),
		this.defaultTab(),
		this.defaultReminders()
	];
};

CCalendarSettingsFormView.prototype.revertGlobalValues = function()
{
	this.showWeekends(Settings.HighlightWorkingDays);
	this.selectedWorkdayStarts(GetClosestValue(this.availableTimes(), Settings.WorkdayStarts));
	this.selectedWorkdayEnds(GetClosestValue(this.availableTimes(), Settings.WorkdayEnds));
	this.showWorkday(Settings.HighlightWorkingHours);
	this.weekStartsOn(Settings.WeekStartsOn);
	this.defaultTab(Settings.DefaultTab);
	this.defaultReminders(Settings.DefaultReminders);
};

CCalendarSettingsFormView.prototype.getParametersForSave = function ()
{
	return {
		'HighlightWorkingDays': this.showWeekends(),
		'HighlightWorkingHours': this.showWorkday(),
		'WorkdayStarts': Types.pInt(this.selectedWorkdayStarts()),
		'WorkdayEnds': Types.pInt(this.selectedWorkdayEnds()),
		'WeekStartsOn': Types.pInt(this.weekStartsOn()),
		'DefaultTab': Types.pInt(this.defaultTab()),
		'DefaultReminders': this.defaultReminders()
	};
};

/**
 * @param {Object} oParameters
 */
CCalendarSettingsFormView.prototype.applySavedValues = function (oParameters)
{
	CalendarCache.calendarSettingsChanged(true);

	Settings.update(
		oParameters.HighlightWorkingDays,
		oParameters.HighlightWorkingHours,
		oParameters.WorkdayStarts,
		oParameters.WorkdayEnds,
		oParameters.WeekStartsOn,
		oParameters.DefaultTab,
		oParameters.DefaultReminders
	);
};

CCalendarSettingsFormView.prototype.setAccessLevel = function (sEntityType, iEntityId)
{
	this.visible(sEntityType === '');
};

CCalendarSettingsFormView.prototype.selectReminder = function (oReminder) 
{
	oReminder.selected(true);
};

CCalendarSettingsFormView.prototype.removeReminder = function (oReminder) 
{
	oReminder.selected(false);
};

module.exports = new CCalendarSettingsFormView();
