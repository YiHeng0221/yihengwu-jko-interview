import { describe, expect, it } from 'vitest'
import {
  CATEGORIES,
  CategoryCodeSchema,
  isCategoryCode,
} from '../src/lib/categories.js'

describe('CATEGORIES', () => {
  it('has exactly 17 entries', () => {
    expect(CATEGORIES).toHaveLength(17)
  })

  it('first entry is ALL', () => {
    expect(CATEGORIES[0].code).toBe('ALL')
  })

  it('all entries have non-empty code and label', () => {
    for (const c of CATEGORIES) {
      expect(c.code.length).toBeGreaterThan(0)
      expect(c.label.length).toBeGreaterThan(0)
    }
  })

  it('codes are unique', () => {
    const codes = CATEGORIES.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
  })
})

describe('isCategoryCode', () => {
  it('returns true for valid code', () => {
    expect(isCategoryCode('ALL')).toBe(true)
    expect(isCategoryCode('INTL_RESCUE')).toBe(true)
  })

  it('returns false for invalid values', () => {
    expect(isCategoryCode('INVALID')).toBe(false)
    expect(isCategoryCode('')).toBe(false)
    expect(isCategoryCode(null)).toBe(false)
    expect(isCategoryCode(42)).toBe(false)
  })
})

describe('CategoryCodeSchema', () => {
  it('parses valid code', () => {
    expect(CategoryCodeSchema.parse('CHILD_CARE')).toBe('CHILD_CARE')
  })

  it('rejects invalid code', () => {
    expect(() => CategoryCodeSchema.parse('BAD')).toThrow()
  })
})
