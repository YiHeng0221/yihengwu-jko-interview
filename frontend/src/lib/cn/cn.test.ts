import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('concatenates string classes', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('drops falsy values', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b')
  })

  it('flattens nested arrays', () => {
    expect(cn('a', ['b', ['c', false, 'd']])).toBe('a b c d')
  })

  it('keeps numbers as strings', () => {
    expect(cn(1, 'b')).toBe('1 b')
  })

  it('returns empty string when no truthy input', () => {
    expect(cn(false, null, undefined)).toBe('')
  })
})
