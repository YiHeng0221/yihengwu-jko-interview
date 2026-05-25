import { describe, expect, it } from 'vitest'
import { charityToWire } from '../src/lib/toWire.js'

describe('charityToWire', () => {
  const createdAt = new Date('2026-05-01T00:00:00.000Z')

  const POLY_NULL = {
    bannerImageUrl: null,
    orgName: null,
    tags: [],
    productImageUrl: null,
    priceNtd: null,
  }

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
      ...POLY_NULL,
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
      banner_image_url: null,
      org_name: null,
      tags: [],
      product_image_url: null,
      price_ntd: null,
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
      ...POLY_NULL,
    })

    expect(wire.logo_url).toBeNull()
    expect(wire.amount_goal).toBeNull()
  })

  it('maps polymorphic CAMPAIGN fields', () => {
    const wire = charityToWire({
      id: 'cam-1',
      title: 'Campaign A',
      description: 'desc',
      tab: 'CAMPAIGN',
      categoryCode: 'CHILD_CARE',
      logoUrl: null,
      amountRaised: 0,
      amountGoal: null,
      createdAt,
      bannerImageUrl: 'https://picsum.photos/seed/x/640/360',
      orgName: '世界展望會',
      tags: ['兒少照護', '弱勢扶貧'],
      productImageUrl: null,
      priceNtd: null,
    })
    expect(wire.banner_image_url).toBe('https://picsum.photos/seed/x/640/360')
    expect(wire.org_name).toBe('世界展望會')
    expect(wire.tags).toEqual(['兒少照護', '弱勢扶貧'])
  })

  it('maps polymorphic MERCHANDISE fields', () => {
    const wire = charityToWire({
      id: 'mer-1',
      title: 'Item',
      description: 'desc',
      tab: 'MERCHANDISE',
      categoryCode: 'CHILD_CARE',
      logoUrl: null,
      amountRaised: 0,
      amountGoal: null,
      createdAt,
      bannerImageUrl: null,
      orgName: '台灣愛心協會',
      tags: [],
      productImageUrl: 'https://picsum.photos/seed/y/400/400',
      priceNtd: 1500,
    })
    expect(wire.product_image_url).toBe('https://picsum.photos/seed/y/400/400')
    expect(wire.price_ntd).toBe(1500)
    expect(wire.org_name).toBe('台灣愛心協會')
  })

  it('serialises createdAt as UTC ISO string regardless of input offset', () => {
    const nonUtcDate = new Date('2026-05-01T08:00:00+08:00')
    const wire = charityToWire({
      id: 'clzzz',
      title: 'T',
      description: 'D',
      tab: 'MERCHANDISE',
      categoryCode: 'MEDIA',
      logoUrl: null,
      amountRaised: 0,
      amountGoal: null,
      createdAt: nonUtcDate,
      ...POLY_NULL,
    })

    expect(wire.created_at).toBe('2026-05-01T00:00:00.000Z')
  })
})
