'use strict';

var
	_ = require('underscore'),
	ko = require('knockout'),
	
	TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),
	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js'),
	
	Popups = require('%PathToCoreWebclientModule%/js/Popups.js'),
	CAbstractPopup = require('%PathToCoreWebclientModule%/js/popups/CAbstractPopup.js'),
	AlertPopup = require('%PathToCoreWebclientModule%/js/popups/AlertPopup.js'),
	Settings = require('modules/%ModuleName%/js/Settings.js'),
	App = require('%PathToCoreWebclientModule%/js/App.js'),
	Ajax = require('modules/%ModuleName%/js/Ajax.js'),
	Api = require('%PathToCoreWebclientModule%/js/Api.js')
;

/**
 * @constructor
 */
function CEditCalendarPopup()
{
	CAbstractPopup.call(this);
	
	this.fCallback = null;
	
	this.calendarId = ko.observable(null);
	this.calendarName = ko.observable('');
	this.calendarDescription = ko.observable('');
	
	this.calendarNameFocus = ko.observable(false);
	this.calendarDescriptionFocus = ko.observable(false);
	
	this.colors = ko.observableArray([]);
	this.selectedColor = ko.observable(this.colors()[0]);
	
	this.popupHeading = ko.observable('');

	this.allowSubscribedCalendars = ko.observable(Settings.AllowSubscribedCalendars);
	this.calendarSubscribed = ko.observable(false);
	this.calendarSource = ko.observable('');
	this.calendarSourceFocus = ko.observable(false);
}

_.extendOwn(CEditCalendarPopup.prototype, CAbstractPopup.prototype);

CEditCalendarPopup.prototype.PopupTemplate = '%ModuleName%_EditCalendarPopup';

/**
 * @param {Function} fCallback
 * @param {Array} aColors
 * @param {Object} oCalendar
 */
CEditCalendarPopup.prototype.onOpen = function (fCallback, aColors, oCalendar)
{
	this.fCallback = fCallback;
	
	if (Types.isNonEmptyArray(aColors))
	{
		this.colors(aColors);
		this.selectedColor(aColors[0]);
	}
	
	if (oCalendar)
	{
		this.popupHeading(oCalendar.name() ? TextUtils.i18n('%MODULENAME%/HEADING_EDIT_CALENDAR') : TextUtils.i18n('%MODULENAME%/HEADING_CREATE_CALENDAR'));
		this.calendarName(oCalendar.name ? oCalendar.name() : '');
		this.calendarDescription(oCalendar.description ? oCalendar.description() : '');
		this.selectedColor(oCalendar.color ? oCalendar.color() : '');
		this.calendarId(oCalendar.id ? oCalendar.id : null);
		this.calendarSubscribed(oCalendar.subscribed ? oCalendar.subscribed() : false);
		this.calendarSource(oCalendar.source ? oCalendar.source() : '');
	}
	else
	{
		this.popupHeading(TextUtils.i18n('%MODULENAME%/HEADING_CREATE_CALENDAR'));
	}
};

CEditCalendarPopup.prototype.onClose = function ()
{
	this.calendarName('');
	this.calendarDescription('');
	this.selectedColor(this.colors[0]);
	this.calendarId(null);
	this.calendarSubscribed(false);
	this.calendarSource('');
};

CEditCalendarPopup.prototype.save = function ()
{
	if (this.calendarName() === '')
	{
		Popups.showPopup(AlertPopup, [TextUtils.i18n('%MODULENAME%/ERROR_CALENDAR_NAME_BLANK')]);
	}
	else
	{
		if (App.isPublic()) {
			this.closePopup();
		} else {
			if (this.calendarId() !== null) { // update calendar
				if (!this.calendarSubscribed()) {
					Ajax.send('UpdateCalendar', {
							'Name': this.calendarName(),
							'Description': this.calendarDescription(),
							'Color': this.selectedColor(),
							'Id': this.calendarId()
						}, this.onUpdateCalendarResponse, this
					);
				} else {
					Ajax.send('UpdateSubscribedCalendar', {
							'Name': this.calendarName(),
							'Source': this.calendarSource(),
							'Color': this.selectedColor(),
							'Id': this.calendarId()
						}, this.onUpdateCalendarResponse, this
					);
				}
			} else { // create calendar
				if (this.calendarSubscribed()) {
					Ajax.send('CreateSubscribedCalendar', {
							'Name': this.calendarName(),
							'Source': this.calendarSource(),
							'Color': this.selectedColor()
						}, this.onCreateCalendarResponse, this
					);
				} else {
					Ajax.send('CreateCalendar', {
							'Name': this.calendarName(),
							'Description': this.calendarDescription(),
							'Color': this.selectedColor()
						}, this.onCreateCalendarResponse, this
					);
				}
			}
		}
	}
};

/**
* @param {Object} oResponse
* @param {Object} oRequest
*/
CEditCalendarPopup.prototype.onCreateCalendarResponse = function (oResponse, oRequest)
{
	if (oResponse.Result)
	{
		if (_.isFunction(this.fCallback)) {
			this.fCallback(oResponse, oRequest);
			this.closePopup();
		}
	} else {
		Api.showErrorByCode(oResponse);
	}
};

/**
 * @param {Object} oResponse
 * @param {Object} oRequest
 */
 CEditCalendarPopup.prototype.onUpdateCalendarResponse = function (oResponse, oRequest)
 {
	 if (oResponse.Result)
	 {
		if (_.isFunction(this.fCallback)) {
			this.fCallback(oResponse, oRequest);
			this.closePopup();
		}
	 } else {
		 Api.showErrorByCode(oResponse);
	 }
 };

module.exports = new CEditCalendarPopup();
