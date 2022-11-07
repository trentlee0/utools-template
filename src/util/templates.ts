type Result = {
  templates: object
  normalListStates: any[]
  dynamicListStates: any[]
}

const target: Result = {
  templates: {},
  normalListStates: [],
  dynamicListStates: []
}


interface SetItem {
  title: string
  description?: string
  icon?: string
}

interface Feature extends SetItem {
  code: string
}


// NoneTemplate

export interface NoneTemplate extends Feature {
  action: () => void
}

export function noneTemplate(items: Array<NoneTemplate>) {
  items.forEach(item => {
    target.templates[item.code] = {
      mode: 'none',
      args: {
        enter: () => item.action()
      }
    }
  })
}


// NormalListTemplate

interface NormalSearchItem extends SetItem {
  action: () => void
}

export interface NormalListTemplate extends Feature {
  searchList: Array<NormalSearchItem>
  searchPlaceholder?: string
}

export function normalListTemplate(items: Array<NormalListTemplate>) {
  for (const item of items) {
    target.normalListStates.push(item.searchList)
    target.templates[item.code] = {
      mode: 'list',
      args: {
        enter: (action, callbackSetList) => {
          callbackSetList(item.searchList)
        },
        search: (action, searchWord, callbackSetList) => {
          searchWord = searchWord.toLowerCase()
          callbackSetList(
              item.searchList.filter(({title, description}) =>
                  title.toLowerCase().indexOf(searchWord) !== -1 ||
                  description.toLowerCase().indexOf(searchWord) !== -1
              )
          )
        },
        select: (action, itemData) => {
          itemData.action()
        },
        placeholder: item.searchPlaceholder
      }
    }
  }
}


// DynamicListTemplate

export interface DynamicListTemplate extends Feature {
  onlyEnterOnce: boolean
  onEnter: (render: (setList: SetItem[]) => void) => void
  onSelect: (item: SetItem) => void
  searchPlaceholder?: string
}

export function dynamicListTemplate(items: Array<DynamicListTemplate>) {
  let n = items.length
  target.dynamicListStates = new Array(n).fill([], 0, n)
  for (let i = 0; i < n; i++) {
    const item = items[i]
    target.templates[item.code] = {
      mode: 'list',
      args: {
        enter: (action, callbackSetList) => {
          if (item.onlyEnterOnce && Object.entries(target.dynamicListStates[i]).length) {
            callbackSetList(target.dynamicListStates[i])
          } else {
            item.onEnter(setList => {
              target.dynamicListStates[i] = setList
              callbackSetList(setList)
            })
          }
        },
        search: (action, searchWord, callbackSetList) => {
          searchWord = searchWord.toLowerCase()
          callbackSetList(
              target.dynamicListStates[i].filter(({title, description}) =>
                  title.toLowerCase().indexOf(searchWord) !== -1 ||
                  description.toLowerCase().indexOf(searchWord) !== -1
              )
          )
        },
        select: (action, itemData) => {
          item.onSelect(itemData)
        },
        placeholder: item.searchPlaceholder
      }
    }
  }
}


export const build = () => target.templates
export const states = () => ({
  normalList: target.normalListStates,
  dynamicList: target.dynamicListStates,
})
