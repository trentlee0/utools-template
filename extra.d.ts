export type ActionType = 'text' | 'img' | 'regex' | 'over' | 'files' | 'window'

export type FilesPayload = Array<{
  isFile: boolean
  isDirectory: boolean
  name: string
  path: string
}>

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

export type Payload = string | FilesPayload | WindowPayload

export interface Action {
  code: string
  type: ActionType
  payload: Payload
}
