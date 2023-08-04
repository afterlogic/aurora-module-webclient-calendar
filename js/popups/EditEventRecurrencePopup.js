'use strict';

var
	_ = require('underscore'),
	ko = require('knockout'),
	
	TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),
	
	CAbstractPopup = require('%PathToCoreWebclientModule%/js/popups/CAbstractPopup.js')
;

/**
 * @constructor
 */
function CEditEventRecurrencePopup()
{
	CAbstractPopup.call(this);
	
	this.fCallback = null;
	this.confirmDesc = ko.observable(TextUtils.i18n('%MODULENAME%/CONFIRM_EDIT_RECURRENCE'));
	this.onlyThisInstanceButtonText = TextUtils.i18n('%MODULENAME%/ACTION_CHANGE_ONLY_THIS_INSTANCE');
	this.allEventsButtonText = ko.observable(TextUtils.i18n('%MODULENAME%/ACTION_CHANGE_ALL_EVENTS'));
	this.cancelButtonText = TextUtils.i18n('COREWEBCLIENT/ACTION_CANCEL');
}

_.extendOwn(CEditEventRecurrencePopup.prototype, CAbstractPopup.prototype);

CEditEventRecurrencePopup.prototype.PopupTemplate = '%ModuleName%_EditEventRecurrencePopup';

/**
 * @param {Function} fCallback
 */
CEditEventRecurrencePopup.prototype.onOpen = function (fCallback, sDataType)
{
	if (_.isFunction(fCallback))
	{
		this.fCallback = fCallback;
	}

	if (sDataType === 'VTODO') {
		this.confirmDesc(TextUtils.i18n('%MODULENAME%/CONFIRM_EDIT_RECURRENCE_TASKS'));
		this.allEventsButtonText(TextUtils.i18n('%MODULENAME%/ACTION_CHANGE_ALL_TASKS'));
	} else {
		this.confirmDesc(TextUtils.i18n('%MODULENAME%/CONFIRM_EDIT_RECURRENCE'));
		this.allEventsButtonText(TextUtils.i18n('%MODULENAME%/ACTION_CHANGE_ALL_EVENTS'));
	}
};

CEditEventRecurrencePopup.prototype.onlyThisInstanceButtonClick = function ()
{
	if (this.fCallback)
	{
		this.fCallback(Enums.CalendarEditRecurrenceEvent.OnlyThisInstance);
	}

	this.closePopup();
};

CEditEventRecurrencePopup.prototype.allEventsButtonClick = function ()
{
	if (this.fCallback)
	{
		this.fCallback(Enums.CalendarEditRecurrenceEvent.AllEvents);
	}

	this.closePopup();
};

CEditEventRecurrencePopup.prototype.cancelPopup = function ()
{
	if (this.fCallback)
	{
		this.fCallback(Enums.CalendarEditRecurrenceEvent.None);
	}

	this.closePopup();
};

module.exports = new CEditEventRecurrencePopup();
