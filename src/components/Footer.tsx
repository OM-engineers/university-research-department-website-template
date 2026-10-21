import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { useData } from '../lib/lang'
import { isExternal } from '../lib/format'

/** Internal routes use the router, everything else (external URL, "#") a plain link. */
function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  if (!isExternal(to)) {
    return (
      <Link to={to} className="hover:underline">
        {children}
      </Link>
    )
  }
  const opensNewTab = /^https?:/.test(to)
  return (
    <a
      href={to}
      className="hover:underline"
      {...(opensNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  )
}

const headingClass = 'text-sm font-bold tracking-wider mb-4 text-white/80 uppercase'

/** Footer: every text comes from site.json (footer, logo), so it follows the IT | EN switch. */
export function Footer() {
  const { footer, logo } = useData('site')

  return (
    <>
      <style>{`
        /* Target common React/Next.js root elements to enable flex layout */
        body, #root, #__next {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
      `}</style>

      <footer className="bg-text text-white py-12 font-sans mt-auto w-full">
        <div className="mx-auto max-w-[1200px] px-4 lg:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col">
            <div className="mb-4">
              <Link
                to={logo.link}
                className="inline-block border-2 border-white rounded-md px-4 py-1 text-xl font-bold hover:bg-white hover:text-text transition-colors"
              >
                {logo.text}
              </Link>
            </div>
            <p className="text-sm mb-6 text-white/80">{footer.description}</p>
            <ul className="flex space-x-3 mb-6">
              {footer.social.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.link}
                    aria-label={s.label}
                    title={s.label}
                    className="flex w-8 h-8 items-center justify-center rounded-full border border-white hover:bg-white hover:text-text transition-colors"
                  />
                </li>
              ))}
            </ul>
            <p className="text-sm text-white/80">
              <FooterLink to={footer.university.link}>{footer.university.label}</FooterLink>
            </p>
          </div>

          <div>
            <h3 className={headingClass}>{footer.contact.title}</h3>
            <ul className="text-sm space-y-2 text-white/80">
              <li>{footer.contact.address}</li>
              <li>
                <a href={`mailto:${footer.contact.email}`} className="hover:underline">
                  {footer.contact.email}
                </a>
              </li>
              <li>{footer.contact.phone}</li>
            </ul>
          </div>

          <div>
            <h3 className={headingClass}>{footer.quickLinks.title}</h3>
            <ul className="text-sm space-y-2 text-white/80">
              {footer.quickLinks.items.map((item) => (
                <li key={item.link}>
                  <FooterLink to={item.link}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mx-auto max-w-[1200px] px-4 lg:px-6 mt-12 pt-6 border-t border-white/30">
          <p className="text-center text-sm text-white/80">{footer.copyright}</p>
        </div>
      </footer>
    </>
  )
}
