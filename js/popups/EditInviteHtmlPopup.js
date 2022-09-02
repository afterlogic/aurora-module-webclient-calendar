'use strict';

var
	_ = require('underscore'),

	CAbstractPopup = require('%PathToCoreWebclientModule%/js/popups/CAbstractPopup.js'),

	CHtmlEditorView = require('modules/MailWebclient/js/views/CHtmlEditorView.js')
;

/**
 * @constructor
 */
function CEditInviteHtmlPopup()
{
	CAbstractPopup.call(this);

	this.fCallback = null;

	this.oHtmlEditor = new CHtmlEditorView(false, this);
}

_.extendOwn(CEditInviteHtmlPopup.prototype, CAbstractPopup.prototype);

CEditInviteHtmlPopup.prototype.PopupTemplate = '%ModuleName%_EditInviteHtmlPopup';

/**
 * @param {string} html
 * @param {function} continueHandler
 * @param {function} rejectHandler
 */
CEditInviteHtmlPopup.prototype.onOpen = function (html, continueHandler, rejectHandler)
{
	this.continueHandler = _.isFunction(continueHandler) ? continueHandler : () => {};
	this.rejectHandler = _.isFunction(rejectHandler) ? rejectHandler : () => {};

	this.oHtmlEditor.init(html, false);
};

CEditInviteHtmlPopup.prototype.onClose = function ()
{
	this.rejectHandler();
};

CEditInviteHtmlPopup.prototype.save = function ()
{
	this.continueHandler(this.oHtmlEditor.getText());
	this.closePopup();
};

module.exports = new CEditInviteHtmlPopup();
