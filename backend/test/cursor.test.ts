import { describe, expect, it } from 'vitest'
import {
  CursorDecodeError,
  decodeCursor,
  encodeCursor,
} from '../src/lib/cursor.js'

const PAYLOAD = {
  created_at: '2026-05-01T00:00:00.000Z',
  id: 'ckxxx',
}

describe('encodeCursor / decodeCursor round-trip', () => {
  it('decodes what it encodes', () => {
    const token = encodeCursor(PAYLOAD)
    expect(decodeCursor(token)).toEqual(PAYLOAD)
  })

  it('produces a base64url string (no +, /, = chars)', () => {
    const token = encodeCursor(PAYLOAD)
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('encodes different payloads to different tokens', () => {
    const a = encodeCursor({ created_at: '2026-01-01T00:00:00.000Z', id: 'a' })
    const b = encodeCursor({ created_at: '2026-01-01T00:00:00.000Z', id: 'b' })
    expect(a).not.toBe(b)
  })
})

describe('decodeCursor — error cases', () => {
  it('throws CursorDecodeError for an empty string', () => {
    expect(() => decodeCursor('')).toThrow(CursorDecodeError)
  })

  it('throws CursorDecodeError for random garbage', () => {
    expect(() => decodeCursor('not-a-valid-cursor!!')).toThrow(CursorDecodeError)
  })

  it('throws CursorDecodeError for valid base64url that is not JSON', () => {
    const notJson = Buffer.from('hello world').toString('base64url')
    expect(() => decodeCursor(notJson)).toThrow(CursorDecodeError)
  })

  it('throws CursorDecodeError when created_at is missing', () => {
    const bad = Buffer.from(JSON.stringify({ id: 'ckxxx' })).toString('base64url')
    expect(() => decodeCursor(bad)).toThrow(CursorDecodeError)
  })

  it('throws CursorDecodeError when id is missing', () => {
    const bad = Buffer.from(
      JSON.stringify({ created_at: '2026-05-01T00:00:00.000Z' }),
    ).toString('base64url')
    expect(() => decodeCursor(bad)).toThrow(CursorDecodeError)
  })

  it('throws CursorDecodeError when created_at is not an ISO datetime', () => {
    const bad = Buffer.from(
      JSON.stringify({ created_at: 'not-a-date', id: 'ckxxx' }),
    ).toString('base64url')
    expect(() => decodeCursor(bad)).toThrow(CursorDecodeError)
  })

  it('CursorDecodeError carries statusCode 400 and body {error:"invalid"}', () => {
    expect.assertions(3)
    try {
      decodeCursor('garbage')
    } catch (err) {
      expect(err).toBeInstanceOf(CursorDecodeError)
      if (!(err instanceof CursorDecodeError)) throw new Error('unexpected error type')
      expect(err.statusCode).toBe(400)
      expect(err.body).toEqual({ error: 'invalid' })
    }
  })
})
