import {
  Action,
  ListRenderFunction,
  ListTemplateExport,
  NoneTemplateExport,
  TemplateExports
} from './type'


interface ListItem {
  title: string
  description?: string
  icon?: string

  [prop: string]: any
}

interface Template {
  code: string
}

// ===================== NoneTemplate =====================

export interface NoneTemplate extends Template {
  handler: (action: Action) => void
}

/**
 * 无 UI 模板
 */
export function noneTemplate(exports: TemplateExports, template: NoneTemplate) {
  exports[template.code] = <NoneTemplateExport>{
    mode: 'none',
    args: {
      enter: (action) => template.handler(action)
    }
  }
}

// ===================== ListTemplate =====================

interface ListTemplate extends Template {
  /**
   * 搜索框占位文本
   */
  placeholder?: string

  /**
   * 搜索列表
   */
  search?(action: Action, searchWord: string, render: ListRenderFunction): void
}

export interface ImmutableListItem extends ListItem {
  handler: (action: Action) => void
}

export interface ImmutableListTemplate extends ListTemplate {
  list: Array<ImmutableListItem>
}

/**
 * 根据关键字 `searchWord` 搜索字段 `title` 和 `description`，默认忽略大小写
 */
export function searchList(list: Array<ListItem>, searchWord: string, render: ListRenderFunction) {
  searchWord = searchWord.toLowerCase()
  render(
    list.filter(({ title, description }) => {
      return title.toLowerCase().includes(searchWord)
        || description?.toLowerCase().includes(searchWord)
    })
  )
}

/**
 * 不可变列表模板，列表项是固定的
 */
export function immutableListTemplate(exports: TemplateExports, template: ImmutableListTemplate) {
  const { list, placeholder } = template
  exports[template.code] = <ListTemplateExport>{
    mode: 'list',
    args: {
      enter: (action, render) => render(list),
      search: (action, searchWord, render) => {
        if (template.search) {
          template.search(action, searchWord, render)
        } else {
          searchList(list, searchWord, render)
        }
      },
      select: (action, item: ImmutableListItem) => item.handler(action),
      placeholder
    }
  }
}

export interface MutableListTemplate extends ListTemplate {
  /**
   * 动态获取的列表数据，用于默认搜索，在实现类中定义后可直接使用。可以忽略
   */
  $list?: Array<ListItem>

  enter(action: Action, render: ListRenderFunction): void

  select(action: Action, item: ListItem): void
}

/**
 * 可变列表模板，列表项是动态的
 */
export function mutableListTemplate(exports: TemplateExports, template: MutableListTemplate) {
  const { placeholder } = template
  exports[template.code] = <ListTemplateExport>{
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
          searchList(template.$list, searchWord, render)
        }
      },
      select: (action, item) => template.select(action, item),
      placeholder
    }
  }
}

class TemplateBuilder {
  private readonly templates: TemplateExports = {}

  none(...templates: Array<NoneTemplate>) {
    for (const template of templates) {
      noneTemplate(this.templates, template)
    }
    return this
  }

  immutableList(...templates: Array<ImmutableListTemplate>) {
    for (const template of templates) {
      immutableListTemplate(this.templates, template)
    }
    return this
  }

  mutableList(...templates: Array<MutableListTemplate>) {
    for (const template of templates) {
      mutableListTemplate(this.templates, template)
    }
    return this
  }

  build() {
    return this.templates
  }
}

export function templateBuilder() {
  return new TemplateBuilder()
}
