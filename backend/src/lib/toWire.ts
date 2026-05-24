import { z } from 'zod'

export type CharityTab = 'ORG' | 'CAMPAIGN' | 'MERCHANDISE'

export type CharityRow = {
  id: string
  title: string
  description: string
  tab: CharityTab
  categoryCode: string
  logoUrl: string | null
  amountRaised: number
  amountGoal: number | null
  createdAt: Date
}

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

export type CharityWire = z.infer<typeof CharityWireSchema>

export function charityToWire(row: CharityRow): CharityWire {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    tab: row.tab,
    category_code: row.categoryCode,
    logo_url: row.logoUrl,
    amount_raised: row.amountRaised,
    amount_goal: row.amountGoal,
    created_at: row.createdAt.toISOString(),
  }
}
