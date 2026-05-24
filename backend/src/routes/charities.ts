import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { charityToWire, CharityWireSchema } from '../lib/toWire.js'
import type { CharityRow } from '../lib/toWire.js'

export interface CharityDb {
  findById(id: string): Promise<CharityRow | null>
}

const NotFoundSchema = z.object({ error: z.literal('not_found') })

export const charitiesDetailRoute: FastifyPluginAsync<{ db: CharityDb }> = async (fastify, opts) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  app.get(
    '/charities/:id',
    {
      schema: {
        params: z.object({ id: z.string().min(1) }),
        response: { 200: CharityWireSchema, 404: NotFoundSchema },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const row = await opts.db.findById(id)
      if (!row) return reply.status(404).send({ error: 'not_found' })
      return charityToWire(row)
    },
  )
}
