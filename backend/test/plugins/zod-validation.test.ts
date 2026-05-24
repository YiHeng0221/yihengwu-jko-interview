import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { buildApp } from '../../src/app.js'

describe('zod-validation plugin', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = await buildApp()

    app.withTypeProvider<ZodTypeProvider>().get(
      '/test-validate',
      {
        schema: {
          querystring: z.object({
            limit: z.coerce.number().int().min(1).max(50),
          }),
        },
      },
      async (request) => ({
        limit: request.query.limit,
      }),
    )

    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  it('returns 400 with error envelope when querystring validation fails', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test-validate?limit=999',
    })

    expect(response.statusCode).toBe(400)
    const body = response.json<{ error: string; issues: unknown[] }>()
    expect(body.error).toBe('invalid')
    expect(Array.isArray(body.issues)).toBe(true)
    expect(body.issues.length).toBeGreaterThan(0)
  })

  it('returns 400 with path, message, code on each issue', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test-validate?limit=0',
    })

    expect(response.statusCode).toBe(400)
    const body = response.json<{
      error: string
      issues: { path: string; message: string; code: string }[]
    }>()
    expect(body.error).toBe('invalid')
    expect(body.issues[0]).toHaveProperty('path')
    expect(body.issues[0]).toHaveProperty('message')
    expect(body.issues[0]).toHaveProperty('code')
    expect(typeof body.issues[0]?.message).toBe('string')
    expect(typeof body.issues[0]?.code).toBe('string')
  })

  it('returns 200 when validation passes', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test-validate?limit=10',
    })

    expect(response.statusCode).toBe(200)
    const body = response.json<{ limit: number }>()
    expect(body.limit).toBe(10)
  })

  it('does not intercept non-validation errors', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/nonexistent-route',
    })

    expect(response.statusCode).toBe(404)
  })
})
