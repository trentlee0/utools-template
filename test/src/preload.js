const { templateBuilder, hideAndOutPlugin } = require('../../dist')

const none = [
  {
    code: 'code1',
    handler: () => {
      hideAndOutPlugin()
      utools.shellOpenExternal('https://www.baidu.com/s?wd=code1')
    }
  },
  {
    code: 'code2',
    handler: () => {
      hideAndOutPlugin()
      utools.shellOpenExternal('https://www.baidu.com/s?wd=code2')
    }
  }
]

const list = [
  {
    code: 'code-list',
    list: [
      ...none.map(item => {
        return {
          title: item.code,
          description: item.code,
          icon: 'logo.png',
          handler: () => {
            item.handler()
          }
        }
      })
    ]
  }
]

window.exports = templateBuilder()
  .none(...none)
  .immutableList(...list)
  .build()

