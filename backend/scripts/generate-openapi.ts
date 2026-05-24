import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildApp } from '../src/app.js'

process.env['SKIP_DB'] = 'true'
process.env['LOG_LEVEL'] = 'silent'

const app = await buildApp()
await app.ready()

const spec = app.swagger()
const outPath = join(import.meta.dirname, '../src/generated/openapi.json')
writeFileSync(outPath, JSON.stringify(spec, null, 2) + '\n')

await app.close()
console.log(`openapi.json written to ${outPath}`)
