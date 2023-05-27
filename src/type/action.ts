export type Action = StringAction | ImageAction | FilesAction | WindowAction

interface AbstractAction {
  code: string
}

export interface StringAction extends AbstractAction {
  type: 'text' | 'regex' | 'over'

  /**
   * 主输入框文本
   */
  payload: string
}

export interface ImageAction extends AbstractAction {
  type: 'img'

  /**
   * Base64 编码的图片
   */
  payload: string
}

export interface FilesAction extends AbstractAction {
  type: 'files'

  /**
   * 文件列表
   */
  payload: FilesPayload
}

export type FilesPayload = Array<FilePayload>

export interface FilePayload {
  isFile: boolean
  isDirectory: boolean
  name: string
  path: string
}

export interface WindowAction extends AbstractAction {
  type: 'window'

  /**
   * 窗口信息
   */
  payload: WindowPayload
}

export interface WindowPayload {
  id: number
  class: string
  title: string
  x: number
  y: number
  width: number
  height: number
  appPath: string
  pid: number
  app: string
}
