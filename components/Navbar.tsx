// components/Navbar.tsx
import Link from 'next/link';
import React from 'react';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between py-4">
        <Link href="/" className="text-xl font-bold text-primary">
          Fucha24
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
