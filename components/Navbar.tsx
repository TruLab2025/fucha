// components/Navbar.tsx
"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import Image from 'next/image';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto flex flex-row items-center justify-between py-3 gap-2">
        <Link href="/" className="flex items-center shrink-0 mr-2" aria-label="Fucha24 logo">
          <Image
            src="/fucha24.png"
            alt="Fucha24 logo"
            width={140}
            height={40}
            className="h-10 w-auto max-w-[140px] object-contain"
            priority
          />
        </Link>

        <div className="hidden flex-1 items-center justify-end gap-1 sm:flex sm:gap-2">
          <Link href="/#how-it-works" className="px-2 py-1 sm:px-3 sm:py-2 text-gray-700 rounded-lg hover:bg-gray-100 text-xs sm:text-base text-center whitespace-nowrap">Jak to działa</Link>
          <Link href="/#pricing" className="px-2 py-1 sm:px-3 sm:py-2 text-gray-700 rounded-lg hover:bg-gray-100 text-xs sm:text-base text-center whitespace-nowrap">Cennik</Link>
          <Link href="/#testimonials" className="px-2 py-1 sm:px-3 sm:py-2 text-gray-700 rounded-lg hover:bg-gray-100 text-xs sm:text-base text-center whitespace-nowrap">Opinie</Link>
          <Link href="/faq" className="px-2 py-1 sm:px-3 sm:py-2 text-gray-700 rounded-lg hover:bg-gray-100 text-xs sm:text-base text-center whitespace-nowrap">FAQ</Link>
          <Link href="/#contact" className="px-2 py-1 sm:px-3 sm:py-2 text-gray-700 rounded-lg hover:bg-gray-100 text-xs sm:text-base text-center whitespace-nowrap">Kontakt</Link>
          <Link href="/add" className="px-2 py-1 sm:px-3 sm:py-2 bg-primary text-white rounded-lg hover:bg-blue-700 text-xs sm:text-base text-center whitespace-nowrap">
            Dodaj fuchę
          </Link>
          <Link href="/companies/browse" className="px-2 py-1 sm:px-3 sm:py-2 bg-green text-white rounded-lg hover:bg-green-600 text-xs sm:text-base text-center whitespace-nowrap">
            Szukam ludzi
          </Link>
        </div>

        <button
          type="button"
          aria-label={isMobileMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-gray-200 text-gray-700 shadow-sm transition hover:bg-gray-50 sm:hidden"
        >
          <span className="text-xl" aria-hidden="true">☰</span>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white sm:hidden">
          <div className="container mx-auto flex flex-col gap-2 py-4">
            <Link onClick={handleMobileMenuClose} href="/#how-it-works" className="rounded-lg px-4 py-3 text-gray-700 transition hover:bg-gray-100">Jak to działa</Link>
            <Link onClick={handleMobileMenuClose} href="/#pricing" className="rounded-lg px-4 py-3 text-gray-700 transition hover:bg-gray-100">Cennik</Link>
            <Link onClick={handleMobileMenuClose} href="/#testimonials" className="rounded-lg px-4 py-3 text-gray-700 transition hover:bg-gray-100">Opinie</Link>
            <Link onClick={handleMobileMenuClose} href="/faq" className="rounded-lg px-4 py-3 text-gray-700 transition hover:bg-gray-100">FAQ</Link>
            <Link onClick={handleMobileMenuClose} href="/#contact" className="rounded-lg px-4 py-3 text-gray-700 transition hover:bg-gray-100">Kontakt</Link>
            <Link onClick={handleMobileMenuClose} href="/jobs" className="rounded-lg px-4 py-3 text-primary transition hover:bg-blue-50">Zobacz też inne fuchy</Link>
            <Link onClick={handleMobileMenuClose} href="/add" className="rounded-lg bg-primary px-4 py-3 text-center font-medium text-white transition hover:bg-blue-700">Dodaj fuchę</Link>
            <Link onClick={handleMobileMenuClose} href="/companies/browse" className="rounded-lg bg-green px-4 py-3 text-center font-medium text-white transition hover:bg-green-600">Szukam ludzi</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
