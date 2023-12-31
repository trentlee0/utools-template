import { expect, test, describe } from 'vitest'
import { pinyinMatch, PinyinMatchOptions } from '../src/search'
import { parse } from 'tiny-pinyin'

const pinyin = parse('你好吗').map((item) => item.target)
const upperCaseOptions: PinyinMatchOptions = { case: 'upper' }

describe('pinyinMatch with all', () => {
  test('whole', () => {
    expect(pinyinMatch(pinyin, 'nihaoma', upperCaseOptions)).toEqual({
      from: 0,
      to: 2
    })
  })

  test('part', () => {
    expect(pinyinMatch(pinyin, 'hao', upperCaseOptions)).toEqual({
      from: 1,
      to: 1
    })
  })

  test('not match', () => {
    expect(pinyinMatch(pinyin, 'aom', upperCaseOptions)).toEqual(null)
  })

  test('sensitive case', () => {
    expect(pinyinMatch(pinyin, 'NIHAOMA', {case: 'sensitive'})).toEqual({
      from: 0,
      to: 2
    })
  })
})

describe('pinyinMatch with first letter', () => {
  test('whole', () => {
    expect(pinyinMatch(pinyin, 'nhm', upperCaseOptions)).toEqual({
      from: 0,
      to: 2
    })
  })

  test('part1', () => {
    expect(pinyinMatch(pinyin, 'hm', upperCaseOptions)).toEqual({
      from: 1,
      to: 2
    })
  })

  test('part2', () => {
    expect(pinyinMatch(pinyin, 'haom', upperCaseOptions)).toEqual({
      from: 1,
      to: 2
    })
  })

  test('not match', () => {
    expect(pinyinMatch(pinyin, 'ham', upperCaseOptions)).toEqual(null)
  })
})
