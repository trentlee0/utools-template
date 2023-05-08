import { NoneTemplate, MutableListTemplate } from './templates'

export const none: Array<NoneTemplate> = [
  {
    code: 'open-browser',
    title: 'Open Browser',
    description: '打开浏览器',
    handle: () => {
      console.log('Open Browser')
    }
  }
]

export const list: Array<MutableListTemplate> = [
  {
    code: 'search-search',
    title: 'Search',
    description: '搜索',
    data: () => ({
      count: 0
    }),
    onEnter(render) {
      this.count++
      render([{
        title: '进入次数' + this.count,
        description: '搜索结果项'
      }])
    },
    onSelect(item) {
      this.count = 0
      console.log(item)
      utools.hideMainWindow()
    }
  }
]
