import fp from 'fastify-plugin'
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'

export const zodValidationPlugin = fp(
  async (fastify) => {
    fastify.setErrorHandler((error, _request, reply) => {
      if (hasZodFastifySchemaValidationErrors(error)) {
        return reply.status(400).send({
          error: 'invalid' as const,
          issues: error.validation.map((v) => ({
            path: v.instancePath,
            message: v.message,
            code: v.keyword,
          })),
        })
      }
      return reply.send(error)
    })
  },
  { name: 'zod-validation' },
)
