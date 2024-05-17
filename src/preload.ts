import {
  exec,
  execFile,
  execFileSync,
  ExecOptions,
  spawn,
  SpawnOptionsWithoutStdio
} from 'node:child_process'
import { hideAndOutPlugin } from './common'

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
 * @param inputs 标准输入
 * @param options 选项
 */
export function spawnCommand(
  command: string,
  args: string[],
  inputs?: string[],
  options?: SpawnOptionsWithoutStdio
) {
  return new Promise<CommandReturn>((resolve, reject) => {
    const child = spawn(command, args, options)
    if (inputs !== undefined && inputs.length > 0) {
      for (const input of inputs) {
        child.stdin.write(input)
      }
      child.stdin.end()
    }

    let stderr = Buffer.from('')
    child.stderr.on('data', (chunk) => (stderr += chunk))

    let stdout = Buffer.from('')
    child.stdout.on('data', (chunk) => (stdout += chunk))

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout: stdout.toString(), kill: () => child.kill() })
      } else {
        reject(new Error(stderr.toString()))
      }
    })

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

/**
 * 执行 AppleScript 脚本
 * @param script  脚本
 */
export async function execAppleScript(script: string) {
  return new Promise<CommandReturn>((resolve, reject) => {
    const child = execFile('osascript', ['-e', script], (err, stdout) => {
      if (err) {
        reject(err)
      } else {
        resolve({ stdout: stdout.toString(), kill: () => child.kill() })
      }
    })
  })
}

/**
 * 执行 AppleScript 脚本
 * @param script  脚本
 */
export function execAppleScriptSync(script: string) {
  return execFileSync('osascript', ['-e', script]).toString()
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
