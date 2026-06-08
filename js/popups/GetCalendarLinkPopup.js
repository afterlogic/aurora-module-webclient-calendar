'use strict';

var
	_ = require('underscore'),
	ko = require('knockout'),

	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js'),
	UrlUtils = require('%PathToCoreWebclientModule%/js/utils/Url.js'),
	
	CAbstractPopup = require('%PathToCoreWebclientModule%/js/popups/CAbstractPopup.js'),
	Ajax = require('%PathToCoreWebclientModule%/js/Ajax.js')
;

/**
 * @constructor
 */
function CGetCalendarLinkPopup()
{
	CAbstractPopup.call(this);
	
	this.fCallback = null;

	this.calendarId = ko.observable(null);
	this.selectedColor = ko.observable('');
	this.calendarUrl = ko.observable('');
	this.exportUrl = ko.observable('');
	this.icsLink = ko.observable('');
	this.isPublic = ko.observable(false);
	this.pubUrl = ko.observable('');
	this.canShare = ko.observable(false);
}

_.extendOwn(CGetCalendarLinkPopup.prototype, CAbstractPopup.prototype);

CGetCalendarLinkPopup.prototype.PopupTemplate = '%ModuleName%_GetCalendarLinkPopup';

/**
 * @param {Function} fCallback
 * @param {Object} oCalendar
 */
CGetCalendarLinkPopup.prototype.onOpen = function (fCallback, oCalendar)
{
	if (_.isFunction(fCallback))
	{
		this.fCallback = fCallback;
	}
	if (oCalendar)
	{
		this.selectedColor(oCalendar.color());
		this.calendarId(oCalendar.id);
		this.calendarUrl(oCalendar.davUrl() + oCalendar.url());
		this.exportUrl(oCalendar.exportUrl());
		this.icsLink(oCalendar.davUrl() + oCalendar.url() + '?export');
		this.isPublic(oCalendar.isPublic());
		this.pubUrl(oCalendar.pubUrl());
		this.canShare(oCalendar.canShare());
	}
};


/**
 * @param {string|Object} mResult
 * @returns {string}
 */
CGetCalendarLinkPopup.prototype.parsePublicLinkResult = function (mResult)
{
	if (!mResult)
	{
		return '';
	}

	return UrlUtils.getAppPath() + '?calendar-pub=' + mResult;
};

/**
 * @param {boolean} bIsPublic
 */
CGetCalendarLinkPopup.prototype.updateCalendarPublic = function (bIsPublic)
{
	this.isPublic(bIsPublic);

	Ajax.send(
		'Calendar',
		'UpdateCalendarPublic',
		{
			Id: this.calendarId(),
			IsPublic: bIsPublic
		},
		this.onUpdateCalendarPublicResponse,
		this
	);
};

/**
 * @param {Object} oResponse
 * @param {Object} oRequest
 */
CGetCalendarLinkPopup.prototype.onUpdateCalendarPublicResponse = function (oResponse, oRequest)
{
	if (oResponse.Result !== false)
	{
		var
			oParameters = oRequest.Parameters,
			bIsPublic = !!oParameters.IsPublic,
			sPubUrl = bIsPublic ? this.parsePublicLinkResult(oResponse.Result) : ''
		;

		this.isPublic(bIsPublic);
		this.pubUrl(sPubUrl);

		if (this.fCallback)
		{
			this.fCallback(this.calendarId(), bIsPublic, sPubUrl);
		}
	}
};

CGetCalendarLinkPopup.prototype.cancelPopup = function ()
{
	this.closePopup();
};

module.exports = new CGetCalendarLinkPopup();