interface Action {
  code: string
  type: string
  payload: any
}

interface NoneInnerOption {
  mode: 'none'
  args: {
    enter: (action: Action) => void
  }
}

interface ListItem {
  title: string
  description?: string
  icon?: string

  [prop: string]: any
}

type ListRenderFn = (list: Array<ListItem>) => void

interface ListInnerOption {
  mode: 'list'
  args: {
    enter: (action: Action, render: ListRenderFn) => void
    search: (action: Action, searchWord: string, render: ListRenderFn) => void
    select: (action: Action, item: ListItem, render: ListRenderFn) => void
    placeholder?: string
  }
}

interface TemplatesHolder {
  [code: string]: NoneInnerOption | ListInnerOption
}

interface Feature {
  code: string
  icon?: string
  explain?: string
  cmds: Array<string>
}

interface Template extends Feature {
}

// ===================== NoneTemplate =====================

export interface NoneTemplate extends Template {
  handler: () => void
}

export function noneTemplate(holder: TemplatesHolder, template: NoneTemplate) {
  holder[template.code] = <NoneInnerOption>{
    mode: 'none',
    args: {
      enter: () => template.handler()
    }
  }
}

// ===================== ListTemplate =====================

interface ListTemplate extends Template {
  $state: Array<ListItem>
  descSearchable?: boolean
  placeholder?: string
}

interface ImmutableListItem extends ListItem {
  handler: () => void
}

export interface ImmutableListTemplate extends ListTemplate {
  list: Array<ImmutableListItem>
}

function searchList(list: Array<ListItem>, searchWord: string, descSearchable?: boolean) {
  searchWord = searchWord.toLowerCase()
  return list.filter(({ title, description }) =>
    title.toLowerCase().includes(searchWord) ||
    (descSearchable && description?.toLowerCase().includes(searchWord))
  )
}

export function immutableListTemplate(holder: TemplatesHolder, template: ImmutableListTemplate) {
  const { list, descSearchable, placeholder } = template
  template.$state = list

  holder[template.code] = <ListInnerOption>{
    mode: 'list',
    args: {
      enter: (action, render) => render(list),
      search: (action, searchWord, render) => {
        render(searchList(list, searchWord, descSearchable))
      },
      select: (action, item) => (item as ImmutableListItem).handler(),
      placeholder
    }
  }
}

function bind<T extends Function>(fn: T, context: object): T {
  // @ts-ignore
  return (...args: any) => fn.apply(context, args)
}

export interface MutableListTemplate extends ListTemplate {
  data: () => { [prop: string]: any }
  onlyEnterOnce?: boolean
  onEnter: (render: ListRenderFn) => void
  onSelect: (item: ListItem) => void
}

export function mutableListTemplate(holder: TemplatesHolder, template: MutableListTemplate) {
  const { descSearchable, onlyEnterOnce, placeholder } = template
  const dataContext = template.data()
  const onEnter = bind(template.onEnter, dataContext)
  const onSelect = bind(template.onSelect, dataContext)

  holder[template.code] = <ListInnerOption>{
    mode: 'list',
    args: {
      enter: (action, render) => {
        if (onlyEnterOnce && template.$state?.length) {
          return render(template.$state)
        }
        onEnter((list) => {
          template.$state = list
          render(list)
        })
      },
      search: (action, searchWord, render) => {
        if (!template.$state?.length) return
        render(searchList(template.$state, searchWord, descSearchable))
      },
      select: (action, item) => onSelect(item),
      placeholder
    }
  }
}


class TemplateBuilder {
  private readonly templates: TemplatesHolder = {}

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

interface ExportedTemplates {
  [exportedName: string]: Template | Array<Template>
}

export function generateFeatures(exportedTemplates: ExportedTemplates) {
  const features: Feature[] = []
  for (const prop in exportedTemplates) {
    const template = exportedTemplates[prop]
    if (Array.isArray(template)) {
      features.push(...template)
    } else {
      features.push(template)
    }
  }
  return features
}
