"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '../../../components/Icon';

export default function CompanyPaymentPage() {
  const router = useRouter();
  const [tier, setTier] = useState<'pro' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const paymentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const proBenefits = ['Kontakty bez limitu', 'Pełny dostęp do numerów', 'Szybsze dotarcie do lokalnych osób'];

  useEffect(() => {
    const selectedTier = localStorage.getItem('selectedTier') as 'pro' | null;
    setTier(selectedTier);
    if (!selectedTier) router.push('/companies');
  }, [router]);

  useEffect(() => {
    return () => {
      if (paymentTimerRef.current) clearTimeout(paymentTimerRef.current);
    };
  }, []);

  const handlePayment = async () => {
    setIsProcessing(true);
    paymentTimerRef.current = setTimeout(() => {
      const paymentData = {
        tier: 'pro',
        paymentDate: new Date().toISOString(),
        status: 'completed',
        transactionId: `COMP-${Date.now()}`,
        contactsRemaining: -1,
      };
      localStorage.setItem('companyTier', 'pro');
      localStorage.setItem('companyContactsRemaining', '-1');
      localStorage.setItem('companyPaymentData', JSON.stringify(paymentData));
      localStorage.removeItem('selectedTier');
      router.push('/companies/browse');
    }, 2000);
  };

  if (!tier) {
    return <div className="container mx-auto py-24 text-center text-sm font-semibold text-muted">Przygotowujemy podsumowanie...</div>;
  }

  return (
    <section className="noise-wash py-12 sm:py-20">
      <div className="container mx-auto max-w-5xl">
        <Link
          href="/companies/browse"
          aria-disabled={isProcessing}
          className={`inline-flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-primary ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
        >
          <span className="rotate-180"><Icon name="arrow-right" size={17} /></span>
          Wróć do listy
        </Link>

        <div className="mt-6 grid overflow-hidden rounded-4xl border border-neutral-200 bg-white shadow-float lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="relative overflow-hidden bg-ink p-6 text-white sm:p-9">
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-primary/30 blur-3xl" aria-hidden="true" />
            <span className="relative inline-flex items-center gap-2 rounded-full bg-lime px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-ink">
              <Icon name="sparkles" size={14} /> Plan PRO
            </span>
            <h1 className="relative mt-6 text-3xl font-black leading-tight text-white sm:text-4xl">Kontaktuj się bez limitu</h1>
            <p className="relative mt-4 text-sm leading-7 text-neutral-300">Pełny dostęp do osób gotowych do pracy w Twojej okolicy.</p>

            <div className="relative mt-8 border-y border-white/10 py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Miesięcznie</p>
              <p className="mt-1 text-5xl font-black tracking-tight text-white">49 zł</p>
              <p className="mt-2 text-xs text-neutral-400">Subskrypcja odnawiana co miesiąc</p>
            </div>

            <ul className="relative mt-7 space-y-4">
              {proBenefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-sm font-semibold text-neutral-200">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-lime"><Icon name="check" size={15} /></span>
                  {benefit}
                </li>
              ))}
            </ul>
          </aside>

          <div className="p-6 sm:p-9">
            <p className="section-kicker">Podsumowanie</p>
            <h2 className="mt-2 text-2xl font-bold">Potwierdź płatność</h2>
            <p className="mt-2 text-sm leading-6 text-muted">To bezpieczna demonstracja checkoutu — żadne dane karty nie są wysyłane ani obciążane.</p>

            <div className="mt-7 space-y-5">
              <div>
                <label htmlFor="demo-card" className="field-label">Numer karty</label>
                <div className="relative">
                  <Icon name="wallet" size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input id="demo-card" type="text" defaultValue="4242 4242 4242 4242" disabled className="w-full bg-neutral-50 pl-12 disabled:text-neutral-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="demo-expiry" className="field-label">Ważność</label>
                  <input id="demo-expiry" type="text" defaultValue="12/26" disabled className="w-full bg-neutral-50 disabled:text-neutral-500" />
                </div>
                <div>
                  <label htmlFor="demo-cvc" className="field-label">CVC</label>
                  <input id="demo-cvc" type="text" defaultValue="123" disabled className="w-full bg-neutral-50 disabled:text-neutral-500" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary-100 bg-primary-50 p-4 text-sm leading-6 text-primary-900">
              <Icon name="shield" size={19} className="mt-0.5 shrink-0" />
              <p><strong>Tryb demo:</strong> kliknięcie aktywuje PRO tylko lokalnie w tej przeglądarce.</p>
            </div>

            <button onClick={handlePayment} disabled={isProcessing} aria-busy={isProcessing} className="btn-primary mt-7 w-full min-h-14 text-base">
              {isProcessing ? 'Aktywujemy PRO...' : 'Aktywuj PRO za 49 zł'}
              {!isProcessing && <Icon name="arrow-right" size={19} />}
            </button>
            <p aria-live="polite" className="mt-4 text-center text-xs leading-5 text-muted">
              {isProcessing ? 'Przetwarzamy demonstracyjną płatność. Za chwilę wrócisz do listy.' : 'Po potwierdzeniu wrócisz do listy osób bez limitu odkryć.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
