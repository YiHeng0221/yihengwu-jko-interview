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
import { charitiesRoute, type CharitiesDb } from './routes/charities.js'
import { healthRoute } from './routes/health.js'

export async function buildApp(opts?: { prisma?: CharitiesDb }) {
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

  // main 的 swaggerPlugin（line 28）已處理 OpenAPI registration；
  // 不再 inline 重複 register。prisma client 留下供 charitiesRoute 用。
  const prisma: CharitiesDb = opts?.prisma ?? new PrismaClient()

  await app.register(healthRoute)
  await app.register(charitiesRoute, { prisma })

  return app
}
