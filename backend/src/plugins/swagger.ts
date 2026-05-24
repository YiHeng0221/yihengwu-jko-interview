import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import fp from 'fastify-plugin'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'

export const swaggerPlugin = fp(
  async (fastify) => {
    await fastify.register(swagger, {
      openapi: {
        info: {
          title: '街口公益捐款 API',
          description: '街口公益捐款列表 MVP',
          version: '1.0.0',
        },
      },
      transform: jsonSchemaTransform,
    })
    await fastify.register(swaggerUi, { routePrefix: '/docs' })
  },
  { name: 'swagger' },
)
