import compress from '@fastify/compress'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { PrismaClient } from '@prisma/client'
import Fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { genReqId, requestIdPlugin } from './plugins/request-id.js'
import { swaggerPlugin } from './plugins/swagger.js'
import { zodValidationPlugin } from './plugins/zod-validation.js'
import { healthRoute } from './routes/health.js'
import { charitiesDetailRoute } from './routes/charities.js'
import type { CharityDb } from './routes/charities.js'

function makeDefaultDb(): CharityDb {
  let client: PrismaClient | undefined
  return {
    findById: (id) => {
      if (!client) client = new PrismaClient()
      return client.charity.findUnique({ where: { id } })
    },
  }
}

export async function buildApp(opts: { db?: CharityDb } = {}) {
  const db = opts.db ?? makeDefaultDb()

  const app = Fastify({
    logger: { level: process.env['LOG_LEVEL'] ?? 'info' },
    genReqId,
  })

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  await app.register(requestIdPlugin)
  await app.register(zodValidationPlugin)
  await app.register(swaggerPlugin)
  await app.register(compress)
  await app.register(helmet)
  await app.register(cors, {
    origin: process.env['ALLOWED_ORIGINS']?.split(',') ??
      (process.env['NODE_ENV'] !== 'production'),
  })
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' })

  await app.register(healthRoute)
  await app.register(charitiesDetailRoute, { db })

  return app
}
