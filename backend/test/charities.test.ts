import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildApp } from '../src/app.js'
import type { CharitiesDb } from '../src/routes/charities.js'
import type { Charity } from '@prisma/client'

function makeRow(overrides: Partial<Charity> = {}): Charity {
  return {
    id: 'cltest001',
    title: '愛心基金會',
    description: '推廣愛心公益活動',
    tab: 'ORG',
    categoryCode: 'CHILD_CARE',
    logoUrl: null,
    amountRaised: 0,
    amountGoal: null,
    createdAt: new Date('2026-05-01T00:00:00.000Z'),
    ...overrides,
  }
}

describe('GET /charities', () => {
  let app: FastifyInstance
  let mockFindMany: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    mockFindMany = vi.fn()
    const prisma: CharitiesDb = { charity: { findMany: mockFindMany } }
    app = await buildApp({ prisma })
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('returns 200 with items and null next_cursor when no results', async () => {
    mockFindMany.mockResolvedValue([])

    const res = await app.inject({ method: 'GET', url: '/charities' })

    expect(res.statusCode).toBe(200)
    const body = res.json<{ items: unknown[]; next_cursor: null }>()
    expect(body.items).toEqual([])
    expect(body.next_cursor).toBeNull()
  })

  it('returns matched items when ?q= matches title (CJK 2-char: 愛心)', async () => {
    const row = makeRow({ title: '愛心基金會', description: '公益活動' })
    mockFindMany.mockResolvedValue([row])

    const res = await app.inject({ method: 'GET', url: '/charities?q=%E6%84%9B%E5%BF%83' })

    expect(res.statusCode).toBe(200)
    const body = res.json<{ items: { title: string }[] }>()
    expect(body.items).toHaveLength(1)
    expect(body.items[0]?.title).toBe('愛心基金會')
  })

  it('returns matched items when ?q= matches description (CJK 1-char: 心)', async () => {
    const row = makeRow({ title: '基金會', description: '愛心公益活動' })
    mockFindMany.mockResolvedValue([row])

    const res = await app.inject({ method: 'GET', url: '/charities?q=%E5%BF%83' })

    expect(res.statusCode).toBe(200)
    const body = res.json<{ items: unknown[] }>()
    expect(body.items).toHaveLength(1)
  })

  it('returns matched items when ?q= is 1-char CJK (愛)', async () => {
    const row = makeRow({ title: '愛護動物協會' })
    mockFindMany.mockResolvedValue([row])

    const res = await app.inject({ method: 'GET', url: '/charities?q=%E6%84%9B' })

    expect(res.statusCode).toBe(200)
    const body = res.json<{ items: unknown[] }>()
    expect(body.items).toHaveLength(1)
  })

  it('passes ILIKE-compatible where clause for ?q=', async () => {
    mockFindMany.mockResolvedValue([])

    await app.inject({ method: 'GET', url: '/charities?q=%E6%84%9B%E5%BF%83' })

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { title: { contains: '愛心', mode: 'insensitive' } },
            { description: { contains: '愛心', mode: 'insensitive' } },
          ],
        }),
      }),
    )
  })

  it('returns empty items when ?q= has no match', async () => {
    mockFindMany.mockResolvedValue([])

    const res = await app.inject({ method: 'GET', url: '/charities?q=zzz' })

    expect(res.statusCode).toBe(200)
    const body = res.json<{ items: unknown[] }>()
    expect(body.items).toEqual([])
  })

  it('applies category AND q together', async () => {
    mockFindMany.mockResolvedValue([])

    await app.inject({
      method: 'GET',
      url: '/charities?category=ORG&q=%E6%84%9B%E5%BF%83',
    })

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tab: 'ORG',
          OR: expect.any(Array),
        }),
      }),
    )
  })

  it('returns 200 with snake_case wire shape', async () => {
    const row = makeRow()
    mockFindMany.mockResolvedValue([row])

    const res = await app.inject({ method: 'GET', url: '/charities' })

    expect(res.statusCode).toBe(200)
    const body = res.json<{ items: Record<string, unknown>[] }>()
    const item = body.items[0]!
    expect(item).toHaveProperty('category_code')
    expect(item).toHaveProperty('logo_url')
    expect(item).toHaveProperty('amount_raised')
    expect(item).toHaveProperty('amount_goal')
    expect(item).toHaveProperty('created_at')
    expect(item).not.toHaveProperty('categoryCode')
    expect(item).not.toHaveProperty('logoUrl')
  })

  it('returns 400 when limit is out of range', async () => {
    mockFindMany.mockResolvedValue([])

    const res = await app.inject({ method: 'GET', url: '/charities?limit=999' })

    expect(res.statusCode).toBe(400)
  })
})
