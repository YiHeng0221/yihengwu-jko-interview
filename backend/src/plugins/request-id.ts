import { createId } from '@paralleldrive/cuid2'
import fp from 'fastify-plugin'
import type { IncomingMessage } from 'node:http'

export function genReqId(req: IncomingMessage): string {
  const h = req.headers['x-request-id']
  return typeof h === 'string' && h.length > 0 ? h : createId()
}

export const requestIdPlugin = fp(
  async (fastify) => {
    fastify.addHook('onRequest', async (request, reply) => {
      reply.header('x-request-id', request.id)
    })
  },
  { name: 'request-id' },
)
