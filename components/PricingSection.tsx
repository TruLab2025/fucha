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
    <section className="py-20 bg-neutral">
      <h2 className="text-3xl font-bold text-center">Cennik</h2>
      <div className="mt-10 flex flex-col md:flex-row justify-center gap-8">
        <div className="bg-white rounded-xl shadow p-8 max-w-sm text-center">
          <h3 className="text-2xl font-semibold">FREE</h3>
          <p className="mt-2 text-lg">0 zł</p>
          <p className="mt-4">5 zapytań miesięcznie</p>
          <button
            onClick={handleFree}
            className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
          >
            Zobacz oferty
          </button>
        </div>
        <div className="bg-white rounded-xl shadow p-8 max-w-sm text-center">
          <h3 className="text-2xl font-semibold">PRO</h3>
          <p className="mt-2 text-lg">49 zł</p>
          <p className="mt-4">nielimitowane zapytania</p>
          <button
            onClick={handlePro}
            className="mt-6 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
          >
            Odblokuj PRO
          </button>
        </div>
      </div>
    </section>
  );
}
