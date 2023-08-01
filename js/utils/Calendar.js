'use strict';

var
	_ = require('underscore'),
	$ = require('jquery'),
	moment = require('moment'),

	CalendarUtils = require('%PathToCoreWebclientModule%/js/utils/Calendar.js'),
	TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),

	Settings = require('modules/%ModuleName%/js/Settings.js')
;

/**
 * Generates a list of time to display in calendar settings.
 * 
 * @param {string} sLabelFormat
 * @param {string} sValueFormat
 * @returns {Array}
 */
CalendarUtils.getTimeListStepHour = function (sLabelFormat, sValueFormat)
{
	var 
		aTimeList = [
			'01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00',
			'11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
			'21:00', '22:00', '23:00', '00:00'
		],
		sLabelFormat = sLabelFormat || 'HH:mm'
		sValueFormat = sValueFormat || 'H'
	;
	
	return _.map(aTimeList, function (sTime) {
		var
			oMoment = moment(sTime, 'HH:mm'),
			sText = oMoment.format(sLabelFormat),
			sValue = oMoment.format(sValueFormat)
		;
		if (sTime === '00:00')
		{
			sValue = '24';
		}
		return {text: sText, value: sValue};
	});
};

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
