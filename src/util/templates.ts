interface Action {
  code: string
  type: string
  payload: any
}

interface SetItem {
  title: string
  description?: string
  icon?: string

  [prop: string]: any
}

interface NoneT {
  mode: 'none'
  args: {
    enter: (action: Action) => void
  }
}

type SetListCallback = (setList: SetItem[]) => void

interface ListT {
  mode: 'list'
  args: {
    enter: (action: Action, callbackSetList: SetListCallback) => void
    search: (action: Action, searchWord: string, callbackSetList: SetListCallback) => void
    select: (action: Action, itemData: SetItem, callbackSetList: SetListCallback) => void
    placeholder?: string
  }
}

type TemplatesHolder = { [prop: string]: NoneT | ListT }

interface Feature extends SetItem {
  code: string
}

function bind(fn: Function, context: object) {
  return (...args: any) => fn.apply(context, args)
}


// NoneTemplate

export interface NoneTemplate extends Feature {
  handle: () => void
}

function noneTemplate(templatesHolder: TemplatesHolder, item: NoneTemplate) {
  const {handle} = item
  templatesHolder[item.code] = {
    mode: 'none',
    args: {
      enter: () => handle()
    }
  }
}


// FixedListTemplate

interface FixedSearchItem extends SetItem {
  handle: () => void
}

export interface FixedListTemplate extends Feature {
  searchList: Array<FixedSearchItem>
  placeholder?: string,
  descSearchable?: boolean
}

function fixedListTemplate(templatesHolder: TemplatesHolder, item: FixedListTemplate) {
  const set$state = (list: SetItem[]) => Reflect.set(item, '$state', list)

  const {searchList, descSearchable, placeholder} = item
  set$state(searchList)

  templatesHolder[item.code] = {
    mode: 'list',
    args: {
      enter: (action, callbackSetList) => callbackSetList(searchList),
      search: (action, searchWord, callbackSetList) => {
        searchWord = searchWord.toLowerCase()
        callbackSetList(
            searchList.filter(({title, description}) =>
                title.toLowerCase().includes(searchWord) ||
                (descSearchable && description.toLowerCase().includes(searchWord))
            )
        )
      },
      select: (action, itemData: FixedSearchItem) => itemData.handle(),
      placeholder
    }
  }
}


// MutableListTemplate

type EnterCallback = (render: SetListCallback) => void
type SelectCallback = (item: SetItem) => void

export interface MutableListTemplate extends Feature {
  data: () => { [prop: string]: any }
  onEnter: EnterCallback
  onSelect: SelectCallback
  placeholder?: string
  descSearchable?: boolean
}

function mutableListTemplate(templatesHolder: TemplatesHolder, item: MutableListTemplate) {
  const data = item.data()
  const set$state = (list: SetItem[]) => Reflect.set(data, '$state', list)
  const get$state = (): SetItem[] => Reflect.get(data, '$state')

  const {descSearchable, onlyEnterOnce, placeholder} = item
  const onEnter: EnterCallback = bind(item.onEnter, data)
  const onSelect: SelectCallback = bind(item.onSelect, data)
  templatesHolder[item.code] = {
    mode: 'list',
    args: {
      enter: (action, callbackSetList) => {
        if (onlyEnterOnce && get$state().length) {
          callbackSetList(get$state())
          return
        }
        onEnter(setList => {
          set$state(setList)
          callbackSetList(setList)
        })
      },
      search: (action, searchWord, callbackSetList) => {
        searchWord = searchWord.toLowerCase()
        callbackSetList(
            get$state().filter(({title, description}) =>
                title.toLowerCase().includes(searchWord) ||
                (descSearchable && description.toLowerCase().includes(searchWord))
            )
        )
      },
      select: (action, itemData) => onSelect(itemData),
      placeholder
    }
  }
}


class TemplateBuilder {
  private readonly templates: TemplatesHolder

  constructor() {
    this.templates = {}
  }

  none(item: NoneTemplate) {
    noneTemplate(this.templates, item)
    return this
  }

  nones(items: NoneTemplate[]) {
    items.forEach(item => this.none(item))
    return this
  }

  fixedList(item: FixedListTemplate) {
    fixedListTemplate(this.templates, item)
    return this
  }

  fixedLists(items: FixedListTemplate[]) {
    items.forEach(item => this.fixedList(item))
    return this
  }

  mutableList(item: MutableListTemplate) {
    mutableListTemplate(this.templates, item)
    return this
  }

  mutableLists(items: MutableListTemplate[]) {
    items.forEach(item => this.mutableList(item))
    return this
  }

  build() {
    return this.templates
  }
}

export function templateBuilder() {
  return new TemplateBuilder()
}

export default templateBuilder()
