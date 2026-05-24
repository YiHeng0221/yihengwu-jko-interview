import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    charity: {
      findMany: vi.fn(),
    },
  },
}))

import { buildApp } from '../src/app.js'
import { encodeCursor } from '../src/lib/cursor.js'
import { prisma } from '../src/lib/prisma.js'

const mockFindMany = vi.mocked(prisma.charity.findMany)

const makeCharity = (overrides: {
  id?: string
  title?: string
  description?: string
  tab?: 'ORG' | 'CAMPAIGN' | 'MERCHANDISE'
  categoryCode?: string
  logoUrl?: string | null
  amountRaised?: number
  amountGoal?: number | null
  createdAt?: Date
} = {}) => ({
  id: 'ck001',
  title: '測試公益組織',
  description: '這是測試描述',
  tab: 'ORG' as const,
  categoryCode: 'CHILD_CARE',
  logoUrl: null,
  amountRaised: 0,
  amountGoal: null,
  createdAt: new Date('2026-05-01T00:00:00.000Z'),
  ...overrides,
})

describe('GET /charities', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    mockFindMany.mockReset()
    app = await buildApp()
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('list — basic', () => {
    it('returns 200 with items and next_cursor: null when results fit in one page', async () => {
      const rows = [makeCharity({ id: 'ck001' }), makeCharity({ id: 'ck002' })]
      mockFindMany.mockResolvedValue(rows)

      const response = await app.inject({ method: 'GET', url: '/charities' })

      expect(response.statusCode).toBe(200)
      const body = response.json<{ items: unknown[]; next_cursor: string | null }>()
      expect(body.items).toHaveLength(2)
      expect(body.next_cursor).toBeNull()
    })

    it('maps DB rows to snake_case wire format', async () => {
      mockFindMany.mockResolvedValue([
        makeCharity({
          id: 'ck001',
          title: '愛心組織',
          description: '幫助弱勢',
          tab: 'ORG',
          categoryCode: 'POVERTY_RELIEF',
          logoUrl: 'https://example.com/logo.png',
          amountRaised: 5000,
          amountGoal: 20000,
          createdAt: new Date('2026-05-01T00:00:00.000Z'),
        }),
      ])

      const response = await app.inject({ method: 'GET', url: '/charities' })

      expect(response.statusCode).toBe(200)
      const body = response.json<{ items: Record<string, unknown>[]; next_cursor: null }>()
      expect(body.items[0]).toMatchObject({
        id: 'ck001',
        title: '愛心組織',
        description: '幫助弱勢',
        tab: 'ORG',
        category_code: 'POVERTY_RELIEF',
        logo_url: 'https://example.com/logo.png',
        amount_raised: 5000,
        amount_goal: 20000,
        created_at: '2026-05-01T00:00:00.000Z',
      })
    })

    it('returns empty items array when no charities exist', async () => {
      mockFindMany.mockResolvedValue([])

      const response = await app.inject({ method: 'GET', url: '/charities' })

      expect(response.statusCode).toBe(200)
      const body = response.json<{ items: unknown[]; next_cursor: null }>()
      expect(body.items).toEqual([])
      expect(body.next_cursor).toBeNull()
    })
  })

  describe('limit param', () => {
    it('defaults to limit=10', async () => {
      mockFindMany.mockResolvedValue([])

      await app.inject({ method: 'GET', url: '/charities' })

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 11 }),
      )
    })

    it('respects custom limit', async () => {
      mockFindMany.mockResolvedValue([])

      await app.inject({ method: 'GET', url: '/charities?limit=5' })

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 6 }),
      )
    })

    it('returns 400 when limit exceeds 50', async () => {
      const response = await app.inject({ method: 'GET', url: '/charities?limit=51' })

      expect(response.statusCode).toBe(400)
      const body = response.json<{ error: string }>()
      expect(body.error).toBe('invalid')
    })

    it('returns 400 when limit is 0', async () => {
      const response = await app.inject({ method: 'GET', url: '/charities?limit=0' })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('cursor pagination', () => {
    it('sets next_cursor when more rows than limit exist', async () => {
      const rows = Array.from({ length: 11 }, (_, i) =>
        makeCharity({ id: `ck${String(i).padStart(3, '0')}`, createdAt: new Date(`2026-05-${String(i + 1).padStart(2, '0')}T00:00:00.000Z`) }),
      )
      mockFindMany.mockResolvedValue(rows)

      const response = await app.inject({ method: 'GET', url: '/charities?limit=10' })

      expect(response.statusCode).toBe(200)
      const body = response.json<{ items: unknown[]; next_cursor: string | null }>()
      expect(body.items).toHaveLength(10)
      expect(typeof body.next_cursor).toBe('string')
    })

    it('returns exactly limit items when has next page', async () => {
      const rows = Array.from({ length: 6 }, (_, i) =>
        makeCharity({ id: `ck${String(i).padStart(3, '0')}` }),
      )
      mockFindMany.mockResolvedValue(rows)

      const response = await app.inject({ method: 'GET', url: '/charities?limit=5' })

      expect(response.statusCode).toBe(200)
      const body = response.json<{ items: unknown[]; next_cursor: string | null }>()
      expect(body.items).toHaveLength(5)
    })

    it('encodes next_cursor from the last item in the page', async () => {
      const lastInPage = makeCharity({ id: 'ck010', createdAt: new Date('2026-04-30T00:00:00.000Z') })
      const rows = [...Array.from({ length: 9 }, (_, i) =>
        makeCharity({ id: `ck${String(i).padStart(3, '0')}`, createdAt: new Date('2026-05-01T00:00:00.000Z') }),
      ), lastInPage, makeCharity({ id: 'ck011' })]
      mockFindMany.mockResolvedValue(rows)

      const response = await app.inject({ method: 'GET', url: '/charities?limit=10' })

      const body = response.json<{ next_cursor: string }>()
      const expected = encodeCursor({ created_at: '2026-04-30T00:00:00.000Z', id: 'ck010' })
      expect(body.next_cursor).toBe(expected)
    })

    it('passes cursor condition to findMany when cursor provided', async () => {
      mockFindMany.mockResolvedValue([])
      const cursor = encodeCursor({ created_at: '2026-05-01T00:00:00.000Z', id: 'ck001' })

      await app.inject({ method: 'GET', url: `/charities?cursor=${cursor}` })

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ createdAt: { lt: new Date('2026-05-01T00:00:00.000Z') } }),
            ]),
          }),
        }),
      )
    })

    it('returns 400 for invalid cursor', async () => {
      const response = await app.inject({ method: 'GET', url: '/charities?cursor=not-valid-cursor' })

      expect(response.statusCode).toBe(400)
      const body = response.json<{ error: string }>()
      expect(body.error).toBe('invalid')
    })

    it('returns next_cursor: null on last page', async () => {
      mockFindMany.mockResolvedValue([makeCharity()])

      const response = await app.inject({ method: 'GET', url: '/charities?limit=10' })

      const body = response.json<{ next_cursor: null }>()
      expect(body.next_cursor).toBeNull()
    })
  })

  describe('category filter', () => {
    it('passes tab filter to findMany when category=ORG', async () => {
      mockFindMany.mockResolvedValue([])

      await app.inject({ method: 'GET', url: '/charities?category=ORG' })

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tab: 'ORG' }),
        }),
      )
    })

    it('passes tab filter for CAMPAIGN', async () => {
      mockFindMany.mockResolvedValue([])

      await app.inject({ method: 'GET', url: '/charities?category=CAMPAIGN' })

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tab: 'CAMPAIGN' }),
        }),
      )
    })

    it('passes tab filter for MERCHANDISE', async () => {
      mockFindMany.mockResolvedValue([])

      await app.inject({ method: 'GET', url: '/charities?category=MERCHANDISE' })

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tab: 'MERCHANDISE' }),
        }),
      )
    })

    it('returns 400 for unknown category value', async () => {
      const response = await app.inject({ method: 'GET', url: '/charities?category=UNKNOWN' })

      expect(response.statusCode).toBe(400)
    })

    it('does not filter by tab when no category param', async () => {
      mockFindMany.mockResolvedValue([])

      await app.inject({ method: 'GET', url: '/charities' })

      const call = mockFindMany.mock.calls[0]?.[0]
      expect(call?.where).not.toHaveProperty('tab')
    })
  })

  describe('search (q param)', () => {
    it('passes insensitive contains filter when q provided', async () => {
      mockFindMany.mockResolvedValue([])

      await app.inject({ method: 'GET', url: '/charities?q=%E6%84%9B%E5%BF%83' })

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: '愛心', mode: 'insensitive' } },
              { description: { contains: '愛心', mode: 'insensitive' } },
            ]),
          }),
        }),
      )
    })

    it('returns empty items when search finds nothing', async () => {
      mockFindMany.mockResolvedValue([])

      const response = await app.inject({ method: 'GET', url: '/charities?q=notfound' })

      expect(response.statusCode).toBe(200)
      const body = response.json<{ items: unknown[] }>()
      expect(body.items).toEqual([])
    })
  })

  describe('combined filters', () => {
    it('passes AND condition when both category and cursor are provided', async () => {
      mockFindMany.mockResolvedValue([])
      const cursor = encodeCursor({ created_at: '2026-05-01T00:00:00.000Z', id: 'ck001' })

      await app.inject({ method: 'GET', url: `/charities?category=ORG&cursor=${cursor}` })

      const call = mockFindMany.mock.calls[0]?.[0]
      expect(call?.where).toHaveProperty('AND')
    })

    it('passes AND condition when q and category are combined', async () => {
      mockFindMany.mockResolvedValue([])

      await app.inject({ method: 'GET', url: '/charities?category=ORG&q=test' })

      const call = mockFindMany.mock.calls[0]?.[0]
      expect(call?.where).toHaveProperty('AND')
    })
  })

  describe('ordering', () => {
    it('always orders by createdAt desc then id desc', async () => {
      mockFindMany.mockResolvedValue([])

      await app.inject({ method: 'GET', url: '/charities' })

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        }),
      )
    })
  })
})
