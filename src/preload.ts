import templates from './templates'
import * as config from './config'

// @ts-ignore
window.exports = templates
  .nones(config.none)
  .mutableLists(config.list)
  .build()
