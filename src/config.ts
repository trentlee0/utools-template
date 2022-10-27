import {NoneTemplate, EnterListTemplate} from './util/build-template'

export const none: Array<NoneTemplate> = [
  {
    title: 'Open Browser',
    description: '打开浏览器',
    code: 'search-browser',
    action: () => {
      console.log('Open Browser')
    }
  }
]

export const list: Array<EnterListTemplate> = [
  {
    description: '搜索',
    title: 'Search',
    code: 'search-search',
    onlyEnterOnce: true,
    onEnter: (render) => {
      console.log('onEnter')
    },
    onSelectItem: (item) => {
      console.log(item)
      utools.hideMainWindow()
    }
  }
]
