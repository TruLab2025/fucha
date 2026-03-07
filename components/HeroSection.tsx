// components/HeroSection.tsx
import React from 'react';
import Link from 'next/link';
import CategoryIcons from './CategoryIcons';

export default function HeroSection() {
  return (
    <section className="text-center py-20">
      <h1 className="text-5xl font-bold leading-tight">
        Znajdź fuchę albo ludzi do roboty.
      </h1>
      <div className="mt-8 flex flex-col gap-4 items-center sm:flex-row sm:justify-center sm:gap-4">
        <Link href="/add" className="px-6 py-3 bg-primary text-white rounded-xl text-lg hover:bg-blue-700 w-full sm:w-auto text-center">
          Mam czas – chcę dorobić
        </Link>
        <Link href="/companies" className="px-6 py-3 bg-green text-white rounded-xl text-lg hover:bg-green-600 w-full sm:w-auto text-center">
          Szukam ludzi do pracy
        </Link>
      </div>
      <CategoryIcons />
    </section>
  );
}
