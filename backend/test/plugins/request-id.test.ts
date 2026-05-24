import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildApp } from '../../src/app.js'

describe('request-id plugin', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = await buildApp()
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('reflects x-request-id from request in response header', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { 'x-request-id': 'test-id-123' },
    })

    expect(response.statusCode).toBe(200)
    expect(response.headers['x-request-id']).toBe('test-id-123')
  })

  it('generates a cuid2 when x-request-id is absent', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    })

    expect(response.statusCode).toBe(200)
    const id = response.headers['x-request-id']
    expect(typeof id).toBe('string')
    expect((id as string).length).toBeGreaterThan(0)
  })

  it('generates unique ids for each request when no x-request-id is provided', async () => {
    const [r1, r2] = await Promise.all([
      app.inject({ method: 'GET', url: '/health' }),
      app.inject({ method: 'GET', url: '/health' }),
    ])

    expect(r1.headers['x-request-id']).not.toBe(r2.headers['x-request-id'])
  })
})
