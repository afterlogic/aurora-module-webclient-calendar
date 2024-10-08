'use strict';

module.exports = function (oAppData) {
	var
		TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),
		
		App = require('%PathToCoreWebclientModule%/js/App.js'),
		ModulesManager = require('%PathToCoreWebclientModule%/js/ModulesManager.js'),
		
		Settings = require('modules/%ModuleName%/js/Settings.js')
	;

	let calendarViewInstance = null;

	const getCalendarViewInstance = () => {
		if(!calendarViewInstance) {
			calendarViewInstance = require('modules/%ModuleName%/js/views/CalendarView.js');
		}
		return calendarViewInstance;
	}
	
	Settings.init(oAppData);
	
	if (!ModulesManager.isModuleAvailable(Settings.ServerModuleName))
	{
		return null;
	}
	
	require('modules/%ModuleName%/js/enums.js');
	require('modules/%ModuleName%/js/vendors/fullcalendar/fullcalendar.css');
	require('modules/%ModuleName%/js/vendors/fullcalendar/fullcalendar.js');

	if (App.isPublic())
	{
		return {
			getScreens: function () {
				return { [Settings.HashModuleName]: getCalendarViewInstance };
			},
			getHeaderItem: function () {
				return {
					item: require('modules/%ModuleName%/js/views/PublicHeaderItem.js'),
					name: Settings.HashModuleName
				};
			}
		};
	}
	else if (App.isUserNormalOrTenant())
	{
		if (App.isNewTab())
		{
			return {
				start: function (ModulesManager) {
					if (Settings.AllowAppointments)
					{
						App.subscribeEvent('MailWebclient::RegisterMessagePaneController', function (fRegisterMessagePaneController) {
							fRegisterMessagePaneController(require('modules/%ModuleName%/js/views/IcalAttachmentView.js'), 'BeforeMessageBody');
						});
					}
				}
			};
		}
		else
		{
			require('modules/%ModuleName%/js/koBindings.js');
			require('modules/%ModuleName%/js/MainTabExtMethods.js');

			return {
				start: function (ModulesManager) {
					if (Settings.AllowAppointments)
					{
						App.subscribeEvent('MailWebclient::RegisterMessagePaneController', function (fRegisterMessagePaneController) {
							fRegisterMessagePaneController(require('modules/%ModuleName%/js/views/IcalAttachmentView.js'), 'BeforeMessageBody');
						});
					}
					ModulesManager.run('SettingsWebclient', 'registerSettingsTab', [function () { return require('modules/%ModuleName%/js/views/CalendarSettingsFormView.js'); }, Settings.HashModuleName, TextUtils.i18n('%MODULENAME%/LABEL_SETTINGS_TAB')]);

					App.broadcastEvent('RegisterNewItemElement', {
						'title': TextUtils.i18n('%MODULENAME%/ACTION_CREATE_EVENT'),
						'handler': () => {
							window.location.hash = Settings.HashModuleName;
							const calendarViewInstance = getCalendarViewInstance();
							calendarViewInstance.createEventInCurrentCalendar();

							if (calendarViewInstance.calendars.currentCal()) {
								calendarViewInstance.createEventInCurrentCalendar();
							} else {
								const currentCalSubscribtion = calendarViewInstance.calendars.currentCal.subscribe(function () {
									calendarViewInstance.createEventInCurrentCalendar();
									currentCalSubscribtion.dispose();
								});
							}
						},
						'className': 'item_calendar',
						'order': 4,
						'column': 1
					});
				},
				getScreens: function () {
					return { [Settings.HashModuleName]: getCalendarViewInstance };
				},
				getHeaderItem: function () {
					return {
						item: require('modules/%ModuleName%/js/views/HeaderItemView.js'),
						name: Settings.HashModuleName
					};
				},
				getWeekStartsOn: function () {
					return Settings.WeekStartsOn;
				},
				getMobileSyncSettingsView: function () {
					return require('modules/%ModuleName%/js/views/MobileSyncSettingsView.js');
				}
			};
		}
	}
	
	return null;
};
