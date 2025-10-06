'use strict';

var
	App = require('%PathToCoreWebclientModule%/js/App.js'),
	TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),			
	CHeaderItemView = require('%PathToCoreWebclientModule%/js/views/CHeaderItemView.js'),

	sTabTitle = App.isPublic() ? '' : TextUtils.i18n('%MODULENAME%/ACTION_SHOW_CALENDAR'),
	
	PublicHeaderItem = new CHeaderItemView(sTabTitle)
;

module.exports = PublicHeaderItem;
