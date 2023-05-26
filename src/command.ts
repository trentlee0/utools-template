import { exec, ExecOptions, spawn, SpawnOptionsWithoutStdio } from 'node:child_process'

export interface CommandReturn {
  stdout: string
  kill: () => boolean
}

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

export function spawnCommand(command: string, args: string[], options?: SpawnOptionsWithoutStdio, inputs?: string[]) {
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
    child.on('close', () => resolve({ stdout: stdout.toString(), kill: () => child.kill() }))
    child.on('error', reject)
  })
}

export async function execPowerShell(script: string) {
  return await execCommand(script, { shell: 'powershell.exe' })
}

function escapeQuoteMark(s: string) {
  return s.replaceAll(/"/g, '\\"')
}

export async function execAppleScript(script: string, raw?: boolean) {
  return await execCommand(`osascript -e "${raw ? script : escapeQuoteMark(script)}"`)
}

export function hideAndOutPlugin() {
  utools.hideMainWindow()
  utools.outPlugin()
}

/**
 * 运行脚本，Windows 上为 PowerShell、macOS 上为 AppleScript，Linux 上为 Shell。在执行脚本之前会执行 `hideAndOutPlugin()`
 *
 * @param script 脚本
 * @param defaultShell 是否使用各系统默认 Shell 执行，默认为 `false`
 */
export async function execScript(script: string, defaultShell: boolean = false) {
  hideAndOutPlugin()

  if (defaultShell) return execCommand(script)
  if (utools.isWindows()) return execPowerShell(script)
  if (utools.isMacOS()) return execAppleScript(script)
  return execCommand(script)
}
