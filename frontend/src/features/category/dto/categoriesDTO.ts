import { z } from 'zod'

const categoryItemSchema = z.object({
  code: z.string(),
  label: z.string(),
})

const categoriesResponseSchema = z.object({
  items: z.array(categoryItemSchema),
})

export type Category = z.infer<typeof categoryItemSchema>

export function parseCategoriesResponse(raw: unknown): Category[] {
  return categoriesResponseSchema.parse(raw).items
}
