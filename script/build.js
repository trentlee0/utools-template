const {resolve} = require('path')
const fs = require('fs')
const plugin = require('../public/plugin.json')
const config = require('../dist/config')

const name = plugin.pluginName
const features = []
Object.values(config).forEach(template => {
  features.push(...template?.map(item => {
    return {
      code: item?.code,
      icon: item?.icon,
      explain: `${name} ${item.description || ''}`,
      cmds: [`${name} ${item.title || ''}`]
    }
  }))
})


function build(config) {
  console.log('Start building ...')
  const {distDir, replaces, copyDirs} = config

  for (const dir of copyDirs) {
    fs.cpSync(dir, distDir, {recursive: true})
  }

  for (const replace of replaces) {
    const newContent = replace.action(fs.readFileSync(replace.source).toString())
    fs.writeFileSync(replace.destination, newContent)
  }
  console.log('Finish building!')
}

const distDir = resolve(__dirname, '../dist')
const publicDir = resolve(__dirname, '../public')

build({
  distDir,
  replaces: [
    {
      source: resolve(publicDir, 'plugin.json'),
      destination: resolve(distDir, 'plugin.json'),
      action: () => {
        plugin.features = features
        return JSON.stringify(plugin, null, 2)
      }
    }
  ],
  copyDirs: [publicDir]
})

