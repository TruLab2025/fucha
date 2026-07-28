"use client";

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import Brand from './Brand';
import Icon from './Icon';

const navLinks = [
  { href: '/#how-it-works', label: 'Jak to działa' },
  { href: '/jobs', label: 'Podejrzyj fuchy' },
  { href: '/#pricing', label: 'Cennik' },
  { href: '/faq', label: 'FAQ' },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-canvas/90 backdrop-blur-xl">
      <nav className="container mx-auto flex h-[72px] items-center justify-between gap-4" aria-label="Główna nawigacja">
        <Link href="/" className="shrink-0 rounded-xl" aria-label="Fucha24 — strona główna">
          <Brand />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-neutral-600 hover:bg-white hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/companies/browse" className="btn-secondary min-h-11 px-4 py-2.5">
            <Icon name="users" size={18} />
            Szukam ludzi
          </Link>
          <Link href="/add" className="btn-primary min-h-11 px-4 py-2.5">
            Dodaj dostępność
            <Icon name="arrow-up-right" size={17} />
          </Link>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          aria-label={isMobileMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMobileMenuOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-ink shadow-sm hover:bg-neutral-50 lg:hidden"
        >
          <Icon name={isMobileMenuOpen ? 'x' : 'menu'} size={21} />
        </button>
      </nav>

      {isMobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Nawigacja mobilna"
          className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-neutral-200 bg-canvas px-4 pb-5 pt-3 shadow-float lg:hidden"
        >
          <div className="mx-auto flex max-w-lg flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                onClick={closeMenu}
                href={link.href}
                className="rounded-xl px-4 py-3 text-base font-semibold text-neutral-700 hover:bg-white"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-neutral-200" />
            <Link onClick={closeMenu} href="/companies/browse" className="btn-secondary w-full">
              <Icon name="users" size={18} />
              Szukam ludzi do pracy
            </Link>
            <Link onClick={closeMenu} href="/add" className="btn-primary mt-1 w-full">
              Dodaj swoją dostępność
              <Icon name="arrow-right" size={18} />
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
