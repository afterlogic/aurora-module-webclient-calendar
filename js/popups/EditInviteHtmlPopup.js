'use strict';

var
	_ = require('underscore'),

	CAbstractPopup = require('%PathToCoreWebclientModule%/js/popups/CAbstractPopup.js'),

	CHtmlEditorView = require('modules/MailWebclient/js/views/CSummernoteEditorView.js')
;

function setCaretBeforeSignature(oHtmlEditor)
{
	const
		elEditable = oHtmlEditor.getEditableArea(),
		editable = elEditable.length > 0 ? elEditable[0] : null,
		thirdChild = editable.childNodes && editable.childNodes.length > 2 ? editable.childNodes[2] : null
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
	setCaretBeforeSignature(this.oHtmlEditor);
};

CEditInviteHtmlPopup.prototype.onClose = function ()
{
	this.rejectHandler();
};

CEditInviteHtmlPopup.prototype.save = function ()
{
	const bRemoveSignatureAnchor = true;
	this.continueHandler(this.oHtmlEditor.getText(bRemoveSignatureAnchor));
	this.closePopup();
};

module.exports = new CEditInviteHtmlPopup();
