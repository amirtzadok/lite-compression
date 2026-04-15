import { describe, it, expect } from 'vitest'
import { getLossyValue, COMPRESSION_LEVELS } from '../compress.js'

describe('getLossyValue', () => {
  it('returns 30 for level 25', () => {
    expect(getLossyValue(25)).toBe(30)
  })
  it('returns 80 for level 50', () => {
    expect(getLossyValue(50)).toBe(80)
  })
  it('returns 130 for level 75', () => {
    expect(getLossyValue(75)).toBe(130)
  })
  it('returns 200 for level 100', () => {
    expect(getLossyValue(100)).toBe(200)
  })
  it('throws for unknown level', () => {
    expect(() => getLossyValue(99)).toThrow('Unknown compression level: 99')
  })
})

describe('COMPRESSION_LEVELS', () => {
  it('exports array of valid levels', () => {
    expect(COMPRESSION_LEVELS).toEqual([25, 50, 75, 100])
  })
})
