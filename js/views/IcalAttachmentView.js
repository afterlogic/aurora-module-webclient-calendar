'use strict';

var
	_ = require('underscore'),
	ko = require('knockout'),
	
	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js'),
	AddressUtils = require('%PathToCoreWebclientModule%/js/utils/Address.js'),
	
	App = require('%PathToCoreWebclientModule%/js/App.js'),
	
	CalendarCache = require('modules/%ModuleName%/js/Cache.js'),
	CIcalModel = require('modules/%ModuleName%/js/models/CIcalModel.js'),

	InformatikSettings = require('modules/InformatikProjects/js/Settings.js'),

	TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),
	CalendarUtils = require('modules/%ModuleName%/js/utils/Calendar.js'),
	Settings = require('modules/%ModuleName%/js/Settings.js')
;

function CIcalAttachmentView()
{
	this.ical = ko.observable(null);

	this.bAllowDefaultReminders = Settings.AllowDefaultReminders;

	this.defaultReminders = ko.observableArray(_.sortBy(Settings.DefaultReminders.map((iMinutes) => {
		return {
			value: iMinutes,
			label: TextUtils.i18n('%MODULENAME%/INFO_REMINDER', {'REMINDERS': CalendarUtils.getReminderFiendlyTitle(iMinutes)}),
			checked: ko.observable(true)
		};
	}), 'value'));

	const self = this;
	this.defaultReminders().forEach(function(reminder) {
		if (ko.isObservable(reminder.checked)) {
			reminder.checked.subscribe(function(newValue) {
				if (self.ical() && self.ical().defaultReminders) {
					self.ical().defaultReminders(
						self.defaultReminders().filter(item => item.checked()).map((item) => {
							return item.value;
						})
					);
				}
			});
		}
	}, this);
}

CIcalAttachmentView.prototype.ViewTemplate = '%ModuleName%_IcalAttachmentView';

/**
 * Receives properties of the message that is displaying in the message pane. 
 * It is called every time the message is changing in the message pane.
 * Receives null if there is no message in the pane.
 * 
 * @param {Object|null} oMessageProps Information about message in message pane.
 * @param {String} oMessageProps.sFromEmail Message sender email.
 * @param {Array} oMessageProps.aToEmails
 * @param {Object} oMessageProps.oIcal
 */
CIcalAttachmentView.prototype.doAfterPopulatingMessage = function (oMessageProps)
{
	var
		aExtend = (oMessageProps && Types.isNonEmptyArray(oMessageProps.aExtend)) ? oMessageProps.aExtend : [],
		oFoundRawIcal = _.find(aExtend, function (oRawIcal) {
			return oRawIcal['@Object'] === 'Object/Aurora\\Modules\\Calendar\\Classes\\Ics';
		}),
		currentIcalFile = this.ical() && this.ical().file()
	;
	if (!oFoundRawIcal)
	{
		this.ical(null);
		return;
	}
	if (currentIcalFile === oFoundRawIcal.File) {
		return;
	}

	var oIcal = CalendarCache.getIcal(oFoundRawIcal.File);
	
	if (!oIcal)
	{
		var
			sAttendee = null,
			aAttendeeList = Types.pArray(oFoundRawIcal.AttendeeList),
			centralAccountEmail = AddressUtils.getEmailParts(InformatikSettings.SenderForExternalRecipients),
			currentAccountEmail = AddressUtils.getEmailParts(App.currentAccountEmail())
		;
	
		// checking if there is a current account in attendee list or Informatik specific central account
		sAttendee = aAttendeeList.find(attendee => AddressUtils.getEmailParts(attendee).email === currentAccountEmail.email)
					|| aAttendeeList.find(attendee => AddressUtils.getEmailParts(attendee).email === centralAccountEmail.email);
	
		// if attendee isn't found, then try to find any user's account in attendee list
		// added workaround to let user accept the invitation even if he is not in the attendee list
		if (!sAttendee && App.getAttendee) {
			sAttendee = App.getAttendee(oMessageProps.aToEmails)
		}
		if (!sAttendee) {
			sAttendee = App.currentAccountEmail();
		}
		oIcal = new CIcalModel(oFoundRawIcal, sAttendee);

		// animation of buttons turns on with delay
		// so it does not trigger when placing initial values
		oIcal.animation(false);
		_.defer(_.bind(function () {
			if (oIcal !== null)
			{
				oIcal.animation(true);
			}
		}, this));
	}

	oIcal.refreshIcsData(oMessageProps.sFromEmail);

	this.ical(oIcal);
};

module.exports = new CIcalAttachmentView();
