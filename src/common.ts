export function isUTools() {
  return Reflect.has(window, 'utools')
}

export function isBrowser() {
  return !isUTools()
}
