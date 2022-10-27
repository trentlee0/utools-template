const fs = require('fs')
const {resolve} = require('path')
const plugin = require('./public/plugin.json')
const config = require('./dist/config')

const name = plugin.pluginName
const features = []
Object.values(config).forEach(template => {
  features.push(...template?.map(item => {
    return {
      code: item?.code,
      cmds: [`${name} ${item.title || ''}`],
      explain: `${name} ${item.description || ''}`,
      icon: item?.icon
    }
  }))
})


function build(config) {
  console.log('Start building ...')
  const {dist, replaces, copies} = config

  for (const copy of copies) {
    fs.cpSync(resolve(__dirname, copy), dist, {recursive: true})
  }

  for (const replace of replaces) {
    const newContent = replace.action(fs.readFileSync(resolve(__dirname, replace.source)).toString())
    fs.writeFileSync(replace.dest, newContent)
  }
  console.log('Finish building!')
}

build({
  dist: resolve(__dirname, 'dist'),
  replaces: [
    {
      source: './public/plugin.json',
      dest: resolve(__dirname, 'dist', 'plugin.json'),
      action: (content) => {
        plugin.features = features
        return JSON.stringify(plugin, null, 2)
      }
    }
  ],
  copies: ['public']
})

