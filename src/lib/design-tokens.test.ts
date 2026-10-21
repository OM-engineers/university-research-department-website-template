/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * T-141 (Fix 3): design token test.
 * The colours of the site are the tokens of `index.css` (T04, D-07). A colour written by hand
 * in a component (a hex code, rgb(), or a Tailwind palette colour like gray-500) makes the site
 * drift from the design and cannot be changed in one place. This test fails when one appears.
 * It reads the source files as text, like the internal-links test reads App.tsx.
 */

const sources = import.meta.glob<string>('../**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true })
// index.css is read with fs: the Tailwind plugin of Vite would turn an imported CSS into an empty string.
const css = readFileSync('src/index.css', 'utf8') // npm run test runs from the project root

/** Source files of the app: everything except the tests. */
const appFiles = Object.entries(sources)
  .filter(([path]) => !/\.test\.(ts|tsx)$/.test(path))
  .map(([path, text]) => ({ path: path.replace('../', 'src/'), text }))

const HEX = /(?<![\w&#/-])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi
const COLOUR_FUNCTION = /\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\(/gi
const TAILWIND_PALETTE =
  /\b(?:bg|text|border|ring|fill|stroke|from|to|via|divide|outline|decoration|shadow|accent|caret|placeholder)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}(?:\/\d+)?\b/g

/** Hand-written colours found in a text, with the kind of each. */
function findHandWrittenColours(text: string) {
  return [
    ...[...text.matchAll(HEX)].map((m) => `hex ${m[0]}`),
    ...[...text.matchAll(COLOUR_FUNCTION)].map((m) => `function ${m[0]}`),
    ...[...text.matchAll(TAILWIND_PALETTE)].map((m) => `palette ${m[0]}`),
  ]
}

/** The colour tokens of T04 (frozen on Day 5) as written in the @theme block. */
const T04_COLOURS: Record<string, string> = {
  text: '#2E3F4B',
  accent: '#B52330',
  'accent-hover': '#8F1B25',
  surface: '#F1F2F4',
  'surface-warm': '#EEEAE0',
  border: '#D5D9DE',
  background: '#FFFFFF',
  'text-muted': '#5B6B77',
  success: '#1A6B43',
  error: '#A8141B',
  link: '#A8141B',
}

/** Colour tokens declared in index.css: --color-NAME: value. */
const declaredTokens = new Map(
  [...css.matchAll(/--color-([a-z-]+):\s*([^;]+);/gi)].map((m) => [m[1], m[2].trim()] as const),
)

describe('design tokens (T04, D-07)', () => {
  it('index.css declares the colour tokens of T04 with their frozen values', () => {
    for (const [name, value] of Object.entries(T04_COLOURS)) {
      expect(declaredTokens.get(name), `--color-${name}`).toBeDefined()
      expect(declaredTokens.get(name)!.toUpperCase(), `--color-${name}`).toBe(value)
    }
  })

  it('declares the tokens in a static @theme block, so they exist even when no class uses them', () => {
    expect(css).toMatch(/@theme\s+static\s*\{/)
  })

  it('finds the source files to check (the test is not empty)', () => {
    const names = appFiles.map((f) => f.path)
    expect(names).toEqual(expect.arrayContaining(['src/components/SectionTitle.tsx', 'src/components/Footer.tsx', 'src/components/FormField.tsx']))
    expect(appFiles.length).toBeGreaterThan(20)
  })

  it('has no hand-written colour in any component, page or helper (hex, rgb(), Tailwind palette)', () => {
    const problems = appFiles.flatMap(({ path, text }) => findHandWrittenColours(text).map((c) => `${path}: ${c}`))
    expect(problems).toEqual([])
  })

  it('every var(--color-NAME) written in the source is a declared token', () => {
    const problems = appFiles.flatMap(({ path, text }) =>
      [...text.matchAll(/var\(--color-([a-z-]+)\)/g)]
        .filter((m) => !declaredTokens.has(m[1]))
        .map((m) => `${path}: var(--color-${m[1]}) is not in index.css`),
    )
    expect(problems).toEqual([])
  })

  describe('the three components of Fix 3 use the tokens', () => {
    const text = (path: string) => appFiles.find((f) => f.path === path)!.text

    it('SectionTitle: the link is accent', () => {
      expect(text('src/components/SectionTitle.tsx')).toContain('text-accent')
    })

    it('Footer: the background is the text token, the hover colour follows it', () => {
      const footer = text('src/components/Footer.tsx')
      expect(footer).toContain('bg-text')
      expect(footer).toContain('hover:text-text')
    })

    it('FormField: the checkbox and the focus ring are accent', () => {
      const field = text('src/components/FormField.tsx')
      expect(field).toContain('checked:bg-accent')
      expect(field).toContain('checked:border-accent')
      expect(field).toContain('focus:ring-accent')
    })
  })

  describe('the detector itself', () => {
    it('catches the mistakes of Day 8', () => {
      expect(findHandWrittenColours('className="text-[#B91C1C]"')).toEqual(['hex #B91C1C'])
      expect(findHandWrittenColours('className="bg-[#334155]"')).toEqual(['hex #334155'])
      expect(findHandWrittenColours('className="text-gray-500 border-slate-500/50"')).toEqual([
        'palette text-gray-500',
        'palette border-slate-500/50',
      ])
      expect(findHandWrittenColours('style={{ color: "rgb(0, 0, 0)" }}')).toEqual(['function rgb('])
    })

    it('does not complain about tokens, anchors and neutral classes', () => {
      const fine = [
        'className="bg-accent text-text-muted border-border bg-white text-white/80 hover:bg-accent-hover"',
        'className="border-[var(--color-border)] text-[var(--color-text)]"',
        'link="#inquiry-form" href="/about#background" to="#"',
        'className="group-hover:translate-x-1 -translate-y-1/2 text-sm"',
      ]
      for (const line of fine) expect(findHandWrittenColours(line)).toEqual([])
    })
  })
})
