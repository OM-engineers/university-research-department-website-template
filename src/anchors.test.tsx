import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from './App';
import { LangContext } from './lib/lang';
import { getData, LANGS, type Lang } from './lib/data';

/**
 * T-123: the About and Networking anchors, and the dropdown items that scroll to them.
 * The whole App is rendered, so the click goes through the real dropdown, the router and the page.
 * Reads getData(): the Italian files must give the same anchors as the English ones.
 */

const scrollIntoView = vi.fn();

beforeEach(() => {
  scrollIntoView.mockClear();
  // jsdom has no scrollIntoView; the pages call it on the element of the hash.
  Element.prototype.scrollIntoView = scrollIntoView;
});
afterEach(cleanup);

function renderApp(lang: Lang, path: string) {
  render(
    <LangContext.Provider value={{ lang, setLang: () => {} }}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </LangContext.Provider>,
  );
}

const desktopNav = (lang: Lang) =>
  screen.getAllByRole('navigation', {
    name: lang === 'en' ? 'Main navigation' : 'Navigazione principale',
  })[0];

/** The dropdown entries of site.json that point to a #anchor on the given page. */
function anchorItems(lang: Lang, page: 'about' | 'networking') {
  const entry = getData(lang, 'site').nav.find((item) => item.id === page)!;
  return (entry.children ?? [])
    .filter((child) => child.link.startsWith(`/${page}#`))
    .map((child) => ({ ...child, anchor: child.link.split('#')[1] }));
}

/** Opens the dropdown of a menu entry and returns its panel. */
function openDropdown(lang: Lang, page: 'about' | 'networking') {
  const entry = getData(lang, 'site').nav.find((item) => item.id === page)!;
  const toggle = within(desktopNav(lang)).getByRole('button', { name: new RegExp(entry.label) });
  if (toggle.getAttribute('aria-expanded') !== 'true') fireEvent.click(toggle);
  return within(document.getElementById(toggle.getAttribute('aria-controls')!)!);
}

/** What the page says its anchors are (about.json and networking.json). */
const pageAnchors = (lang: Lang) => ({
  about: [
    'mission',
    'vision',
    getData(lang, 'about').background.anchor,
    getData(lang, 'about').regulations.anchor,
  ],
  networking: [
    getData(lang, 'networking').partners.anchor,
    getData(lang, 'networking').scholars.anchor,
  ],
});

describe.each(LANGS)('anchors and dropdown items (%s)', (lang) => {
  describe('anchors on the pages', () => {
    it('About has #mission, #vision, #background and #regulations', () => {
      renderApp(lang, '/about');
      for (const id of ['mission', 'vision', 'background', 'regulations']) {
        expect(document.getElementById(id), `#${id}`).not.toBeNull();
      }
      expect(pageAnchors(lang).about).toEqual(['mission', 'vision', 'background', 'regulations']);
    });

    it('Networking has #partnerships and #visiting-scholars, each on its own section with a heading', () => {
      renderApp(lang, '/networking');
      const { partners, scholars } = getData(lang, 'networking');
      expect(partners.anchor).toBe('partnerships');
      expect(scholars.anchor).toBe('visiting-scholars');
      for (const { anchor, title } of [partners, scholars]) {
        const section = document.getElementById(anchor);
        expect(section?.tagName, `#${anchor}`).toBe('SECTION');
        expect(
          within(section as HTMLElement).getByRole('heading', { level: 2, name: title }),
        ).not.toBeNull();
      }
    });

    it('every anchor is unique on its page', () => {
      for (const [path, anchors] of [
        ['/about', pageAnchors(lang).about],
        ['/networking', pageAnchors(lang).networking],
      ] as const) {
        renderApp(lang, path);
        for (const id of anchors)
          expect(document.querySelectorAll(`[id="${id}"]`), `${path}#${id}`).toHaveLength(1);
        cleanup();
      }
    });
  });

  describe('dropdown items', () => {
    it('About us has two items that scroll (#mission, #regulations)', () => {
      expect(anchorItems(lang, 'about').map((i) => i.anchor)).toEqual(['mission', 'regulations']);
    });

    it('Networking has two items that scroll (#partnerships, #visiting-scholars)', () => {
      expect(anchorItems(lang, 'networking').map((i) => i.anchor)).toEqual([
        'partnerships',
        'visiting-scholars',
      ]);
    });

    it.each(['about', 'networking'] as const)(
      'every %s item points to an anchor that the page has',
      (page) => {
        renderApp(lang, `/${page}`);
        for (const { anchor, label } of anchorItems(lang, page)) {
          expect(pageAnchors(lang)[page], `${label} -> #${anchor}`).toContain(anchor);
          expect(document.getElementById(anchor), `${label} -> #${anchor}`).not.toBeNull();
        }
      },
    );

    it.each(['about', 'networking'] as const)(
      'clicking an %s item from the home page scrolls to its section',
      (page) => {
        for (const { anchor, label, link } of anchorItems(lang, page)) {
          renderApp(lang, '/');
          const item = openDropdown(lang, page).getByRole('link', { name: label });
          expect(item.getAttribute('href')).toBe(link);
          fireEvent.click(item);
          expect(scrollIntoView, `${label}`).toHaveBeenCalledTimes(1);
          expect(scrollIntoView.mock.contexts[0], `${label}`).toBe(document.getElementById(anchor));
          cleanup();
          scrollIntoView.mockClear();
        }
      },
    );

    it('clicking an item while already on that page scrolls to its section', () => {
      renderApp(lang, '/networking');
      const [first, second] = anchorItems(lang, 'networking');
      for (const { anchor, label } of [first, second]) {
        scrollIntoView.mockClear();
        fireEvent.click(openDropdown(lang, 'networking').getByRole('link', { name: label }));
        expect(scrollIntoView.mock.contexts[0], label).toBe(document.getElementById(anchor));
      }
    });

    it.each(['about', 'networking'] as const)(
      'choosing the same %s item again scrolls again (the section may have been scrolled away)',
      (page) => {
        renderApp(lang, `/${page}`);
        const { label, anchor } = anchorItems(lang, page)[0];
        fireEvent.click(openDropdown(lang, page).getByRole('link', { name: label }));
        fireEvent.click(openDropdown(lang, page).getByRole('link', { name: label }));
        expect(scrollIntoView).toHaveBeenCalledTimes(2);
        expect(scrollIntoView.mock.contexts[1]).toBe(document.getElementById(anchor));
      },
    );

    it('items without an anchor (People, Contact and join us) do not scroll', () => {
      renderApp(lang, '/about');
      const children =
        getData(lang, 'site').nav.find((item) => item.id === 'about')!.children ?? [];
      const plain = children.filter((child) => !child.link.includes('#'));
      expect(plain.map((c) => c.link)).toEqual(['/people', '/contact']);
      scrollIntoView.mockClear();
      fireEvent.click(openDropdown(lang, 'about').getByRole('link', { name: plain[0].label }));
      expect(scrollIntoView).not.toHaveBeenCalled();
    });
  });

  describe('opening a page with a hash', () => {
    it.each([
      ['/about#mission', 'mission'],
      ['/about#vision', 'vision'],
      ['/about#background', 'background'],
      ['/about#regulations', 'regulations'],
      ['/networking#partnerships', 'partnerships'],
      ['/networking#visiting-scholars', 'visiting-scholars'],
    ])('%s scrolls to #%s', (path, id) => {
      renderApp(lang, path);
      expect(scrollIntoView).toHaveBeenCalledTimes(1);
      expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById(id));
    });

    it.each(['/about', '/networking', '/about#nope', '/networking#nope'])(
      '%s scrolls nowhere and does not fail',
      (path) => {
        expect(() => renderApp(lang, path)).not.toThrow();
        expect(scrollIntoView).not.toHaveBeenCalled();
      },
    );
  });
});
