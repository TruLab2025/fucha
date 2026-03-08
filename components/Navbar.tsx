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
        <div className="flex flex-row gap-1 sm:gap-2 flex-1 justify-end">
          <Link href="/add" className="px-2 py-1 sm:px-3 sm:py-2 bg-primary text-white rounded-lg hover:bg-blue-700 text-xs sm:text-base text-center whitespace-nowrap">
            Dodaj fuchę
          </Link>
          <Link href="/jobs" className="px-2 py-1 sm:px-3 sm:py-2 bg-green text-white rounded-lg hover:bg-green-600 text-xs sm:text-base text-center whitespace-nowrap">
            Przeglądaj
          </Link>
        </div>
      </div>
    </nav>
  );
}
