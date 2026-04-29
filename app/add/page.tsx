// app/add/page.tsx
import React, { Suspense } from 'react';
import Link from 'next/link';
import JobForm from '../../components/JobForm';

export default function AddPage() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Dla osób szukających pracy</p>
          <h1 className="text-4xl font-bold">Masz czas i chcesz dorobić?</h1>
          <p className="mt-4 text-gray-600 leading-7">
            Dodaj krótkie ogłoszenie o swojej dostępności. Bez konta, bez CV, bez zbędnych formalności.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Nie wiesz, jak to opisać? <Link href="/jobs" className="font-semibold text-primary underline underline-offset-2">Podejrzyj inne fuchy i skopiuj podobną</Link>.
          </p>
        </div>
        <Suspense fallback={<div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-sm">Ładowanie formularza...</div>}>
          <JobForm />
        </Suspense>
      </div>
    </section>
  );
}
