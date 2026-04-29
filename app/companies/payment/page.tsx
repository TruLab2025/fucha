// app/companies/payment/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CompanyPaymentPage() {
  const router = useRouter();
  const [tier, setTier] = useState<'pro' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const proBenefits = [
    'Kontakty bez limitu',
    'Pełny dostęp do numerów kontaktowych',
    'Szybsze dotarcie do ludzi z okolicy',
  ];

  useEffect(() => {
    const selectedTier = localStorage.getItem('selectedTier') as 'pro' | null;
    setTier(selectedTier);
    if (!selectedTier) {
      router.push('/companies');
    }
  }, [router]);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Symulacja płatności - delay 2s
    setTimeout(() => {
      const paymentData = {
        tier: 'pro',
        paymentDate: new Date().toISOString(),
        status: 'completed',
        transactionId: `COMP-${Date.now()}`,
        contactsRemaining: -1, // -1 = unlimited
      };
      
      localStorage.setItem('companyTier', 'pro');
      localStorage.setItem('companyContactsRemaining', '-1');
      localStorage.setItem('companyPaymentData', JSON.stringify(paymentData));
      localStorage.removeItem('selectedTier');
      
      router.push('/companies/browse');
    }, 2000);
  };

  if (!tier) {
    return <div className="text-center py-12">Ładowanie...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-white border-2 border-gray-300 rounded-lg p-8 space-y-6">
        <h1 className="text-2xl font-bold">Potwierdzenie płatności PRO</h1>
        
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-700">Plan:</span>
            <span className="font-bold text-primary">PRO – kontakty bez limitu</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Kwota:</span>
            <span className="text-primary">49 zł</span>
          </div>
          <div className="text-sm text-gray-600 pt-2">
            Płatność powtarza się co miesiąc
          </div>
        </div>

        <div className="rounded-lg border border-green-200 bg-green-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Co odblokowujesz w PRO</p>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            {proBenefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Formularz płatności - symulacja */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numer karty
            </label>
            <input 
              type="text" 
              placeholder="4242 4242 4242 4242" 
              defaultValue="4242 4242 4242 4242"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">Demo: użyj dowolnego numeru</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ważność
              </label>
              <input 
                type="text" 
                placeholder="MM/YY" 
                defaultValue="12/26"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVC
              </label>
              <input 
                type="text" 
                placeholder="123" 
                defaultValue="123"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <p className="text-blue-900">
            💳 <strong>Tryb Demo:</strong> Dane karty są zasymulowane. W realnej aplikacji tutaj byłby Stripe/PayU.
          </p>
        </div>

        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className={`w-full px-4 py-3 rounded-lg font-bold text-white transition ${
            isProcessing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-primary hover:bg-blue-700'
          }`}
        >
          {isProcessing ? 'Przetwarzanie... ⏳' : 'Zapłać 49 zł'}
        </button>

        <p className="text-sm text-center text-gray-500">
          Po potwierdzeniu wrócisz do listy ludzi do pracy bez limitu odkryć.
        </p>
      </div>
    </div>
  );
}
