import { expect, test, describe } from 'vitest'
import { pinyinMatch, PinyinMatchOptions } from '../src/common'
import { parse } from 'tiny-pinyin'

const pinyin = parse('你好吗').map((item) => item.target)
const options: PinyinMatchOptions = { case: 'upper' }

describe('pinyinMatch with all', () => {
  test('whole', () => {
    expect(pinyinMatch(pinyin, 'nihaoma', options)).toEqual({
      from: 0,
      to: 2
    })
  })

  test('part', () => {
    expect(pinyinMatch(pinyin, 'hao', options)).toEqual({
      from: 1,
      to: 1
    })
  })

  test('not match', () => {
    expect(pinyinMatch(pinyin, 'aom', options)).toEqual(null)
  })
})

describe('pinyinMatch with first letter', () => {
  test('whole', () => {
    expect(pinyinMatch(pinyin, 'nhm', options)).toEqual({
      from: 0,
      to: 2
    })
  })

  test('part1', () => {
    expect(pinyinMatch(pinyin, 'hm', options)).toEqual({
      from: 1,
      to: 2
    })
  })

  test('part2', () => {
    expect(pinyinMatch(pinyin, 'haom', options)).toEqual({
      from: 1,
      to: 2
    })
  })

  test('not match', () => {
    expect(pinyinMatch(pinyin, 'ham', options)).toEqual(null)
  })
})
