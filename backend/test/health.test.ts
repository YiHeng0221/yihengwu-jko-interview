import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildApp } from '../src/app.js'

describe('GET /health', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = await buildApp()
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('returns 200 with status ok and ISO timestamp', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    })

    expect(response.statusCode).toBe(200)

    const body = response.json<{ status: string; ts: string }>()
    expect(body.status).toBe('ok')
    expect(typeof body.ts).toBe('string')
    expect(new Date(body.ts).toISOString()).toBe(body.ts)
  })
})
