import { getCookie, getUrlFormat, getValFromUrlParam, groupAvatarColors } from 'util.js'
import { validateDocumentTitle } from 'home_util.js'


test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3)
})


test('test validateDocumentTitle', () => {
  var result = validateDocumentTitle('')
  expect(result).toEqual(false)
})


test('test getUrlFormat', () => {
  var params = {
    id: '1618577571113001418',
    wfr: 'spider',
    for: 'pc'
  }
  var urlBase = 'https://baijiahao.baidu.com/s'
  var result = getUrlFormat(urlBase, params)
  expect(result).toEqual('https://baijiahao.baidu.com/s?id=1618577571113001418&wfr=spider&for=pc&')
})


test('test string format', () => {
  var result = 'test {0} format'.format('string')
  expect(result).toEqual('test string format')

  var result2 = 'test {0} {1}'.format('string', 'format')
  expect(result2).toEqual('test string format')
})
