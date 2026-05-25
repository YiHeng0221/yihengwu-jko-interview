import { z } from 'zod'

export const CharityWireSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  tab: z.enum(['ORG', 'CAMPAIGN', 'MERCHANDISE']),
  category_code: z.string(),
  logo_url: z.string().nullable(),
  amount_raised: z.number().int(),
  amount_goal: z.number().int().nullable(),
  created_at: z.string().datetime(),
  banner_image_url: z.string().nullable(),
  org_name: z.string().nullable(),
  tags: z.array(z.string()),
  product_image_url: z.string().nullable(),
  price_ntd: z.number().int().nullable(),
})

export const CharityListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  category: z.enum(['ORG', 'CAMPAIGN', 'MERCHANDISE']).optional(),
  q: z.string().min(1).optional(),
})

export const CharityListResponseSchema = z.object({
  items: z.array(CharityWireSchema),
  next_cursor: z.string().nullable(),
})

export type CharityWire = z.infer<typeof CharityWireSchema>

// shape 對齊 plugins/zod-validation.ts setErrorHandler
export const ErrorIssueSchema = z.object({
  path: z.string(),
  message: z.string(),
  code: z.string(),
})
export const ErrorSchema = z.object({
  error: z.literal('invalid'),
  issues: z.array(ErrorIssueSchema).optional(),
})
