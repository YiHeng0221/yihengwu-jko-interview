import type { Prisma } from '@prisma/client'
import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { CursorDecodeError, decodeCursor, encodeCursor } from '../lib/cursor.js'
import { prisma } from '../lib/prisma.js'
import { CharityListQuerySchema, CharityListResponseSchema } from '../lib/schemas.js'
import { charityToWire } from '../lib/toWire.js'

// 對齊 plugins/zod-validation.ts setErrorHandler 的實際回傳 shape：
// `{ error: 'invalid', issues: [{ path, message, code }] }`
// FE 用 openapi.json 做 codegen 才能拿到正確型別。
const ErrorIssueSchema = z.object({
  path: z.string(),
  message: z.string(),
  code: z.string(),
})
const ErrorSchema = z.object({
  error: z.literal('invalid'),
  issues: z.array(ErrorIssueSchema).optional(),
})

export const charitiesRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  app.get(
    '/charities',
    {
      schema: {
        querystring: CharityListQuerySchema,
        response: { 200: CharityListResponseSchema, 400: ErrorSchema },
      },
    },
    async (request, reply) => {
      const { cursor: cursorToken, limit, category, q } = request.query

      let cursor: { created_at: string; id: string } | undefined
      if (cursorToken !== undefined) {
        try {
          cursor = decodeCursor(cursorToken)
        } catch (err) {
          if (err instanceof CursorDecodeError) {
            return reply.status(400).send(err.body)
          }
          throw err
        }
      }

      const conditions: Prisma.CharityWhereInput[] = []

      if (category !== undefined) {
        conditions.push({ tab: category })
      }

      if (q !== undefined) {
        conditions.push({
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        })
      }

      if (cursor !== undefined) {
        const cursorDate = new Date(cursor.created_at)
        conditions.push({
          OR: [
            { createdAt: { lt: cursorDate } },
            { AND: [{ createdAt: cursorDate }, { id: { lt: cursor.id } }] },
          ],
        })
      }

      const where: Prisma.CharityWhereInput =
        conditions.length === 0
          ? {}
          : conditions.length === 1
            ? conditions[0]!
            : { AND: conditions }

      const rows = await prisma.charity.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: limit + 1,
      })

      const hasNext = rows.length > limit
      const pageRows = hasNext ? rows.slice(0, limit) : rows
      const lastRow = pageRows[pageRows.length - 1]

      const next_cursor =
        hasNext && lastRow !== undefined
          ? encodeCursor({ created_at: lastRow.createdAt.toISOString(), id: lastRow.id })
          : null

      return {
        items: pageRows.map(charityToWire),
        next_cursor,
      }
    },
  )
}
