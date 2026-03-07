// components/PricingPlans.tsx
"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function PricingPlans() {
  const router = useRouter();

  const handleSelectPlan = (tier: 'free' | 'pro') => {
    if (tier === 'free') {
      // Free tier - no payment needed, go directly to browse
      localStorage.setItem('companyTier', 'free');
      localStorage.setItem('companyContactsRemaining', '5');
      localStorage.setItem('companyStartDate', new Date().toISOString());
      router.push('/companies/browse');
    } else {
      // Pro tier - requires payment
      localStorage.setItem('selectedTier', tier);
      router.push('/companies/payment');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-4">Dostęp do talentów</h1>
      <p className="text-center text-gray-600 mb-12">
        Przeglądaj dostępnych pracowników i wysyłaj im wiadomości
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FREE Plan */}
        <div className="border-2 border-gray-300 rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold">FREE</h2>
          <p className="text-3xl font-bold text-primary">0 zł</p>
          <ul className="space-y-2 text-sm">
            <li>✓ 5 kontaktów miesięcznie</li>
            <li>✓ Pełny dostęp do bazy talentów</li>
            <li>✓ Wiadomości emailem</li>
            <li>✗ Priorytet w systemie</li>
          </ul>
          <button
            onClick={() => handleSelectPlan('free')}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Zacznij za darmo
          </button>
        </div>

        {/* PRO Plan */}
        <div className="border-2 border-primary rounded-lg p-6 space-y-4 bg-blue-50">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold">PRO</h2>
            <span className="bg-primary text-white px-2 py-1 text-xs font-bold rounded">POPULAR</span>
          </div>
          <p className="text-3xl font-bold text-primary">49 zł<span className="text-sm text-gray-600">/mies</span></p>
          <ul className="space-y-2 text-sm">
            <li>✓ Kontaktów bez limitu</li>
            <li>✓ Pełny dostęp do bazy talentów</li>
            <li>✓ Wiadomości emailem</li>
            <li>✓ Priorytet w systemie</li>
          </ul>
          <button
            onClick={() => handleSelectPlan('pro')}
            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Upgrade na PRO
          </button>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-center text-blue-900">
        <p>
          💡 <strong>Jak to działa:</strong> Każde napisanie do pracownika to 1 kontakt. 
          FREE tier wystarczy do testowania. PRO bez limitu dla dużych kampanii.
        </p>
      </div>
    </div>
  );
}
