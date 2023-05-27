import { Action } from './type'

export * from './common'
export * from './template'
export * as storage from './storage'
export * from './command'
export * from './type'

// utools.onPluginEnter((action) => {
function hello(action: Action) {
  if (action.type === 'window') {
    action.payload
  }
}
// })
