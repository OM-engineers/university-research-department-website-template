import { describe, expect, it } from 'vitest'
import { prefixAssets, withBase } from './base'

describe('withBase', () => {
  it('keeps every path when the site is served from "/"', () => {
    expect(withBase('/images/a.svg', '/')).toBe('/images/a.svg')
    expect(withBase('/files/Regulations.pdf', '/')).toBe('/files/Regulations.pdf')
  })

  it('adds the folder to files of public/', () => {
    expect(withBase('/images/a.svg', '/my-repo/')).toBe('/my-repo/images/a.svg')
    expect(withBase('/files/Regulations.pdf', '/my-repo/')).toBe('/my-repo/files/Regulations.pdf')
    expect(withBase('/icons/Book_Icon.svg', '/my-repo')).toBe('/my-repo/icons/Book_Icon.svg')
  })

  it('does not touch routes, external links, anchors or plain text', () => {
    for (const value of ['/projects', '/news/n-01', 'https://example.com/images/a.svg', '#contact', 'mailto:info@example.com', 'Images']) {
      expect(withBase(value, '/my-repo/')).toBe(value)
    }
  })
})

describe('prefixAssets', () => {
  it('changes asset paths at any depth and leaves the rest', () => {
    const input = { title: 'T', link: '/projects', items: [{ image: '/images/a.svg', n: 3, ok: true, none: null }] }
    expect(prefixAssets(input, '/my-repo/')).toEqual({
      title: 'T',
      link: '/projects',
      items: [{ image: '/my-repo/images/a.svg', n: 3, ok: true, none: null }],
    })
  })

  it('does not change the original object', () => {
    const input = { image: '/images/a.svg' }
    prefixAssets(input, '/my-repo/')
    expect(input.image).toBe('/images/a.svg')
  })
})
