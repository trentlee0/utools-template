import {NoneTemplate, DynamicListTemplate} from './util/templates'

export const none: Array<NoneTemplate> = [
  {
    code: 'search-browser',
    title: 'Open Browser',
    description: '打开浏览器',
    action: () => {
      console.log('Open Browser')
    }
  }
]

export const list: Array<DynamicListTemplate> = [
  {
    code: 'search-search',
    title: 'Search',
    description: '搜索',
    onlyEnterOnce: true,
    onEnter: (render) => {
      render([{
        title: '搜索结果项',
        description: '搜索结果项',
      }])
    },
    onSelect: (item) => {
      console.log(item)
      utools.hideMainWindow()
    }
  }
]
