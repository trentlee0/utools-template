import { Action } from './action'

export interface TemplateExports {
  [code: string]: TemplateExport
}

export type TemplateExport =
  | NoneTemplateExport
  | ListTemplateExport
  | DocTemplateExport

/**
 * 无 UI 模式模板
 */
export interface NoneTemplateExport {
  mode: 'none'
  args: NoneTemplateArgs
}

export interface NoneTemplateArgs {
  /**
   * 进入插件时调用
   */
  enter(action: Action): void
}

/**
 * 列表模式模板
 */
export interface ListTemplateExport {
  mode: 'list'
  args: ListTemplateArgs
}

export interface ListItem {
  title: string
  description?: string
  icon?: string

  [prop: string]: any
}

/**
 * 渲染列表数据函数
 */
export type ListRenderFunction = (list: Array<ListItem>) => void

export interface ListTemplateArgs {
  /**
   * 输入框占位符
   * @default "搜索"
   */
  placeholder?: string

  /**
   * 进入插件时调用
   */
  enter(action: Action, render: ListRenderFunction): void

  /**
   * 输入框改变时调用
   */
  search(action: Action, searchWord: string, render: ListRenderFunction): void

  /**
   * 使用回车键选择某项时调用
   */
  select(action: Action, item: ListItem, render: ListRenderFunction): void
}

/**
 * 文档模式模板
 */
export interface DocTemplateExport {
  mode: 'doc'
  args: DocTemplateArgs
}

export interface DocIndex {
  /**
   * 标题
   */
  t: string

  /**
   * 描述
   */
  d: string

  /**
   * 页面
   */
  p: string
}

export interface DocTemplateArgs {
  /**
   * 输入框占位符
   * @default "搜索"
   */
  placeholder?: string

  /**
   * 文档索引集合
   */
  indexes: Array<DocIndex>
}
