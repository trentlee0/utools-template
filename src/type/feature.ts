interface AbstractCmd {
  label: string
}

export interface RegexMatchCmd extends AbstractCmd {
  type: 'regex'
  match: string
  minLength?: number
  maxLength?: number
}

export interface OverMatchCmd extends AbstractCmd {
  type: 'over'
  exclude?: string
  minLength?: number
  maxLength?: number
}

export interface ImageMatchCmd extends AbstractCmd {
  type: 'img'
}

export interface FilesMatchCmd extends AbstractCmd {
  type: 'files'
  fileType?: 'file' | 'directory'
  match?: string
  minLength?: number
  maxLength?: number
}

export interface WindowMatchCmd extends AbstractCmd {
  type: 'window'
  match: {
    app?: string[]
    title?: string
    class?: string[]
  }
}

export type Platform = 'darwin' | 'win32' | 'linux'

export interface Feature {
  code: string
  explain: string
  platform?: Array<Platform>
  icon?: string
  cmds: Array<
    | string
    | RegexMatchCmd
    | OverMatchCmd
    | ImageMatchCmd
    | FilesMatchCmd
    | WindowMatchCmd
  >
}
