import Fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { healthRoute } from './routes/health.js'

export async function buildApp() {
  const app = Fastify({
    logger: true,
  })

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  await app.register(healthRoute)

  return app
}
