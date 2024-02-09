'use strict'

var
	_ = require('underscore'),
	ko = require('knockout'),

	Types = require('%PathToCoreWebclientModule%/js/utils/Types.js'),

	Ajax = require('%PathToCoreWebclientModule%/js/Ajax.js'),
	Api = require('%PathToCoreWebclientModule%/js/Api.js'),
	Screens = require('%PathToCoreWebclientModule%/js/Screens.js'),
	TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),

	ModulesManager = require('%PathToCoreWebclientModule%/js/ModulesManager.js'),
	CAbstractSettingsFormView = ModulesManager.run('AdminPanelWebclient', 'getAbstractSettingsFormViewClass'),

	Settings = require('modules/%ModuleName%/js/Settings.js')
;

/**
* @constructor
*/
function AdminpanelUserSettingsView()
{
	CAbstractSettingsFormView.call(this, '%ModuleName%')
	this.sUpdateSettingsMethod = 'UpdateCalendar'
	this.sServerModule = Settings.ServerModuleName

	this.iUserId = 0
	this.mainCalendarId = null

	this.calendarName = ko.observable('')
	this.calendarDescription = ko.observable('')
	this.calendarColor = ko.observable('')
	this.colors = Settings.CalendarColors

	this.isLoading = ko.observable(false)
}

_.extendOwn(AdminpanelUserSettingsView.prototype, CAbstractSettingsFormView.prototype)

AdminpanelUserSettingsView.prototype.ViewTemplate = '%ModuleName%_AdminpanelUserSettingsView'

/**
 * Sets access level for the view via entity type and entity identifier.
 * This view is visible only for User entity type.
 *
 * @param {string} sEntityType Current entity type.
 * @param {number} iEntityId Identifier of current entity.
 */
AdminpanelUserSettingsView.prototype.setAccessLevel = function (sEntityType, iEntityId)
{
	this.visible(sEntityType === 'User')
	this.iUserId = this.visible() ? iEntityId : 0
}

AdminpanelUserSettingsView.prototype.onRouteChild = function (aParams)
{
	this.requestPerEntitytSettings()
}

AdminpanelUserSettingsView.prototype.requestPerEntitytSettings = function ()
{
	if (Types.isPositiveNumber(this.iUserId)) {
		const params = {
			'UserId': this.iUserId,
		}

		this.isLoading(true)
		
		Ajax.send(Settings.ServerModuleName, 'GetCalendars', params, function (oResponse) {
			this.isLoading(false)
			
			if (oResponse.Result && oResponse.Result.Calendars) {
				const mainCalendar = _.find(oResponse.Result.Calendars, calendar => calendar.IsMain)
				
				if (mainCalendar) {
					this.mainCalendarId = mainCalendar.Id
					this.calendarName(mainCalendar.Name)
					this.calendarDescription(mainCalendar.Description)
					this.calendarColor(mainCalendar.Color)
	
					this.updateSavedState()
				} else {
					Screens.showError(TextUtils.i18n('%MODULENAME%/ERROR_MAIN_CALENDAR_NOT_FOUND'));
				}
			} else {
				this.revertGlobalValues()
				Api.showErrorByCode(oResponse)
			}
		}, this)
	} else {
		this.revertGlobalValues()
	}
}

AdminpanelUserSettingsView.prototype.getCurrentValues = function()
{
	return [
		this.calendarName(),
		this.calendarDescription(),
		this.calendarColor(),
	]
}

AdminpanelUserSettingsView.prototype.revertGlobalValues = function()
{
	this.calendarName('')
	this.calendarDescription('')
	this.calendarColor('')
}

AdminpanelUserSettingsView.prototype.getParametersForSave = function ()
{
	return {
		'Id': this.mainCalendarId,
		'UserId': this.iUserId,
		'Name': this.calendarName(),
		'Description': Types.pString(this.calendarDescription()),
		'Color': Types.pString(this.calendarColor())
	}
}

module.exports = new AdminpanelUserSettingsView()
