import { describe, it, expect } from 'vitest'
import { getLossyValue, COMPRESSION_LEVELS, getPngQuality } from '../compress.js'

describe('getLossyValue', () => {
  it('returns 60 for level 25', () => {
    expect(getLossyValue(25)).toBe(60)
  })
  it('returns 100 for level 50', () => {
    expect(getLossyValue(50)).toBe(100)
  })
  it('returns 160 for level 75', () => {
    expect(getLossyValue(75)).toBe(160)
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

describe('getPngQuality', () => {
  it('returns 0.85 for level 25', () => {
    expect(getPngQuality(25)).toBe(0.85)
  })
  it('returns 0.65 for level 50', () => {
    expect(getPngQuality(50)).toBe(0.65)
  })
  it('throws for unknown level', () => {
    expect(() => getPngQuality(99)).toThrow('Unknown compression level: 99')
  })
})
