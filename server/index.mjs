import { createServer } from 'node:http'
import { handleApi } from './api.mjs'
import { serverConfig } from './config.mjs'
import { sendJson } from './http.mjs'
import { serveStatic } from './staticFiles.mjs'

const mode = process.argv.includes('--api-only') ? 'api' : 'full'
const port = mode === 'api' ? serverConfig.devApiPort : serverConfig.port

if (!serverConfig.adminPassword) {
  console.warn('ADMIN_PASSWORD is not set. Admin login will be disabled until it is configured.')
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host}`)

    if (await handleApi(request, response, url)) {
      return
    }

    if (mode === 'api') {
      sendJson(response, 404, { error: 'Not found' })
      return
    }

    await serveStatic(request, response, url)
  } catch (error) {
    console.error(error)
    sendJson(response, 500, { error: 'Internal server error' })
  }
})

server.listen(port, serverConfig.host, () => {
  console.log(`PHOENIX Lab ${mode === 'api' ? 'API' : 'server'} listening at http://${serverConfig.host}:${port}`)
})
