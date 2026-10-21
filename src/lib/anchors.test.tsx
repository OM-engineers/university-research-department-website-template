import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { HeaderNav } from '../components/HeaderNav';
import { LangContext } from './lang';
import { getData, LANGS, type Lang } from './data';
import { ui } from './ui';
import type { NavChild, NavItem } from './types';

/**
 * Anchors of the About and Networking pages, and the dropdown items that point to them.
 *
 * The anchors are defined in the page data (`anchor` fields). The header dropdowns
 * link to them as `/about#mission-vision`, `/networking#partnerships`, and so on.
 * These tests keep the two sides in sync, in both languages.
 */

type AnchorPage = {
  path: string;
  file: 'about' | 'networking';
  navId: string;
  /** The `anchor` fields of the page data, in document order. */
  anchors: string[];
  /** navChildId -> anchor of the dropdown items that scroll (the items of the About us dropdown without an anchor are not listed). */
  expected: Record<string, string>;
};

// The anchor is part of the URL, so it is the same in every language.
// About: the dropdown item "Mission and vision" goes to #mission, the first card inside the
// #mission-vision section; #background has no dropdown item (K-01 has 4 items in About us).
const PAGES: AnchorPage[] = [
  {
    path: '/about',
    file: 'about',
    navId: 'about',
    anchors: ['mission-vision', 'background', 'regulations'],
    expected: {
      'mission-vision': 'mission',
      regulations: 'regulations',
    },
  },
  {
    path: '/networking',
    file: 'networking',
    navId: 'networking',
    anchors: ['partnerships', 'visiting-scholars'],
    expected: {
      partners: 'partnerships',
      scholars: 'visiting-scholars',
    },
  },
];

/** Every `anchor` field of a data file, in document order. */
function anchorsOf(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(anchorsOf);
  if (typeof value !== 'object' || value === null) return [];
  return Object.entries(value).flatMap(([key, child]) =>
    key === 'anchor' && typeof child === 'string' ? [child] : anchorsOf(child),
  );
}

/** Everything on a page that a link can scroll to: its `anchor` fields and the Mission and Vision cards (their ids). */
function targetsOf(lang: Lang, file: AnchorPage['file']): string[] {
  const data = getData(lang, file);
  const cardIds = file === 'about' ? getData(lang, 'about').missionVision.items.map((i) => i.id) : [];
  return [...anchorsOf(data), ...cardIds];
}

/** Children of a menu entry (the type allows entries without any). */
const childrenOf = (nav: NavItem[], id: string): NavChild[] =>
  nav.find((n) => n.id === id)?.children ?? [];

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

afterEach(cleanup);

describe.each(LANGS)('page anchors in the data (%s)', (lang) => {
  it.each(PAGES)('$path defines exactly the expected anchors', ({ file, anchors }) => {
    expect(anchorsOf(getData(lang, file)).sort()).toEqual([...anchors].sort());
  });

  it.each(PAGES)('$path anchors are unique, non-empty and URL-safe', ({ file }) => {
    const anchors = anchorsOf(getData(lang, file));
    expect(new Set(anchors).size).toBe(anchors.length);
    for (const a of anchors) expect(a, `"${a}"`).toMatch(SLUG);
  });

  it('About and Networking do not share an anchor name', () => {
    const about = anchorsOf(getData(lang, 'about'));
    const networking = anchorsOf(getData(lang, 'networking'));
    expect(about.filter((a) => networking.includes(a))).toEqual([]);
  });

  it.each(PAGES)('$path: the anchors are in the order of the page', ({ file, anchors }) => {
    expect(anchorsOf(getData(lang, file))).toEqual(anchors);
  });

  it('the Mission and Vision cards have the ids #mission and #vision', () => {
    expect(getData(lang, 'about').missionVision.items.map((i) => i.id)).toEqual(['mission', 'vision']);
  });
});

describe('page anchors are not translated', () => {
  it.each(PAGES)('$path: en and it use the same anchors', ({ file }) => {
    expect(anchorsOf(getData('it', file))).toEqual(anchorsOf(getData('en', file)));
  });
});

describe.each(LANGS)('dropdown items in site.json (%s)', (lang) => {
  const nav = getData(lang, 'site').nav;

  it.each(PAGES)(
    '$path: each anchor child links to an anchor defined on the page',
    ({ path, file, navId }) => {
      const anchors = targetsOf(lang, file);
      const children = childrenOf(nav, navId).filter((c) => c.link.includes('#'));
      expect(children.length).toBeGreaterThan(0);
      for (const child of children) {
        const [page, anchor] = child.link.split('#');
        expect(page, child.id).toBe(path);
        expect(anchors, `${child.id} -> ${child.link}`).toContain(anchor);
      }
    },
  );

  it.each(PAGES)('$path: the dropdown has exactly the expected scrolling items', ({ path, navId, expected }) => {
    const linked = childrenOf(nav, navId)
      .filter((c) => c.link.startsWith(`${path}#`))
      .map((c) => c.link.split('#')[1]);
    expect(linked.sort()).toEqual(Object.values(expected).sort());
  });

  it.each(PAGES)('$path: dropdown ids map to the expected anchors', ({ path, navId, expected }) => {
    const children = childrenOf(nav, navId);
    for (const [childId, anchor] of Object.entries(expected)) {
      expect(children.find((c) => c.id === childId)?.link, childId).toBe(`${path}#${anchor}`);
    }
  });

  it('anchor links have a non-empty label', () => {
    const labels = PAGES.flatMap(({ navId }) =>
      childrenOf(nav, navId).filter((c) => c.link.includes('#')),
    ).map((c) => c.label);
    for (const label of labels) expect(label.trim().length).toBeGreaterThan(0);
  });
});

// ---------- The rendered dropdowns ----------

function LocationProbe() {
  const { pathname, hash } = useLocation();
  return <output data-testid="location">{pathname + hash}</output>;
}

function renderHeader(lang: Lang, path = '/') {
  render(
    <LangContext.Provider value={{ lang, setLang: () => {} }}>
      <MemoryRouter initialEntries={[path]}>
        <HeaderNav>
          <LocationProbe />
        </HeaderNav>
      </MemoryRouter>
    </LangContext.Provider>,
  );
}

const location = () => screen.getByTestId('location').textContent;
const desktopNav = (lang: Lang) => screen.getAllByRole('navigation', { name: ui[lang].mainNav })[0];

describe.each(LANGS)('dropdown items scroll targets (%s)', (lang) => {
  const nav = getData(lang, 'site').nav;

  describe.each(PAGES)('$path', ({ navId, expected }) => {
    const item = nav.find((n) => n.id === navId)!;
    const children = childrenOf(nav, navId);
    const anchorChildren = children.filter((c) => c.link.includes('#'));

    function openDropdown() {
      const toggle = within(desktopNav(lang)).getByRole('button', {
        name: ui[lang].submenu(item.label),
      });
      fireEvent.click(toggle);
      return within(document.getElementById(toggle.getAttribute('aria-controls')!)!);
    }

    it('renders one link per anchor with the right href', () => {
      renderHeader(lang);
      const menu = openDropdown();
      for (const child of anchorChildren) {
        expect(menu.getByRole('link', { name: child.label }).getAttribute('href'), child.id).toBe(
          child.link,
        );
      }
      expect(anchorChildren.map((c) => c.link.split('#')[1]).sort()).toEqual(
        Object.values(expected).sort(),
      );
    });

    it.each(anchorChildren.map((c) => [c.label, c] as const))(
      'clicking "%s" navigates to the page with its #hash and closes the dropdown',
      (_label, child) => {
        renderHeader(lang);
        const menu = openDropdown();
        fireEvent.click(menu.getByRole('link', { name: child.label }));
        expect(location()).toBe(child.link);
        expect(within(desktopNav(lang)).queryAllByRole('button', { expanded: true })).toHaveLength(
          0,
        );
      },
    );

    it('keeps the section highlighted when an anchor of the page is open', () => {
      const child = anchorChildren[0];
      renderHeader(lang, child.link);
      const link = within(desktopNav(lang)).getByRole('link', { name: item.label });
      expect(link.getAttribute('aria-current')).toBe('page');
      expect(location()).toBe(child.link);
    });

    it('opens the same dropdown items in the phone menu', () => {
      renderHeader(lang);
      fireEvent.click(screen.getByRole('button', { name: ui[lang].menu }));
      const mobile = document.getElementById('mobile-menu')!;
      const toggle = within(mobile).getByRole('button', { name: ui[lang].submenu(item.label) });
      fireEvent.click(toggle);
      const submenu = within(document.getElementById(toggle.getAttribute('aria-controls')!)!);
      for (const child of anchorChildren) {
        expect(submenu.getByRole('link', { name: child.label }).getAttribute('href')).toBe(
          child.link,
        );
      }
      fireEvent.click(submenu.getByRole('link', { name: anchorChildren[0].label }));
      expect(location()).toBe(anchorChildren[0].link);
      // The phone menu closes after navigating.
      expect(document.getElementById('mobile-menu')).toBeNull();
    });
  });
});

// Scrolling to the anchors on the real pages is tested in src/anchors.test.tsx (T-123).
