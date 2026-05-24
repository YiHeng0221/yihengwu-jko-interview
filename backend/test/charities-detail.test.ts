import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildApp } from '../src/app.js'
import { CharityWireSchema } from '../src/lib/toWire.js'
import type { CharityDb } from '../src/routes/charities.js'
import type { CharityRow } from '../src/lib/toWire.js'

const FIXTURE: CharityRow = {
  id: 'clxxx',
  title: 'ACC 中華耆幼關懷協會',
  description: '你身上有光，能照亮不確定的黑暗',
  tab: 'ORG',
  categoryCode: 'ELDER_CARE',
  logoUrl: 'https://example.com/logo.png',
  amountRaised: 12345,
  amountGoal: 50000,
  createdAt: new Date('2026-05-01T00:00:00.000Z'),
}

describe('GET /charities/:id', () => {
  let app: FastifyInstance
  let findById: ReturnType<typeof vi.fn<(id: string) => Promise<CharityRow | null>>>
  let mockDb: CharityDb

  beforeEach(async () => {
    findById = vi.fn<(id: string) => Promise<CharityRow | null>>()
    mockDb = { findById }
    app = await buildApp({ db: mockDb })
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('returns 200 with snake_case wire shape when charity exists', async () => {
    findById.mockResolvedValueOnce(FIXTURE)

    const response = await app.inject({ method: 'GET', url: '/charities/clxxx' })

    expect(response.statusCode).toBe(200)
    const result = CharityWireSchema.safeParse(response.json())
    expect(result.success).toBe(true)
    const body = result.data!
    expect(body.id).toBe('clxxx')
    expect(body.tab).toBe('ORG')
    expect(body.category_code).toBe('ELDER_CARE')
    expect(body.logo_url).toBe('https://example.com/logo.png')
    expect(body.amount_raised).toBe(12345)
    expect(body.amount_goal).toBe(50000)
    expect(body.created_at).toBe('2026-05-01T00:00:00.000Z')
    expect(findById).toHaveBeenCalledWith('clxxx')
  })

  it('returns 200 with nullable fields when logoUrl and amountGoal are null', async () => {
    findById.mockResolvedValueOnce({
      ...FIXTURE,
      id: 'clyyy',
      logoUrl: null,
      amountGoal: null,
    })

    const response = await app.inject({ method: 'GET', url: '/charities/clyyy' })

    expect(response.statusCode).toBe(200)
    const body = response.json<{ logo_url: null; amount_goal: null }>()
    expect(body.logo_url).toBeNull()
    expect(body.amount_goal).toBeNull()
  })

  it('returns 404 with error not_found when charity does not exist', async () => {
    findById.mockResolvedValueOnce(null)

    const response = await app.inject({ method: 'GET', url: '/charities/nonexistent' })

    expect(response.statusCode).toBe(404)
    const body = response.json<{ error: string }>()
    expect(body.error).toBe('not_found')
    expect(findById).toHaveBeenCalledWith('nonexistent')
  })

  it('passes the id from the URL path to findById', async () => {
    findById.mockResolvedValueOnce(FIXTURE)

    await app.inject({ method: 'GET', url: '/charities/specific-id-123' })

    expect(findById).toHaveBeenCalledWith('specific-id-123')
  })
})
