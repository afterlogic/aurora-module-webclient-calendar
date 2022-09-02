'use strict';

var
	Ajax = require('%PathToCoreWebclientModule%/js/Ajax.js'),
	App = require('%PathToCoreWebclientModule%/js/App.js'),
	ModulesManager = require('%PathToCoreWebclientModule%/js/ModulesManager.js'),
	Popups = require('%PathToCoreWebclientModule%/js/Popups.js'),

	EditInviteHtmlPopup = require('modules/%ModuleName%/js/popups/EditInviteHtmlPopup.js'),

	InviteHtmlUtils = {}
;

InviteHtmlUtils.needToSendMessage = function (oEventData, attendeesCountBeforeChanges)
{
	return Array.isArray(oEventData.attendees) && oEventData.attendees.length > 0 && attendeesCountBeforeChanges === 0;
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
			const
				AccountList = ModulesManager.run('MailWebclient', 'getAccountList'),
				defaultAccount = AccountList && AccountList.collection().find(account => account.email() === App.getUserPublicId()),
				signature = defaultAccount && defaultAccount.useSignature() && defaultAccount.signature() || '',
				inviteHtml = `${response.Result}<br /><br /><br /><div>${signature}</div>`
			;
			Popups.showPopup(EditInviteHtmlPopup, [inviteHtml, continueHandler, rejectHandler]);
		} else {
			continueHandler();
		}
	});
};

module.exports = InviteHtmlUtils;
