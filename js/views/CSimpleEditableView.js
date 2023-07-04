'use strict'

const ko = require('knockout'),
  TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),
  Types = require('%PathToCoreWebclientModule%/js/utils/Types.js')
function CSimpleEditableView({
  isEditableObservable,
  autosizeTriggerObservable,
  linkPopupEditableView,
  allowEditLinks,
  placeholderText,
}) {
  this.isEditable = isEditableObservable
  this.autosizeTrigger = autosizeTriggerObservable
  this.placeholderText = placeholderText

  this.dataHtml = ko.observable('')
  this.dataDom = ko.observable(null)
  this.dataDom.subscribe(function () {
    if (this.dataDom()) {
      this.dataDom().on(
        'keyup paste cut',
        function (event) {
          if (!event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
            this.dataHtml(this.dataDom().html())
          }
        }.bind(this)
      )
      this.dataDom().on('paste', function (event) {
        event = event.originalEvent || event
        const clipboardData = event.clipboardData || window.clipboardData
        if (clipboardData) {
          const text = Types.pString(clipboardData.getData('text'))
          const html = TextUtils.plainToHtml(text, true)
          window.document.execCommand('insertHTML', false, html)
          event.preventDefault()
        }
      })
      linkPopupEditableView.initInputField(this.dataDom(), allowEditLinks)
      if (this.dataHtml() !== '') {
        this.dataDom().html(this.dataHtml())
      }
    }
  }, this)
  this.dataFocus = ko.observable(false)
}

CSimpleEditableView.prototype.PopupTemplate = '%ModuleName%_SimpleEditableView'

CSimpleEditableView.prototype.getHtml = function () {
  return this.dataHtml()
}

CSimpleEditableView.prototype.getPlain = function () {
  return TextUtils.htmlToPlain(this.dataHtml())
}

CSimpleEditableView.prototype.setHtml = function (data) {
  this.setData(Types.pString(data).replace(/\r/g, '').replace(/\n/g, '<br />'))
}

CSimpleEditableView.prototype.setData = function (preparedData) {
  this.dataHtml(preparedData)
  if (this.dataDom()) {
    this.dataDom().html(this.dataHtml())
  }
}

CSimpleEditableView.prototype.setPlain = function (data) {
  let preparedData = Types.pString(data)
  if (!TextUtils.isHtml(preparedData)) {
    preparedData = TextUtils.plainToHtml(preparedData, true)
  }
  this.setData(preparedData)
}

module.exports = CSimpleEditableView
