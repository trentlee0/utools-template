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
