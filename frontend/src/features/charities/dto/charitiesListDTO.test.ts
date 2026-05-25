import { describe, expect, it } from 'vitest'
import { charitiesListResponseSchema } from './charitiesListDTO'

const validItem = {
  id: 'ckabc',
  title: 'ACC 中華耆幼關懷協會',
  description: '幫助長者',
  tab: 'ORG',
  category_code: 'ELDER_CARE',
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
    expect(item?.categoryCode).toBe('ELDER_CARE')
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
})
