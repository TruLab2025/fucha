import React from 'react';
import Link from 'next/link';
import Brand from './Brand';
import Icon from './Icon';

const footerGroups = [
  {
    title: 'Dla szukających',
    links: [
      { href: '/add', label: 'Dodaj dostępność' },
      { href: '/jobs', label: 'Podejrzyj inne fuchy' },
      { href: '/#how-it-works', label: 'Jak to działa' },
    ],
  },
  {
    title: 'Dla firm',
    links: [
      { href: '/companies/browse', label: 'Znajdź osobę' },
      { href: '/#pricing', label: 'Plany i cennik' },
    ],
  },
  {
    title: 'Informacje',
    links: [
      { href: '/faq', label: 'FAQ' },
      { href: '/regulamin', label: 'Regulamin' },
    ],
  },
];

export default function Footer() {
  return (
    <footer id="contact" className="mt-20 bg-ink text-white">
      <div className="container mx-auto py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <Link href="/" className="inline-flex rounded-xl" aria-label="Fucha24 — strona główna">
              <Brand inverse />
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-neutral-300 sm:text-base">
              Lokalna praca bez CV, konta i czekania. Łączymy wolny termin z konkretną potrzebą w okolicy.
            </p>
            <div className="mt-7 rounded-2xl bg-white/10 p-5 ring-1 ring-white/10 sm:flex sm:items-center sm:justify-between sm:gap-6">
              <div>
                <p className="font-bold text-white">Masz wolny termin?</p>
                <p className="mt-1 text-sm text-neutral-300">Pokaż się firmom z Twojej okolicy.</p>
              </div>
              <Link href="/add" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-lime px-4 py-2.5 text-sm font-bold text-ink hover:-translate-y-0.5 hover:bg-white sm:mt-0">
                Dodaj fuchę
                <Icon name="arrow-right" size={17} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h2 className="text-sm font-bold tracking-normal text-white">{group.title}</h2>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-neutral-300 hover:text-lime">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Fucha24. Lokalnie i konkretnie.</p>
          <p>Publikacja bez konta · Kontakt chroniony limitem</p>
        </div>
      </div>
    </footer>
  );
}
