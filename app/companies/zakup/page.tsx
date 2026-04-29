"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CompanyPurchasePage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem('selectedTier', 'pro');
    router.replace('/companies/payment');
  }, [router]);

  return (
    <main className="py-12">
      <div className="container mx-auto max-w-2xl">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-bold">Przekierowanie do płatności</h1>
          <p className="mt-3 text-gray-600">
            Ustawiamy plan PRO i przenosimy Cię prosto do checkoutu.
          </p>
        </div>
      </div>
    </main>
  );
}
