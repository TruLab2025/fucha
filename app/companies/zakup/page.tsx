"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export default function CompanyPurchasePage() {
  const router = useRouter();

  const goToPayment = () => {
    localStorage.setItem('selectedTier', 'pro');
    router.push('/companies/payment');
  };

  return (
    <main className="py-12">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <h1 className="text-3xl font-bold mb-3">Zakup planu PRO</h1>
          <p className="text-gray-600 mb-6">
            Odblokuj nieograniczone odkrywanie telefonów i kontakt do wszystkich pracowników.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
            <p className="text-sm text-gray-700 mb-2">Plan:</p>
            <p className="text-2xl font-bold text-primary">PRO — 49 zł / miesiąc</p>
            <ul className="mt-3 text-sm text-gray-700 space-y-1">
              <li>✅ Nielimitowane odkrycia telefonów</li>
              <li>✅ Priorytetowy dostęp do kontaktów</li>
              <li>✅ Brak limitu 5 odkryć</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={goToPayment}
              className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition"
            >
              Przejdź do płatności
            </button>
            <button
              onClick={() => router.push('/companies/browse')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Wróć
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
