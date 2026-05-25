import { z } from 'zod'
import { CHARITY_TABS } from '../constants'

const charityItemSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    tab: z.enum(CHARITY_TABS),
    category_code: z.string(),
    logo_url: z.string().url().nullable().optional(),
    amount_raised: z.number().int(),
    amount_goal: z.number().int().nullable().optional(),
    created_at: z.string().datetime(),
    // tab-specific nullable fields (polymorphic option A)
    banner_image_url: z.string().url().nullable().optional(),
    org_name: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    product_image_url: z.string().url().nullable().optional(),
    price_ntd: z.number().int().nullable().optional(),
  })
  .transform((raw) => ({
    id: raw.id,
    title: raw.title,
    description: raw.description,
    tab: raw.tab,
    categoryCode: raw.category_code,
    logoUrl: raw.logo_url ?? null,
    amountRaised: raw.amount_raised,
    amountGoal: raw.amount_goal ?? null,
    createdAt: raw.created_at,
    bannerImageUrl: raw.banner_image_url ?? null,
    orgName: raw.org_name ?? null,
    tags: raw.tags ?? [],
    productImageUrl: raw.product_image_url ?? null,
    priceNtd: raw.price_ntd ?? null,
  }))

export const charitiesListResponseSchema = z
  .object({
    items: z.array(charityItemSchema),
    next_cursor: z.string().nullable(),
  })
  .transform((data) => ({
    items: data.items,
    nextCursor: data.next_cursor,
  }))

export type CharityItem = z.infer<typeof charityItemSchema>
export type CharitiesListResponse = z.infer<typeof charitiesListResponseSchema>
