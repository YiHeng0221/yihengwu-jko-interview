import { z } from 'zod'

const CursorPayloadSchema = z.object({
  created_at: z.string().datetime(),
  id: z.string().min(1),
})

export type CursorPayload = z.infer<typeof CursorPayloadSchema>

export function encodeCursor(payload: CursorPayload): string {
  const json = JSON.stringify(payload)
  return Buffer.from(json).toString('base64url')
}

export function decodeCursor(token: string): CursorPayload {
  let json: string
  try {
    json = Buffer.from(token, 'base64url').toString('utf8')
  } catch {
    throw new CursorDecodeError()
  }

  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    throw new CursorDecodeError()
  }

  const result = CursorPayloadSchema.safeParse(raw)
  if (!result.success) {
    throw new CursorDecodeError()
  }

  return result.data
}

export class CursorDecodeError extends Error {
  readonly statusCode = 400
  readonly body = { error: 'invalid' } as const

  constructor() {
    super('invalid cursor')
    this.name = 'CursorDecodeError'
  }
}
