'use strict';

var
	_ = require('underscore'),

	CAbstractPopup = require('%PathToCoreWebclientModule%/js/popups/CAbstractPopup.js'),

	CHtmlEditorView = require('modules/MailWebclient/js/views/CHtmlEditorView.js')
;

function setCaretBeforeSignature()
{
	const
		koEditable = $('div.crea-content-editable'),
		editable = koEditable.length > 0 ? koEditable[0] : null,
		thirdChild = editable.childNodes && editable.childNodes.length > 2 ? editable.childNodes[3] : null
	;
	if (thirdChild) {
		const
			range = document.createRange(),
			sel = window.getSelection()
		;
		range.setStart(thirdChild, 0);
		range.collapse(true);
		sel.removeAllRanges();
		sel.addRange(range);
		editable.focus();
	}
}

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
	setCaretBeforeSignature();
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
