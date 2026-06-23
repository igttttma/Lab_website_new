import { spawn } from 'node:child_process'

const isWindows = process.platform === 'win32'

function run(label, command, args, env = {}) {
  const child = spawn(command, args, {
    env: { ...process.env, ...env },
    shell: isWindows,
    stdio: ['inherit', 'pipe', 'pipe'],
  })

  child.stdout.on('data', (data) => process.stdout.write(`[${label}] ${data}`))
  child.stderr.on('data', (data) => process.stderr.write(`[${label}] ${data}`))
  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`${label} exited with code ${code}`)
      process.exit(code)
    }
  })

  return child
}

const api = run('api', 'node', ['server/index.mjs', '--api-only'])
const vite = run('vite', 'npx', ['vite'], { API_PROXY_TARGET: 'http://127.0.0.1:4174' })

function shutdown() {
  api.kill()
  vite.kill()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
