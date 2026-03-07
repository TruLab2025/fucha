// components/Navbar.tsx

import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between py-4">
        <Link href="/" className="flex items-center" aria-label="Fucha24 logo">
          <Image src="/fucha24-logo.svg" alt="Fucha24 logo" width={120} height={32} priority />
        </Link>
        <div className="space-x-4">
          <Link href="/add" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">
            Dodaj fuchę
          </Link>
          <Link href="/jobs" className="px-4 py-2 bg-green text-white rounded-lg hover:bg-green-600">
            Przeglądaj
          </Link>
        </div>
      </div>
    </nav>
  );
}
