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

export type CharityWire = {
  id: string
  title: string
  description: string
  tab: CharityTab
  category_code: string
  logo_url: string | null
  amount_raised: number
  amount_goal: number | null
  created_at: string
}

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
