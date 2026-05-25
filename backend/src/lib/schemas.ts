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

// ADR-0004: Zod schema 是型別 single source of truth；toWire.ts 從這裡 import
// inferred type，不要在那邊手寫重複 type。
export type CharityWire = z.infer<typeof CharityWireSchema>
