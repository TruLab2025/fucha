// components/Navbar.tsx

import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between py-4 gap-2 sm:gap-0">
        <Link href="/" className="flex items-center" aria-label="Fucha24 logo">
          <Image src="/fucha24-logo.svg" alt="Fucha24 logo" width={90} height={28} className="sm:w-[120px] sm:h-[32px] w-[90px] h-[28px]" priority />
        </Link>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-4 mt-2 sm:mt-0">
          <Link href="/add" className="px-3 py-2 sm:px-4 sm:py-2 bg-primary text-white rounded-lg hover:bg-blue-700 text-base sm:text-base w-full sm:w-auto text-center">
            Dodaj fuchę
          </Link>
          <Link href="/jobs" className="px-3 py-2 sm:px-4 sm:py-2 bg-green text-white rounded-lg hover:bg-green-600 text-base sm:text-base w-full sm:w-auto text-center">
            Przeglądaj
          </Link>
        </div>
      </div>
    </nav>
  );
}
