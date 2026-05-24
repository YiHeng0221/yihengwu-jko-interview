import { buildApp } from './app.js'

const host = process.env['HOST'] ?? '0.0.0.0'
const port = Number(process.env['PORT'] || 3000)

let app: Awaited<ReturnType<typeof buildApp>>
try {
  app = await buildApp()
} catch (err) {
  console.error('App init failed:', err)
  process.exit(1)
}
try {
  await app.listen({ host, port })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
