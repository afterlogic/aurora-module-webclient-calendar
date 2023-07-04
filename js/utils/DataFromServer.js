'use strict'

const TextUtils = require('%PathToCoreWebclientModule%/js/utils/Text.js'),
  Types = require('%PathToCoreWebclientModule%/js/utils/Types.js')

module.exports = {
  parseDescriptionLocation(rawValue) {
    const preparedValue = Types.pString(rawValue).replace(/\\n/g, '\n').replace(/\r/g, '')
    if (TextUtils.isHtml(preparedValue)) {
      const $desc = $(`<div>${preparedValue.replace(/\n/g, '<br />')}</div>`)
      $desc.find('a').attr('target', '_blank')
      return $desc.html()
    } else {
      return TextUtils.plainToHtml(preparedValue, true)
    }
  },
}
