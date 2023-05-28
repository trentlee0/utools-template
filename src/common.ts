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
