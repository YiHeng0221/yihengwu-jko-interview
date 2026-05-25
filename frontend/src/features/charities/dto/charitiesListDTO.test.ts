import { describe, expect, it } from 'vitest'
import { charitiesListResponseSchema } from './charitiesListDTO'

const validItem = {
  id: 'ckabc',
  title: 'ACC 中華耆幼關懷協會',
  description: '幫助長者',
  tab: 'ORG',
  category_codes: ['ELDER_CARE'],
  logo_url: 'https://example.com/logo.png',
  amount_raised: 12345,
  amount_goal: 50000,
  created_at: '2026-05-01T00:00:00.000Z',
}

describe('charitiesListResponseSchema', () => {
  it('maps snake_case fields to camelCase', () => {
    const raw = { items: [validItem], next_cursor: 'cursor123' }
    const result = charitiesListResponseSchema.parse(raw)

    expect(result.nextCursor).toBe('cursor123')
    expect(result.items).toHaveLength(1)

    const item = result.items[0]
    expect(item?.id).toBe('ckabc')
    expect(item?.categoryCodes).toEqual(['ELDER_CARE'])
    expect(item?.logoUrl).toBe('https://example.com/logo.png')
    expect(item?.amountRaised).toBe(12345)
    expect(item?.amountGoal).toBe(50000)
    expect(item?.createdAt).toBe('2026-05-01T00:00:00.000Z')
  })

  it('accepts next_cursor: null', () => {
    const raw = { items: [], next_cursor: null }
    const result = charitiesListResponseSchema.parse(raw)
    expect(result.nextCursor).toBeNull()
    expect(result.items).toHaveLength(0)
  })

  it('coerces missing logo_url to null', () => {
    const { logo_url: _l, ...itemWithoutLogo } = validItem
    const raw = { items: [itemWithoutLogo], next_cursor: null }
    const result = charitiesListResponseSchema.parse(raw)
    expect(result.items[0]?.logoUrl).toBeNull()
  })

  it('coerces missing amount_goal to null', () => {
    const { amount_goal: _g, ...itemWithoutGoal } = validItem
    const raw = { items: [itemWithoutGoal], next_cursor: null }
    const result = charitiesListResponseSchema.parse(raw)
    expect(result.items[0]?.amountGoal).toBeNull()
  })

  it('rejects unknown tab value', () => {
    const raw = { items: [{ ...validItem, tab: 'UNKNOWN' }], next_cursor: null }
    expect(() => charitiesListResponseSchema.parse(raw)).toThrow()
  })

  it('rejects missing required fields', () => {
    const raw = { items: [{ id: 'x' }], next_cursor: null }
    expect(() => charitiesListResponseSchema.parse(raw)).toThrow()
  })

  it('maps CAMPAIGN tab-specific fields', () => {
    const campaignItem = {
      ...validItem,
      tab: 'CAMPAIGN',
      banner_image_url: 'https://example.com/banner.png',
      org_name: '台灣兒童保育協會',
      tags: ['身心障礙服務', '特殊醫療'],
    }
    const raw = { items: [campaignItem], next_cursor: null }
    const result = charitiesListResponseSchema.parse(raw)
    const item = result.items[0]
    expect(item?.bannerImageUrl).toBe('https://example.com/banner.png')
    expect(item?.orgName).toBe('台灣兒童保育協會')
    expect(item?.tags).toEqual(['身心障礙服務', '特殊醫療'])
  })

  it('maps MERCHANDISE tab-specific fields', () => {
    const merchItem = {
      ...validItem,
      tab: 'MERCHANDISE',
      product_image_url: 'https://example.com/product.png',
      org_name: '台灣動物保護協會',
      price_ntd: 740,
    }
    const raw = { items: [merchItem], next_cursor: null }
    const result = charitiesListResponseSchema.parse(raw)
    const item = result.items[0]
    expect(item?.productImageUrl).toBe('https://example.com/product.png')
    expect(item?.orgName).toBe('台灣動物保護協會')
    expect(item?.priceNtd).toBe(740)
  })

  it('defaults tab-specific fields to null/[] when absent', () => {
    const raw = { items: [validItem], next_cursor: null }
    const result = charitiesListResponseSchema.parse(raw)
    const item = result.items[0]
    expect(item?.bannerImageUrl).toBeNull()
    expect(item?.orgName).toBeNull()
    expect(item?.tags).toEqual([])
    expect(item?.productImageUrl).toBeNull()
    expect(item?.priceNtd).toBeNull()
  })
})
