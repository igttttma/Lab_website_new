import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { paths } from './config.mjs'

export async function readContent() {
  const raw = await readFile(paths.content, 'utf8')
  return JSON.parse(raw)
}

export async function writeContent(content) {
  const dir = dirname(paths.content)
  const tempPath = `${paths.content}.tmp`

  await mkdir(dir, { recursive: true })
  await writeFile(tempPath, `${JSON.stringify(content, null, 2)}\n`, 'utf8')
  await rename(tempPath, paths.content)
}
