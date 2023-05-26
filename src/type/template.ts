import { Action } from './action'

export interface TemplateExports {
  [code: string]: TemplateExport
}

export interface TemplateExport {
  mode: 'none' | 'list'
  args: NoneTemplateArgs | ListTemplateArgs
}

export interface NoneTemplateExport extends TemplateExport {
  mode: 'none'
  args: NoneTemplateArgs
}

export interface ListTemplateExport extends TemplateExport {
  mode: 'list'
  args: ListTemplateArgs
}

export interface NoneTemplateArgs {
  enter(action: Action): void
}

export interface ListItem {
  title: string
  description?: string
  icon?: string

  [prop: string]: any
}

export type ListRenderFunction = (list: Array<ListItem>) => void

export interface ListTemplateArgs {
  placeholder?: string

  enter(action: Action, render: ListRenderFunction): void

  search(action: Action, searchWord: string, render: ListRenderFunction): void

  select(action: Action, item: ListItem, render: ListRenderFunction): void
}
