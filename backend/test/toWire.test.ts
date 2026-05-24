import { describe, expect, it } from 'vitest'
import { charityToWire } from '../src/lib/toWire.js'

describe('charityToWire', () => {
  const createdAt = new Date('2026-05-01T00:00:00.000Z')

  it('maps camelCase fields to snake_case wire shape', () => {
    const wire = charityToWire({
      id: 'clxxx',
      title: 'ACC 中華耆幼關懷協會',
      description: '你身上有光，能照亮不確定的黑暗',
      tab: 'ORG',
      categoryCode: 'ELDER_CARE',
      logoUrl: 'https://example.com/logo.png',
      amountRaised: 12345,
      amountGoal: 50000,
      createdAt,
    })

    expect(wire).toEqual({
      id: 'clxxx',
      title: 'ACC 中華耆幼關懷協會',
      description: '你身上有光，能照亮不確定的黑暗',
      tab: 'ORG',
      category_code: 'ELDER_CARE',
      logo_url: 'https://example.com/logo.png',
      amount_raised: 12345,
      amount_goal: 50000,
      created_at: '2026-05-01T00:00:00.000Z',
    })
  })

  it('handles nullable logoUrl and amountGoal', () => {
    const wire = charityToWire({
      id: 'clyyy',
      title: 'Test',
      description: 'Test desc',
      tab: 'CAMPAIGN',
      categoryCode: 'EDUCATION_ADVOCACY',
      logoUrl: null,
      amountRaised: 0,
      amountGoal: null,
      createdAt,
    })

    expect(wire.logo_url).toBeNull()
    expect(wire.amount_goal).toBeNull()
  })

  it('serialises createdAt as ISO string', () => {
    const wire = charityToWire({
      id: 'clzzz',
      title: 'T',
      description: 'D',
      tab: 'MERCHANDISE',
      categoryCode: 'MEDIA',
      logoUrl: null,
      amountRaised: 0,
      amountGoal: null,
      createdAt,
    })

    expect(wire.created_at).toBe('2026-05-01T00:00:00.000Z')
  })
})
