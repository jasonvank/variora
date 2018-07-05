import { notification } from 'antd'

function validateDocumentTitle(title) {
  const INVALID_DOCUMENT_NAME_PATTERN = /[]/gm
  if (title == undefined || title == '') {
    notification['warning']({
      message: 'Document title cannot be empty',
      duration: 1.8,
    })
    return false
  }
  if (title.match(INVALID_DOCUMENT_NAME_PATTERN) != null) {
    notification['warning']({
      message: 'The document name contains invalid character',
      description: 'The special characters you can include in your document name are "-|&_.():[]@<>"',
      duration: 6,
    })
    return false
  }
  return true
}

export { validateDocumentTitle }
