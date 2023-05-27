import {
  exec,
  ExecOptions,
  spawn,
  SpawnOptionsWithoutStdio
} from 'node:child_process'

export interface CommandReturn {
  stdout: string
  kill: () => boolean
}

/**
 * 运行命令
 * @param command 完整命令
 * @param options 选项
 */
export async function execCommand(command: string, options?: ExecOptions) {
  return new Promise<CommandReturn>((resolve, reject) => {
    const child = exec(command, options, (err, stdout) => {
      if (err) {
        reject(err)
      } else {
        resolve({ stdout: stdout.toString(), kill: () => child.kill() })
      }
    })
  })
}

/**
 * 运行命令
 * @param command 命令名
 * @param args 命令参数
 * @param options 选项
 * @param inputs 标准输入
 */
export function spawnCommand(
  command: string,
  args: string[],
  options?: SpawnOptionsWithoutStdio,
  inputs?: string[]
) {
  return new Promise<CommandReturn>((resolve, reject) => {
    const child = spawn(command, args, options)
    if (inputs !== undefined) {
      for (const input of inputs) {
        child.stdin.write(input)
      }
      child.stdin.end()
    }

    let stdout = Buffer.from('')
    child.stdout.on('data', (out) => (stdout += out))
    child.on('close', () =>
      resolve({ stdout: stdout.toString(), kill: () => child.kill() })
    )
    child.on('error', reject)
  })
}

/**
 * 执行 PowerShell 脚本
 * @param script 脚本
 */
export async function execPowerShell(script: string) {
  return await execCommand(script, { shell: 'powershell.exe' })
}

function escape(s: string) {
  return s.replaceAll(/"/g, '\\"')
}

/**
 * 执行 AppleScript 脚本
 * @param script  脚本
 * @param raw 是否需要转义字符 `"`，默认为 `false`
 */
export async function execAppleScript(script: string, raw: boolean = false) {
  return await execCommand(`osascript -e "${raw ? script : escape(script)}"`)
}

/**
 * 隐藏并退出当前 uTools 插件
 */
export function hideAndOutPlugin() {
  utools.hideMainWindow()
  utools.outPlugin()
}

/**
 * 执行脚本，Windows 上为 PowerShell、macOS 上为 AppleScript，Linux 上为 Shell。在执行脚本之前会执行 `hideAndOutPlugin()`
 * @param script 脚本
 * @param defaultShell 是否使用各系统默认 Shell 执行，默认为 `false`
 */
export async function execScript(
  script: string,
  defaultShell: boolean = false
) {
  hideAndOutPlugin()

  if (defaultShell) return execCommand(script)
  if (utools.isWindows()) return execPowerShell(script)
  if (utools.isMacOS()) return execAppleScript(script)
  return execCommand(script)
}
