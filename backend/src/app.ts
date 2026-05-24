import compress from '@fastify/compress'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import Fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { genReqId, requestIdPlugin } from './plugins/request-id.js'
import { zodValidationPlugin } from './plugins/zod-validation.js'
import { charitiesRoute } from './routes/charities.js'
import { healthRoute } from './routes/health.js'

export async function buildApp() {
  const app = Fastify({
    logger: { level: process.env['LOG_LEVEL'] ?? 'info' },
    genReqId,
  })

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  await app.register(requestIdPlugin)
  await app.register(zodValidationPlugin)
  await app.register(compress)
  await app.register(helmet)
  await app.register(cors, {
    origin: process.env['ALLOWED_ORIGINS']?.split(',') ??
      (process.env['NODE_ENV'] !== 'production'),
  })
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' })

  if (process.env['NODE_ENV'] === 'development') {
    const { default: swagger } = await import('@fastify/swagger')
    const { default: swaggerUi } = await import('@fastify/swagger-ui')
    await app.register(swagger, { openapi: { info: { title: 'API', version: '0.0.0' } } })
    await app.register(swaggerUi, { routePrefix: '/docs' })
  }

  await app.register(healthRoute)
  await app.register(charitiesRoute)

  return app
}
