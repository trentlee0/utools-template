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
  enter: (action: Action) => void
}

interface ListTemplate extends Template {
  /**
   * 输入框占位符
   * @default "搜索"
   */
  placeholder?: string

  /**
   * 输入框改变时调用。默认使用 `searchWord`，忽略大小写搜索字段 `title` 和 `description`。
   */
  search?(action: Action, searchWord: string, render: ListRenderFunction): void
}

export interface ImmutableListItem extends ListItem {
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
   * 动态获取的列表数据，用于默认搜索，在实现类中定义后可直接使用。可以忽略
   */
  $list?: Array<ListItem>

  /**
   * 进入插件时调用
   */
  enter(action: Action, render: ListRenderFunction): void

  /**
   * 使用回车键选择某项时调用
   */
  select(action: Action, item: ListItem): void
}

/**
 * 关键词搜索，忽略大小写搜索 `title` 和 `description`
 */

export function searchList(list: Array<ListItem>, word: string): ListItem[]
/**
 * 多关键词搜索，忽略大小写搜索 `title` 和 `description`
 */
export function searchList(list: Array<ListItem>, words: string[]): ListItem[]

export function searchList(list: Array<ListItem>, words: string | string[]) {
  if (!Array.isArray(words)) return search(list, words)

  let filteredList: Array<ListItem> = list
  for (const word of words) {
    filteredList = search(list, word)
  }
  return filteredList
}

function search(list: Array<ListItem>, word: string) {
  word = word.toLowerCase()
  return list.filter(({ title, description }) => {
    return (
      title.toLowerCase().includes(word) ||
      description?.toLowerCase().includes(word)
    )
  })
}

class TemplateBuilder {
  private readonly exports: TemplateExports = {}

  /**
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
              render(search(list, searchWord))
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
   * @param templates 可变列表模板，列表项是动态的
   */
  mutableList(...templates: Array<MutableListTemplate>) {
    for (const template of templates) {
      const { placeholder } = template
      this.exports[template.code] = {
        mode: 'list',
        args: {
          enter: (action, render) => {
            template.enter(action, (list) => {
              template.$list = list
              render(list)
            })
          },
          search: (action, searchWord, render) => {
            if (template.search) {
              template.search(action, searchWord, render)
            } else {
              if (!template.$list) return
              render(search(template.$list, searchWord))
            }
          },
          select: (action, item) => template.select(action, item),
          placeholder
        }
      }
    }
    return this
  }

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
