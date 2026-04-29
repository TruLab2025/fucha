// components/Navbar.tsx

import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

export default function Navbar() {
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
        <div className="flex flex-row gap-1 sm:gap-2 flex-1 justify-end items-center">
          <Link href="/#how-it-works" className="px-2 py-1 sm:px-3 sm:py-2 text-gray-700 rounded-lg hover:bg-gray-100 text-xs sm:text-base text-center whitespace-nowrap">Jak działa</Link>
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
      </div>
    </nav>
  );
}
