// components/PricingSection.tsx
"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function PricingSection() {
  const router = useRouter();

  const handleFree = () => {
    localStorage.setItem('companyTier', 'free');
    localStorage.setItem('companyContactsRemaining', '5');
    localStorage.setItem('companyStartDate', new Date().toISOString());
    router.push('/companies/browse');
  };

  const handlePro = () => {
    localStorage.setItem('selectedTier', 'pro');
    router.push('/companies/payment');
  };

  return (
    <section className="py-20">
      <h2 className="text-3xl font-bold text-center">Opcje dla firm</h2>
      <p className="mt-4 max-w-2xl mx-auto text-center text-gray-600 leading-7">
        Osoby szukające pracy korzystają bezpłatnie. Płatne opcje są dla firm, które chcą szybciej docierać do większej liczby kontaktów.
      </p>
      <div className="mt-10 flex flex-col md:flex-row justify-center gap-8">
        <div className="bg-white rounded-xl shadow p-8 max-w-sm text-center">
          <h3 className="text-2xl font-semibold">FREE</h3>
          <p className="mt-2 text-lg">0 zł</p>
          <p className="mt-4">5 kontaktów miesięcznie na start</p>
          <p className="mt-2 text-sm text-gray-600">Dobre na pierwsze publikacje i szybkie sprawdzenie lokalnego popytu.</p>
          <button
            onClick={handleFree}
            className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
          >
            Zacznij za darmo
          </button>
        </div>
        <div className="bg-white rounded-xl shadow p-8 max-w-sm text-center border-2 border-primary">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Najczęstszy wybór firm</p>
          <h3 className="text-2xl font-semibold">PRO</h3>
          <p className="mt-2 text-lg">49 zł</p>
          <p className="mt-4">Nielimitowane zapytania i pełny dostęp do kontaktów</p>
          <p className="mt-2 text-sm text-gray-600">Dla firm i zleceniodawców, którzy chcą działać bez limitu kontaktów.</p>
          <button
            onClick={handlePro}
            className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
          >
            Odblokuj PRO bez limitu
          </button>
        </div>
      </div>
    </section>
  );
}
