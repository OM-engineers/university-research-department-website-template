import { describe, expect, it } from 'vitest'
import { formatFileSize } from './format'

describe('formatFileSize', () => {
  it('uses B below 1 KB, whole KB below 1 MB and one decimal for MB', () => {
    expect(formatFileSize(609, 'en')).toBe('609 B')
    expect(formatFileSize(122880, 'en')).toBe('120 KB')
    expect(formatFileSize(1572864, 'en')).toBe('1.5 MB')
  })

  it('uses the decimal comma in Italian', () => {
    expect(formatFileSize(1572864, 'it')).toBe('1,5 MB')
  })
})
