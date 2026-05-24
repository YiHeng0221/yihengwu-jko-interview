import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import type { Charity, Prisma } from '@prisma/client'
import { CursorDecodeError, decodeCursor, encodeCursor } from '../lib/cursor.js'
import { charityToWire } from '../lib/toWire.js'

export type CharitiesDb = {
  charity: {
    findMany(args?: {
      where?: Prisma.CharityWhereInput
      orderBy?: Prisma.CharityOrderByWithRelationInput | Prisma.CharityOrderByWithRelationInput[]
      take?: number
    }): Promise<Charity[]>
  }
}

type CharitiesRouteOptions = {
  prisma: CharitiesDb
}

const CharityWireSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  tab: z.enum(['ORG', 'CAMPAIGN', 'MERCHANDISE']),
  category_code: z.string(),
  logo_url: z.string().nullable(),
  amount_raised: z.number().int(),
  amount_goal: z.number().int().nullable(),
  created_at: z.string().datetime(),
})

const ListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  category: z.enum(['ORG', 'CAMPAIGN', 'MERCHANDISE']).optional(),
  q: z.string().min(1).optional(),
})

const ListResponseSchema = z.object({
  items: z.array(CharityWireSchema),
  next_cursor: z.string().nullable(),
})

const InvalidResponseSchema = z.object({
  error: z.literal('invalid'),
  issues: z.array(
    z.object({ path: z.string(), message: z.string(), code: z.string() }),
  ),
})

export const charitiesRoute: FastifyPluginAsync<CharitiesRouteOptions> = async (
  fastify,
  opts,
) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  app.get(
    '/charities',
    {
      schema: {
        querystring: ListQuerySchema,
        response: { 200: ListResponseSchema, 400: InvalidResponseSchema },
      },
    },
    async (request, reply) => {
      const { cursor, limit, category, q } = request.query

      const where: Prisma.CharityWhereInput = {}

      if (category) {
        where.tab = category
      }

      if (q) {
        where.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ]
      }

      if (cursor) {
        try {
          const { created_at, id } = decodeCursor(cursor)
          where.AND = [
            {
              OR: [
                { createdAt: { lt: new Date(created_at) } },
                { createdAt: { equals: new Date(created_at) }, id: { lt: id } },
              ],
            },
          ]
        } catch (error) {
          if (error instanceof CursorDecodeError) {
            return reply.status(400).send({
              error: 'invalid' as const,
              issues: [{ path: 'cursor', message: 'invalid cursor', code: 'invalid' }],
            })
          }
          throw error
        }
      }

      const rows = await opts.prisma.charity.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: limit + 1,
      })

      const hasMore = rows.length > limit
      const pageRows = hasMore ? rows.slice(0, limit) : rows
      const last = pageRows[pageRows.length - 1]
      const next_cursor =
        hasMore && last
          ? encodeCursor({ created_at: last.createdAt.toISOString(), id: last.id })
          : null

      return { items: pageRows.map(charityToWire), next_cursor }
    },
  )
}
