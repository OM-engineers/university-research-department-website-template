import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { useData, useLang, useUi } from '../lib/lang'
import { getNewestNews, getNewestProjects, type Lang } from '../lib/data'
import type { NavChild, NavItem, Site } from '../lib/types'

/**
 * K-01: sticky header with the five menu entries, dropdowns, search icon and IT | EN switch.
 * The page content goes in the children slot and is rendered below the header.
 */
export function HeaderNav({ children }: { children?: ReactNode }) {
  const site = useData('site')
  const ui = useUi()
  const { pathname } = useLocation()
  const [openId, setOpenId] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const navChildren = useNavChildren()

  // Close everything after navigating (state reset during render, no effect needed).
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpenId(null)
    setMobileOpen(false)
  }

  // Escape and clicks outside the header close the open dropdown.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpenId(null)
        setMobileOpen(false)
      }
    }
    function onClick(e: MouseEvent) {
      if (!headerRef.current?.contains(e.target as Node)) setOpenId(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [])

  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id))

  return (
    <>
      <header ref={headerRef} className="sticky top-0 z-40 border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-300 items-center gap-4 px-4 lg:px-6">
          <Link to={site.logo.link} className="mr-auto text-[28px] font-bold leading-none lg:text-[36px]">
            {site.logo.text}
          </Link>

          {/* Desktop menu */}
          <nav aria-label={ui.mainNav} className="hidden lg:block">
            <ul className="flex items-center gap-4">
              {site.nav.map((item) => (
                <DesktopItem
                  key={item.id}
                  item={item}
                  links={navChildren(item)}
                  open={openId === item.id}
                  active={isActive(item, pathname)}
                  onToggle={() => toggle(item.id)}
                  onHover={(on) => setOpenId(on ? item.id : null)}
                  toggleLabel={ui.submenu(item.label)}
                />
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3 lg:gap-4">
            <SearchButton label={site.search.label} enabled={site.search.enabled} />
            <LangSwitch site={site} />
            <button
              type="button"
              className="-mr-2 flex h-10 w-10 items-center justify-center lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? ui.close : ui.menu}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Phone menu */}
        {mobileOpen && (
          <nav id="mobile-menu" aria-label={ui.mainNav} className="border-t border-border lg:hidden">
            <ul>
              {site.nav.map((item) => (
                <MobileItem
                  key={item.id}
                  item={item}
                  links={navChildren(item)}
                  open={openId === item.id}
                  active={isActive(item, pathname)}
                  onToggle={() => toggle(item.id)}
                  toggleLabel={ui.submenu(item.label)}
                />
              ))}
            </ul>
          </nav>
        )}
      </header>
      {children}
    </>
  )
}

type ItemProps = {
  item: NavItem
  links: NavChild[]
  open: boolean
  active: boolean
  onToggle: () => void
  toggleLabel: string
}

function DesktopItem({
  item,
  links,
  open,
  active,
  onToggle,
  onHover,
  toggleLabel,
}: ItemProps & { onHover: (on: boolean) => void }) {
  const menuId = useId()
  const hasMenu = links.length > 0
  // Active page and open dropdown: accent colour with an underline (ComponentCatalog_v1).
  const highlight = active || open
  return (
    <li
      className="relative"
      onMouseEnter={hasMenu ? () => onHover(true) : undefined}
      onMouseLeave={hasMenu ? () => onHover(false) : undefined}
    >
      <div
        className={`flex items-center gap-1 border-b-2 py-1 ${highlight ? 'border-accent text-accent' : 'border-transparent'}`}
      >
        <Link
          to={item.link}
          aria-current={active ? 'page' : undefined}
          data-label={item.label}
          // The invisible bold copy (::after) reserves the bold width, so the entries don't shift.
          className={`inline-flex flex-col items-center after:invisible after:h-0 after:overflow-hidden after:font-semibold after:content-[attr(data-label)] hover:text-accent ${highlight ? 'font-semibold' : ''}`}
        >
          {item.label}
        </Link>
        {hasMenu && (
          <button
            type="button"
            className="flex h-6 w-5 items-center justify-center hover:text-accent"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={toggleLabel}
            onClick={onToggle}
          >
            <TriangleIcon open={open} />
          </button>
        )}
      </div>
      {hasMenu && open && (
        // pt-2 keeps the hover area continuous between the entry and the panel.
        <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2">
          <ul
            id={menuId}
            className="min-w-64 overflow-hidden rounded-lg border border-border bg-surface py-2 shadow-sm"
          >
            {links.map((child) => (
              <li key={child.id} className={child.id === VIEW_ALL ? 'mt-1 border-t border-border pt-1' : ''}>
                <Link to={child.link} className="block px-5 py-2.5 hover:text-accent">
                  {child.label}
                  {child.id === VIEW_ALL && <Arrow />}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  )
}

function MobileItem({ item, links, open, active, onToggle, toggleLabel }: ItemProps) {
  const menuId = useId()
  const hasMenu = links.length > 0
  const highlight = active || open
  return (
    <li className="border-b border-border last:border-b-0">
      <div className={`flex items-center justify-between px-4 ${highlight ? 'text-accent' : ''}`}>
        <Link to={item.link} aria-current={active ? 'page' : undefined} className="flex-1 py-3 text-lg">
          {item.label}
        </Link>
        {hasMenu && (
          <button
            type="button"
            className="-mr-2 flex h-11 w-11 items-center justify-center"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={toggleLabel}
            onClick={onToggle}
          >
            <TriangleIcon open={open} size={14} />
          </button>
        )}
      </div>
      {hasMenu && open && (
        <ul id={menuId} className="bg-border">
          {links.map((child) => (
            <li key={child.id} className="border-t border-surface">
              <Link
                to={child.link}
                className={`block px-9 py-2.5 hover:text-accent ${child.id === VIEW_ALL ? 'font-semibold' : ''}`}
              >
                {child.label}
                {child.id === VIEW_ALL && <Arrow />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

function LangSwitch({ site }: { site: Site }) {
  const { lang, setLang } = useLang()
  return (
    <div role="group" aria-label={site.languageSwitch.label} className="flex items-center text-lg">
      {site.languageSwitch.options.map((opt, i) => (
        <span key={opt.code} className="flex items-center">
          {i > 0 && <span aria-hidden="true" className="mx-1.5 h-6 w-px bg-text" />}
          <button
            type="button"
            lang={opt.code}
            aria-pressed={lang === opt.code}
            onClick={() => setLang(opt.code as Lang)}
            className={`px-0.5 hover:text-accent ${lang === opt.code ? 'font-bold' : ''}`}
          >
            {opt.label}
          </button>
        </span>
      ))}
    </div>
  )
}

/** The search itself is not part of the MVP: while site.search.enabled is false the icon is shown but disabled. */
function SearchButton({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={!enabled}
      className="flex h-10 w-8 items-center justify-center hover:text-accent disabled:cursor-not-allowed disabled:hover:text-text"
    >
      <SearchIcon />
    </button>
  )
}

const VIEW_ALL = 'view-all'

function Arrow() {
  return (
    <span aria-hidden="true" className="ml-1.5 text-accent">
      →
    </span>
  )
}

/** Dropdown links: the fixed children, or the latest projects / news followed by "View all". */
function useNavChildren() {
  const { lang } = useLang()
  return (item: NavItem): NavChild[] => {
    const dyn = item.dynamicChildren
    if (!dyn) return item.children
    // Same helpers as the rest of the app: newest first, ties broken by id.
    const latest =
      dyn.source === 'projects'
        ? getNewestProjects(lang, dyn.limit).map((p) => ({ id: p.id, label: p.title, link: `/projects/${p.id}` }))
        : getNewestNews(lang, dyn.limit).map((n) => ({ id: n.id, label: n.title, link: `/news/${n.id}` }))
    return [...latest, { id: VIEW_ALL, ...dyn.viewAll }]
  }
}

/** Highlights the entry of the current section (detail pages and dropdown pages included). */
function isActive(item: NavItem, pathname: string) {
  if (item.link === '/') return pathname === '/'
  if (pathname === item.link || pathname.startsWith(`${item.link}/`)) return true
  return (item.children ?? []).some((c) => c.link.split('#')[0] === pathname)
}

const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

function SearchIcon() {
  return (
    <svg {...iconProps} width={24} height={24} strokeWidth={2.5}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg {...iconProps} width={24} height={24}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg {...iconProps} width={24} height={24}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

/** Filled triangle: down when closed, up when open. */
function TriangleIcon({ open, size = 11 }: { open: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d={open ? 'M8 3l7 10H1z' : 'M1 3h14L8 13z'} />
    </svg>
  )
}
