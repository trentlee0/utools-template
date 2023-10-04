import { Action, ListItem, ListRenderFunction, TemplateExports } from './type'

interface Template {
  code: string
}

/**
 * 无 UI 模板
 */
export interface NoneTemplate extends Template {
  /**
   * 进入插件时调用
   */
  enter(action: Action): void
}

interface ListTemplate extends Template {
  /**
   * 输入框占位符
   * @default "搜索"
   */
  placeholder?: string

  /**
   * 输入框改变时调用。
   *
   * 如果不实现该方法，则会使用 `searchWord`，忽略大小写搜索字段 `title` 和 `description`。参见 {@link search} 方法
   */
  search?(action: Action, searchWord: string, render: ListRenderFunction): void
}

export interface ImmutableListItem extends ListItem {
  /**
   * 选中当前项的处理函数
   */
  handler: (action: Action) => void
}

/**
 * 不可变列表模板，列表项是固定的
 */
export interface ImmutableListTemplate extends ListTemplate {
  list: Array<ImmutableListItem>
}

/**
 * 可变列表模板，列表项是动态的
 */
export interface MutableListTemplate extends ListTemplate {
  /**
   * 存放初始动态列表数据，默认搜索使用到，在 `enter` 中调用 `render` 函数时会刷新。在实现类中定义后可直接使用，也可以忽略
   */
  $list?: Array<ListItem>

  /**
   * 进入插件时调用
   */
  enter?(action: Action, render: ListRenderFunction): void

  /**
   * 使用回车键选择某项时调用
   */
  select(action: Action, item: ListItem): void
}

function search<T>(list: Array<T>, word: string, searcher: Searcher<T>) {
  if (!word) return list
  return list.filter((item) => searcher(item, word))
}

/**
 * 搜索器
 */
export type Searcher<T> = (item: T, word: string) => boolean

/**
 * 关键词搜索，忽略大小写搜索指定对象属性的值
 */
export function searchList<T>(
  list: Array<T>,
  word: string,
  searcher: Searcher<T>
): T[]
/**
 * 多关键词搜索，忽略大小写搜索指定对象属性的值
 */
export function searchList<T>(
  list: Array<T>,
  words: string[],
  searcher: Searcher<T>
): T[]

export function searchList<T>(
  list: Array<T>,
  words: string | string[],
  searcher: Searcher<T>
) {
  if (!Array.isArray(words)) return search(list, words, searcher)

  let filteredList: Array<T> = list
  for (const word of words) {
    filteredList = search(filteredList, word, searcher)
  }
  return filteredList
}

/**
 * 实体搜索器
 */
export function entitySearcher<T>(
  word: string,
  keys: Array<keyof T>
): Searcher<T> {
  word = word.toLowerCase()
  return (item, word) => {
    for (const key of keys) {
      const value = item[key]
      if (typeof value === 'string' && value.toLowerCase().includes(word)) {
        return true
      }
    }
    return false
  }
}

/**
 * 关键词搜索，忽略大小写搜索 `title` 和 `description`
 */
export function searchListItems(listItems: Array<ListItem>, word: string) {
  return search(listItems, word, entitySearcher(word, ['title', 'description']))
}

class TemplateBuilder {
  private readonly exports: TemplateExports = {}

  /**
   * 根据无 UI 模板构建
   * @param templates 无 UI 模板
   */
  none(...templates: Array<NoneTemplate>) {
    for (const template of templates) {
      this.exports[template.code] = {
        mode: 'none',
        args: {
          enter: (action) => template.enter(action)
        }
      }
    }
    return this
  }

  /**
   * 根据不可变列表模板构建
   * @param templates 不可变列表模板，列表项是固定的
   */
  immutableList(...templates: Array<ImmutableListTemplate>) {
    for (const template of templates) {
      const { list, placeholder } = template
      this.exports[template.code] = {
        mode: 'list',
        args: {
          enter: (action, render) => render(list),
          search: (action, searchWord, render) => {
            if (template.search) {
              template.search(action, searchWord, render)
            } else {
              render(searchListItems(list, searchWord))
            }
          },
          select: (action, item: ImmutableListItem) => item.handler(action),
          placeholder
        }
      }
    }
    return this
  }

  /**
   * 根据可变列表模板构建
   * @param templates 可变列表模板，列表项是动态的
   */
  mutableList(...templates: Array<MutableListTemplate>) {
    for (const template of templates) {
      const { placeholder } = template
      this.exports[template.code] = {
        mode: 'list',
        args: {
          enter: (action, render) => {
            template.enter?.(action, (list) => {
              template.$list = list
              render(list)
            })
          },
          search: (action, searchWord, render) => {
            if (template.search) {
              template.search(action, searchWord, render)
            } else {
              render(searchListItems(template.$list ?? [], searchWord))
            }
          },
          select: (action, item) => template.select(action, item),
          placeholder
        }
      }
    }
    return this
  }

  /**
   * 获取构建结果
   */
  build() {
    return this.exports
  }
}

/**
 * 模板构建器
 */
export function templateBuilder() {
  return new TemplateBuilder()
}
