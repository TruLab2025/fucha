// app/add/page.tsx
import React from 'react';
import JobForm from '../../components/JobForm';

export default function AddPage() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">Masz czas i chcesz dorobić?</h1>
          <p className="mt-4 text-gray-600 leading-7">
            Dodaj krótkie ogłoszenie o swojej dostępności. Bez konta, bez CV, bez zbędnych formalności.
          </p>
        </div>
        <JobForm />
      </div>
    </section>
  );
}
