import { buildApp } from './app.js'

const host = process.env['HOST'] ?? '0.0.0.0'
const port = Number(process.env['PORT'] ?? 3000)

const app = await buildApp()

try {
  await app.listen({ host, port })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
