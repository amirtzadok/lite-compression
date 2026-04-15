import { describe, it, expect } from 'vitest'
import { formatBytes, calcReduction } from '../ui.js'

describe('formatBytes', () => {
  it('formats bytes under 1024 as B', () => {
    expect(formatBytes(512)).toBe('512 B')
  })
  it('formats KB correctly', () => {
    expect(formatBytes(1536)).toBe('1.5 KB')
  })
  it('formats MB correctly', () => {
    expect(formatBytes(2621440)).toBe('2.5 MB')
  })
  it('handles 0', () => {
    expect(formatBytes(0)).toBe('0 B')
  })
})

describe('calcReduction', () => {
  it('calculates % reduction', () => {
    expect(calcReduction(1000, 600)).toBe(40)
  })
  it('returns 0 when sizes equal', () => {
    expect(calcReduction(1000, 1000)).toBe(0)
  })
  it('rounds to nearest integer', () => {
    expect(calcReduction(1000, 333)).toBe(67)
  })
})
