export abstract class AbstractStorage {
  abstract get<T>(key: string): T | null

  abstract like<T>(prefix: string): T[]

  abstract set(key: string, value: any): void

  abstract remove(key: string): void

  getOrDefault<T>(key: string, defaultVal: T): T {
    return this.get<T>(key) ?? defaultVal
  }
}

class UToolsSyncStorage extends AbstractStorage {
  get<T>(key: string): T | null {
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
  private readonly storage: AbstractStorage = new UToolsSyncStorage()

  private localKey(key: string) {
    return `${utools.getNativeId()}/${key}`
  }

  get<T>(key: string): T | null {
    return this.storage.get<T>(this.localKey(key))
  }

  like<T>(prefix: string): T[] {
    return this.storage.like<T>(this.localKey(prefix))
  }

  set(key: string, value: any): void {
    this.storage.set(this.localKey(key), value)
  }

  remove(key: string): void {
    this.storage.remove(this.localKey(key))
  }
}

class BrowserStorage extends AbstractStorage {
  get<T>(key: string): T | null {
    const value = localStorage.getItem(key)
    return value !== null ? JSON.parse(value) : null
  }

  like<T>(prefix: string): T[] {
    const list: T[] = []
    for (const key in localStorage) {
      if (key.startsWith(prefix)) {
        list.push(JSON.parse(localStorage[key]))
      }
    }
    return list
  }

  set(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value))
  }

  remove(key: string): void {
    localStorage.removeItem(key)
  }
}

export const sync = new UToolsSyncStorage()

export const local = new UToolsLocalStorage()

export const browser = new BrowserStorage()
