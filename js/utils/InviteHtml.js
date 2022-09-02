'use strict';

var
	Ajax = require('%PathToCoreWebclientModule%/js/Ajax.js'),
	Popups = require('%PathToCoreWebclientModule%/js/Popups.js'),

	EditInviteHtmlPopup = require('modules/%ModuleName%/js/popups/EditInviteHtmlPopup.js'),

	InviteHtmlUtils = {}
;

InviteHtmlUtils.needToSendMessage = function (oEventData)
{
	// TODO if update event rule is different
	return Array.isArray(oEventData.attendees) && oEventData.attendees.length > 0;
};

InviteHtmlUtils.prepareHtml = function (eventData, calendar, continueHandler, rejectHandler)
{
	const
		attendee = eventData.attendees.length === 1 ? eventData.attendees[0].email : '',
		dateFormat = eventData.allDay ? 'ddd, MMMM D, YYYY, h:mm' : 'ddd, MMMM D, YYYY',
		parameters = {
			CalendarId: calendar.id,
			Location: eventData.location,
			Description: eventData.description,
			Attendee: attendee,
			CalendarDisplayName: calendar.name(),
			StartDate: eventData.start.format(dateFormat)
		}
	;

	Ajax.send('CalendarMeetingsPlugin', 'GetMailMessageBodyForEvent', parameters, (response, request) => {
		if (response && response.Result) {
			Popups.showPopup(EditInviteHtmlPopup, [response.Result, continueHandler, rejectHandler]);
		} else {
			continueHandler();
		}
	});
};

module.exports = InviteHtmlUtils;
