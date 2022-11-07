import * as templates from './util/templates'
import * as config from './config'

templates.noneTemplate(config.none)
templates.dynamicListTemplate(config.list)

// @ts-ignore
window.exports = templates.build()
