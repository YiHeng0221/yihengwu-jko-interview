import { z } from 'zod'

const categoryCodeSchema = z
  .enum([
    'CHILD_CARE',
    'ANIMAL_PROTECTION',
    'SPECIAL_MEDICAL',
    'ELDER_CARE',
    'DISABILITY_SERVICE',
    'WOMEN_CARE',
    'SPORTS_DEV',
    'EDUCATION_ADVOCACY',
    'ENV_PROTECTION',
    'MULTI_ETHNIC',
    'MEDIA',
    'PUBLIC_ISSUE',
    'CULTURE_ARTS',
    'COMMUNITY_DEV',
    'POVERTY_RELIEF',
    'INTL_RESCUE',
  ])
  .catch('CHILD_CARE')

const wireItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  tab: z.enum(['ORG', 'CAMPAIGN', 'MERCHANDISE']),
  category_code: categoryCodeSchema,
  logo_url: z.string().nullable(),
  amount_raised: z.number().int(),
  amount_goal: z.number().int().nullable(),
  created_at: z.string(),
})

type WireItem = z.infer<typeof wireItemSchema>

function toItem(raw: WireItem) {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    tab: raw.tab,
    categoryCode: raw.category_code,
    logoUrl: raw.logo_url,
    amountRaised: raw.amount_raised,
    amountGoal: raw.amount_goal,
    createdAt: raw.created_at,
  }
}

export const searchListResponseSchema = z
  .object({
    items: z.array(wireItemSchema).transform((arr) => arr.map(toItem)),
    next_cursor: z.string().nullable(),
  })
  .transform((raw) => ({
    items: raw.items,
    nextCursor: raw.next_cursor,
  }))

export type SearchListResponse = z.infer<typeof searchListResponseSchema>
export type SearchCharityItem = SearchListResponse['items'][number]
