import {noneTemplate, enterSearchListTemplate, buildTemplates} from './util/build-template'
import {list, none} from './config'

noneTemplate(none)
enterSearchListTemplate(list)

// @ts-ignore
window.exports = buildTemplates()
