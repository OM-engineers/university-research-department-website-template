import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { SectionTitle } from './SectionTitle';

afterEach(cleanup);

describe('SectionTitle', () => {
  it('renders an h2 by default with the correct title', () => {
    render(
      <MemoryRouter>
        <SectionTitle title="Latest News" />
      </MemoryRouter>
    );
    const heading = screen.getByRole('heading', { level: 2, name: 'Latest News' });
    expect(heading).toBeTruthy();
  });

  it('renders an h1 when the "as" prop is set to "h1"', () => {
    render(
      <MemoryRouter>
        <SectionTitle title="Page Intro" as="h1" />
      </MemoryRouter>
    );
    const heading = screen.getByRole('heading', { level: 1, name: 'Page Intro' });
    expect(heading).toBeTruthy();
  });

  it('renders a link when both linkText and linkTo are provided', () => {
    render(
      <MemoryRouter>
        <SectionTitle title="Explore" linkText="View All" linkTo="/all-items" />
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: /View All/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('/all-items');
  });

  it('does not render a link if linkText is missing', () => {
    render(
      <MemoryRouter>
        <SectionTitle title="No Link Section" linkTo="/somewhere" />
      </MemoryRouter>
    );
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('does not render a link if linkTo is missing', () => {
    render(
      <MemoryRouter>
        <SectionTitle title="Another No Link Section" linkText="Click Here" />
      </MemoryRouter>
    );
    expect(screen.queryByRole('link')).toBeNull();
  });
});