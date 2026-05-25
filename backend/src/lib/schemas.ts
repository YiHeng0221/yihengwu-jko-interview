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

// 通用 error envelope schemas — 跟 plugins/zod-validation.ts 的 setErrorHandler
// 實際回傳 shape 對齊：`{ error: 'invalid', issues: [{ path, message, code }] }`。
// 每個 route 共用，不在 route 檔案各自定義（ADR-0004 single source of truth）。
export const ErrorIssueSchema = z.object({
  path: z.string(),
  message: z.string(),
  code: z.string(),
})
export const ErrorSchema = z.object({
  error: z.literal('invalid'),
  issues: z.array(ErrorIssueSchema).optional(),
})
