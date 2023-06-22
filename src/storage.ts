export interface Storable {
  get<T>(key: string): T | null

  get<T>(key: string, defaultVal: T): T

  like<T>(prefix: string): T[]

  set(key: string, value: any): void

  remove(key: string): void
}

export abstract class AbstractStorage implements Storable {
  get<T>(key: string, defaultVal?: T): T | null {
    if (defaultVal !== undefined) {
      return this.getItem(key) ?? defaultVal
    }
    return this.getItem(key)
  }

  protected abstract getItem<T>(key: string): T | null

  abstract like<T>(prefix: string): T[]

  abstract set(key: string, value: any): void

  abstract remove(key: string): void
}

class UToolsSyncStorage extends AbstractStorage {
  protected getItem<T>(key: string): T | null {
    return utools.dbStorage.getItem(key)
  }

  like<T>(prefix: string): T[] {
    const docs = utools.db.allDocs(prefix)
    const key = 'value'
    return docs.map((doc) => doc[key])
  }

  set(key: string, value: any): void {
    utools.dbStorage.setItem(key, value)
  }

  remove(key: string): void {
    utools.dbStorage.removeItem(key)
  }
}

class UToolsLocalStorage extends AbstractStorage {
  private readonly storage: Storable = new UToolsSyncStorage()

  private localKey(key: string) {
    return `${utools.getNativeId()}/${key}`
  }

  protected getItem<T>(key: string) {
    return this.storage.get<T>(this.localKey(key))
  }

  like<T>(prefix: string) {
    return this.storage.like<T>(this.localKey(prefix))
  }

  set(key: string, value: any) {
    this.storage.set(this.localKey(key), value)
  }

  remove(key: string) {
    this.storage.remove(this.localKey(key))
  }
}

export class BrowserStorageAdapter extends AbstractStorage {
  constructor(private storage: Storage) {
    super()
  }

  protected getItem<T>(key: string): T | null {
    const value = this.storage.getItem(key)
    return value !== null ? JSON.parse(value) : null
  }

  like<T>(prefix: string) {
    const list: T[] = []
    for (const key in this.storage) {
      if (key.startsWith(prefix)) {
        list.push(JSON.parse(this.storage[key]))
      }
    }
    return list
  }

  set(key: string, value: any) {
    this.storage.setItem(key, JSON.stringify(value))
  }

  remove(key: string) {
    this.storage.removeItem(key)
  }
}

/**
 * 同步存储，在所有设备上同步
 */
export const sync: Storable = new UToolsSyncStorage()

/**
 * 本地存储，只在本机同步
 */
export const local: Storable = new UToolsLocalStorage()
