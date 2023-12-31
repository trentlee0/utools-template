export function isUTools() {
  return Reflect.has(window, 'utools')
}

export function isBrowser() {
  return !isUTools()
}

/**
 * 隐藏并退出当前 uTools 插件
 */
export function hideAndOutPlugin() {
  utools.hideMainWindow()
  utools.outPlugin()
}

type KeyFn<T, K> = (item: T, index: number) => K
type ValFn<T, V> = (item: T, index: number) => V
/**
 * 将数组转为哈希表，自定义生成键
 */
export function toMap<K, V>(arr: V[], keyFn: KeyFn<V, K>): Map<K, V>
/**
 * 将数组转为哈希表，自定义生成键和值
 */
export function toMap<T, K, V>(arr: T[], keyFn: KeyFn<T, K>, valFn: ValFn<T, V>): Map<K, V>

export function toMap<T, K, V>(
  arr: T[],
  keyFn: KeyFn<T, K>,
  valFn?: ValFn<T, V>
): Map<K, V> | Map<K, T> {
  if (valFn) {
    const map = new Map<K, V>()
    arr.forEach((item, index) => map.set(keyFn(item, index), valFn(item, index)))
    return map
  }
  const map = new Map<K, T>()
  arr.forEach((item, index) => map.set(keyFn(item, index), item))
  return map
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
   * 匹配时按大写或小写匹配
   * @default "lower"
   */
  case?: 'lower' | 'upper'

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
  pattern = options?.case === 'upper' ? pattern.toUpperCase() : pattern.toLowerCase()

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
