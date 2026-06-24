import { copyFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { paths } from './config.mjs'

const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const backupPath = resolve(paths.root, `backups/lab-${timestamp}.json`)

await mkdir(dirname(backupPath), { recursive: true })
await copyFile(paths.content, backupPath)

console.log(`Content backup written to ${backupPath}`)
