import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.js'
import {
  CATEGORIES,
  CategoryCodeSchema,
  isCategoryCode,
} from '../src/lib/categories.js'
import { CategoriesResponseSchema } from '../src/routes/categories.js'

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
    expect(isCategoryCode(undefined)).toBe(false)
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

describe('GET /categories', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = await buildApp()
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('returns 200 with valid shape', async () => {
    const response = await app.inject({ method: 'GET', url: '/categories' })

    expect(response.statusCode).toBe(200)

    const result = CategoriesResponseSchema.safeParse(response.json())
    expect(result.success).toBe(true)
  })

  it('returns exactly 17 items', async () => {
    const response = await app.inject({ method: 'GET', url: '/categories' })
    const body = response.json<{ items: unknown[] }>()

    expect(body.items).toHaveLength(17)
  })

  it('preserves order from CATEGORIES constant', async () => {
    const response = await app.inject({ method: 'GET', url: '/categories' })
    const body = response.json<{ items: Array<{ code: string; label: string }> }>()

    CATEGORIES.forEach((expected, i) => {
      expect(body.items[i]?.code).toBe(expected.code)
      expect(body.items[i]?.label).toBe(expected.label)
    })
  })

  it('sets Cache-Control: public, max-age=86400', async () => {
    const response = await app.inject({ method: 'GET', url: '/categories' })

    expect(response.headers['cache-control']).toBe('public, max-age=86400')
  })
})
