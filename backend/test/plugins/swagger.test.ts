import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildApp } from '../../src/app.js'

describe('swagger plugin', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = await buildApp()
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('exposes /docs Swagger UI', async () => {
    const response = await app.inject({ method: 'GET', url: '/docs' })
    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toMatch(/text\/html/)
  })

  it('exposes /docs/json with valid OpenAPI spec', async () => {
    const response = await app.inject({ method: 'GET', url: '/docs/json' })
    expect(response.statusCode).toBe(200)
    const spec = response.json<{ openapi: string; info: { title: string } }>()
    expect(spec.openapi).toMatch(/^3\./)
    expect(spec.info.title).toBe('街口公益捐款 API')
  })

  it('includes /health route in the spec', async () => {
    const response = await app.inject({ method: 'GET', url: '/docs/json' })
    const spec = response.json<{ paths: Record<string, unknown> }>()
    expect(spec.paths['/health']).toBeDefined()
  })
})
