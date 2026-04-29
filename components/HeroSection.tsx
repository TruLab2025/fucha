// components/HeroSection.tsx
import React from 'react';
import Link from 'next/link';
import CategoryIcons from './CategoryIcons';

export default function HeroSection() {
  return (
    <section className="pt-8 pb-16 text-center sm:py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Lokalne zlecenia bez zbędnych formalności</p>
      <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
        Znajdź fuchę albo ludzi do roboty.
      </h1>
      <p className="mt-6 mx-auto max-w-3xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
        Lokalne zlecenia, szybki kontakt i zero zbędnych formalności. Chcesz dorobić po godzinach albo pilnie znaleźć ludzi do pracy? Zacznij bez CV i bez długiej rekrutacji.
      </p>
      <div className="mt-8 flex flex-col gap-4 items-center sm:flex-row sm:justify-center sm:gap-4">
        <Link href="/add" className="px-6 py-3 bg-primary text-white rounded-xl text-lg hover:bg-blue-700 w-full sm:w-auto text-center shadow-sm">
          Mam czas i chcę dorobić
        </Link>
        <Link href="/companies/browse" className="px-6 py-3 bg-green text-white rounded-xl text-lg hover:bg-green-600 w-full sm:w-auto text-center">
          Szukam ludzi do pracy
        </Link>
      </div>
      <div className="mt-4 text-center">
        <Link href="/jobs" className="text-sm font-semibold text-primary underline underline-offset-2">
          Zobacz też inne fuchy
        </Link>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-gray-700">
        <span className="rounded-full bg-white px-4 py-2 shadow-sm">Bez zakładania konta</span>
        <span className="rounded-full bg-white px-4 py-2 shadow-sm">Kontakt w kilka minut</span>
        <span className="rounded-full bg-white px-4 py-2 shadow-sm">Oferty z Twojej okolicy</span>
      </div>
      <CategoryIcons />
    </section>
  );
}
