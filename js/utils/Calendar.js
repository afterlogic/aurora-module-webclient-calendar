'use strict';

var
	_ = require('underscore'),
	$ = require('jquery'),

	CalendarUtils = require('%PathToCoreWebclientModule%/js/utils/Calendar.js'),
	TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),

	Settings = require('modules/%ModuleName%/js/Settings.js')
;

/**
 * @param {string} sSubject
 * @param {string} sDescription
 * 
 * @return {string}
 */
CalendarUtils.getTitleForEvent = function (sSubject, sDescription)
{
	if (Settings.AddDescriptionToTitle)
	{
		return $.trim((sSubject + ' ' + sDescription).replace(/[\n\r]/g, ' '));
	}
	else
	{
		var
			sTitle = sSubject ? $.trim(sSubject.replace(/[\n\r]/, ' ')) : '',
			iFirstSpacePos = sTitle.indexOf(' ', 180)
		;

		if (iFirstSpacePos >= 0)
		{
			sTitle = sTitle.substring(0, iFirstSpacePos) + '...';
		}

		if (sTitle.length > 200)
		{
			sTitle = sTitle.substring(0, 200) + '...';
		}

		return sTitle;
	}
};

/**
 * @param {integer} iMinutes
 * 
 * @return {string}
 */
CalendarUtils.getReminderFiendlyTitle = function (iMinutes)
{
	let sText = '' + iMinutes;

	if (iMinutes > 0 && iMinutes < 60)
	{
		sText = (TextUtils.i18n('COREWEBCLIENT/LABEL_MINUTES_PLURAL', {'COUNT': iMinutes}, null, iMinutes));
	}
	else if (iMinutes >= 60 && iMinutes < 1440)
	{
		sText = (TextUtils.i18n('%MODULENAME%/LABEL_HOURS_PLURAL', {'COUNT': iMinutes / 60}, null, iMinutes / 60));
	}
	else if (iMinutes >= 1440 && iMinutes < 10080)
	{
		sText = (TextUtils.i18n('%MODULENAME%/LABEL_DAYS_PLURAL', {'COUNT': iMinutes / 1440}, null, iMinutes / 1440));
	}
	else
	{
		sText = (TextUtils.i18n('%MODULENAME%/LABEL_WEEKS_PLURAL', {'COUNT': iMinutes / 10080}, null, iMinutes / 10080));
	}

	return sText;
};

module.exports = CalendarUtils;
