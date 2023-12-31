/**
 * 搜索器
 */
export type Searcher<T> = (item: T, word: string) => boolean

/**
 * 实体搜索器
 */
export function entitySearcher<T>(keys: Array<keyof T>): Searcher<T> {
  return (item, word) => {
    word = word.toLowerCase()
    for (const key of keys) {
      const value = item[key]
      if (typeof value === 'string' && value.toLowerCase().includes(word)) {
        return true
      }
    }
    return false
  }
}

function search<T>(list: Array<T>, word: string, searcher: Searcher<T>) {
  if (!word) return list
  return list.filter((item) => searcher(item, word))
}

/**
 * 关键词搜索，忽略大小写搜索指定对象属性的值
 */
export function searchList<T>(list: Array<T>, word: string, searcher: Searcher<T>): T[]
/**
 * 多关键词搜索，忽略大小写搜索指定对象属性的值
 */
export function searchList<T>(list: Array<T>, words: string[], searcher: Searcher<T>): T[]

export function searchList<T>(list: Array<T>, words: string | string[], searcher: Searcher<T>) {
  if (!Array.isArray(words)) return search(list, words, searcher)

  let filteredList: Array<T> = list
  for (const word of words) {
    filteredList = search(filteredList, word, searcher)
  }
  return filteredList
}

function matchString(s: string, p: string, start: number) {
  if (start + p.length > s.length) return false
  for (let i = 0; i < p.length; i++) {
    if (s.charAt(start++) !== p.charAt(i)) return false
  }
  return true
}

export interface PinyinMatchOptions {
  /**
   * 匹配时按字母小写、大写、不敏感匹配
   * @default "lower"
   */
  case?: 'lower' | 'upper' | 'sensitive'

  /**
   * 拼音分隔符，仅在 `pinyin` 为 `string` 时生效
   * @default " "
   */
  separator?: string
}

export interface PinyinMatchResult {
  /**
   * 匹配到相对 `pinyin` 的起始下标
   */
  from: number

  /**
   * 匹配到相对 `pinyin` 的结束下标
   */
  to: number
}

/**
 * 匹配目标串拼音
 * @param pinyin 目标串拼音
 * @param pattern 模式串
 * @param options 选项
 */
export function pinyinMatch(
  pinyin: string[] | string,
  pattern: string,
  options?: PinyinMatchOptions
): PinyinMatchResult | null {
  let pys: string[]
  if (typeof pinyin === 'string') {
    const separator = options?.separator ?? ' '
    pys = pinyin.split(separator)
  } else {
    pys = pinyin
  }
  if (options?.case === 'upper') {
    pattern = pattern.toUpperCase()
  } else if (options?.case === 'sensitive') {
    pattern = pattern
  } else {
    pattern = pattern.toLowerCase()
  }

  let flatPinyin = ''
  let firstPinyin = ''
  let pos = 0
  const n = pys.length
  const positions = new Array(n)
  for (let i = 0; i < n; i++) {
    const py = pys[i]
    flatPinyin += py
    firstPinyin += py.charAt(0)
    positions[i] = pos
    pos += py.length
  }
  for (let i = 0; i < n; i++) {
    const py = pys[i]
    if (py.startsWith(pattern)) {
      return { from: i, to: i }
    }
    if (pattern.startsWith(py) && matchString(flatPinyin, pattern, positions[i])) {
      const matchPinyinLen = positions[i] + pattern.length
      let to = i
      for (let j = i; j < n; j++) {
        if (positions[j] >= matchPinyinLen) break
        to = j
      }
      return { from: i, to }
    }
  }

  const firstIndex = firstPinyin.indexOf(pattern)
  if (firstIndex >= 0) {
    return { from: firstIndex, to: firstIndex + pattern.length - 1 }
  }

  return null
}
