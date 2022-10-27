const target: { templates: object, states: any[] } = {
  templates: {},
  states: []
}

interface SetItem {
  title: string
  description?: string
  icon?: string
}

interface Feature extends SetItem {
  code: string
}

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


interface SearchItem extends SetItem {
  action: () => void
}

export interface SearchListTemplate extends Feature {
  searchList: Array<SearchItem>
  searchPlaceholder?: string
}

export function searchListTemplate(items: Array<SearchListTemplate>) {
  items.forEach(item => {
    target.states.push(item.searchList)
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
  })
}


export interface EnterListTemplate extends Feature {
  onlyEnterOnce: boolean
  onEnter: (render: (setList: SetItem[]) => void) => void
  onSelectItem: (item: SetItem) => void
  searchPlaceholder?: string
}

export function enterSearchListTemplate(items: Array<EnterListTemplate>) {
  let n = items.length
  target.states = new Array(n).fill([], 0, n)
  items.forEach((item, index) => {
    target.templates[item.code] = {
      mode: 'list',
      args: {
        enter: (action, callbackSetList) => {
          if (item.onlyEnterOnce && Object.entries(target.states[index]).length) {
            callbackSetList(target.states[index])
          } else {
            item.onEnter((setList) => {
              target.states[index] = setList
              callbackSetList(setList)
            })
          }
        },
        search: (action, searchWord, callbackSetList) => {
          searchWord = searchWord.toLowerCase()
          callbackSetList(
              target.states[index].filter(({title, description}) =>
                  title.toLowerCase().indexOf(searchWord) !== -1 ||
                  description.toLowerCase().indexOf(searchWord) !== -1
              )
          )
        },
        select: (action, itemData) => {
          item.onSelectItem(itemData)
        },
        placeholder: item.searchPlaceholder
      }
    }
  })
}


export const buildTemplates = () => target.templates
export const getSearchListStates = () => target.states
