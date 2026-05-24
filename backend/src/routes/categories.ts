import type { FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { CATEGORIES } from '../lib/categories.js'

const CategoryItemSchema = z.object({
  code: z.string(),
  label: z.string(),
})

export const CategoriesResponseSchema = z.object({
  items: z.array(CategoryItemSchema),
})

export const categoriesRoute: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>()

  app.get(
    '/categories',
    {
      schema: {
        response: { 200: CategoriesResponseSchema },
      },
    },
    async (_, reply) => {
      reply.header('Cache-Control', 'public, max-age=86400')
      return { items: [...CATEGORIES] }
    },
  )
}
