// app/add/page.tsx
import React from 'react';
import JobForm from '../../components/JobForm';

export default function AddPage() {
  return (
    <main className="py-16">
      <div className="container mx-auto max-w-lg">
        <h1 className="text-4xl font-bold text-center mb-8">
          Masz czas? Dodaj fuchę
        </h1>
        <JobForm />
      </div>
    </main>
  );
}
