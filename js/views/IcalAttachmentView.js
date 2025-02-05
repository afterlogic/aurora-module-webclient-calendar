'use strict';

var
	_ = require('underscore'),
	ko = require('knockout'),
	
	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js'),
	AddressUtils = require('%PathToCoreWebclientModule%/js/utils/Address.js'),
	
	App = require('%PathToCoreWebclientModule%/js/App.js'),
	
	CalendarCache = require('modules/%ModuleName%/js/Cache.js'),
	CIcalModel = require('modules/%ModuleName%/js/models/CIcalModel.js'),

	InformatikSettings = require('modules/InformatikProjects/js/Settings.js')
;

function CIcalAttachmentView()
{
	this.ical = ko.observable(null);
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
	var
		sAttendee = null,
		oIcal = CalendarCache.getIcal(oFoundRawIcal.File),
		aAttendeeList = Types.pArray(oFoundRawIcal.AttendeeList),
		centralAccountEmail = AddressUtils.getEmailParts(InformatikSettings.SenderForExternalRecipients),
		currentAccountEmail = AddressUtils.getEmailParts(App.currentAccountEmail())
	;

	// checking if there is a current account in attendee list or Informatik specific central account
	sAttendee = aAttendeeList.find(attendee => AddressUtils.getEmailParts(attendee).email === currentAccountEmail.email)
				|| aAttendeeList.find(attendee => AddressUtils.getEmailParts(attendee).email === centralAccountEmail.email);

	// if attendee isn't found, then try to find any user's account in attendee list
	if (!sAttendee) {
		sAttendee = App.getAttendee ? App.getAttendee(oMessageProps.aToEmails) : App.currentAccountEmail();
	}

	if (!oIcal)
	{
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
