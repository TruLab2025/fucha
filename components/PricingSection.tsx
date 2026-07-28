"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Icon from './Icon';

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
    <section className="relative overflow-hidden bg-white py-20 sm:py-24">
      <div className="soft-grid absolute inset-0 opacity-35" aria-hidden="true" />

      <div className="container relative mx-auto">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-kicker">Prosty cennik dla firm</p>
          <h2 className="section-title mt-3">Zacznij bez ryzyka. Zwiększ dostęp, gdy potrzebujesz.</h2>
          <p className="section-copy mx-auto mt-5 max-w-2xl">
            Osoby szukające pracy korzystają bezpłatnie. Firmy mogą najpierw sprawdzić lokalne kontakty, a potem przejść na dostęp bez limitu.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-2 lg:items-stretch">
          <article className="surface flex h-full flex-col p-7 sm:p-9">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Na dobry start</p>
                <h3 className="mt-2 text-3xl font-black">FREE</h3>
              </div>
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary"
                aria-hidden="true"
              >
                <Icon name="wallet" size={23} />
              </span>
            </div>

            <div className="mt-8 flex items-end gap-2 border-b border-neutral-100 pb-7">
              <p className="text-5xl font-black tracking-[-0.05em] text-ink">0 zł</p>
              <p className="pb-1 text-sm font-semibold text-muted">na start</p>
            </div>

            <p className="mt-7 text-lg font-bold text-ink">5 kontaktów na start</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Dobre na pierwsze zlecenia i szybkie sprawdzenie, kto jest dostępny w Twojej okolicy.
            </p>

            <ul className="mt-7 space-y-3 text-sm font-semibold text-neutral-700">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">
                  <Icon name="check" size={13} />
                </span>
                Pełny podgląd dostępnych osób
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">
                  <Icon name="check" size={13} />
                </span>
                5 odkryć numeru telefonu
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">
                  <Icon name="check" size={13} />
                </span>
                Bez karty i zobowiązań
              </li>
            </ul>

            <button type="button" onClick={handleFree} className="btn-secondary mt-9 w-full sm:text-base">
              Zacznij za darmo
              <Icon name="arrow-right" size={18} />
            </button>
          </article>

          <article className="surface relative flex h-full flex-col overflow-hidden border-ink bg-ink p-7 text-white shadow-float sm:p-9">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/25 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-lime/15 blur-3xl" aria-hidden="true" />

            <div className="relative flex items-start justify-between gap-5">
              <div>
                <p className="inline-flex rounded-full bg-lime px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-ink">
                  Najczęstszy wybór firm
                </p>
                <h3 className="mt-4 text-3xl font-black text-white">PRO</h3>
              </div>
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-lime"
                aria-hidden="true"
              >
                <Icon name="zap" size={23} />
              </span>
            </div>

            <div className="relative mt-8 flex items-end gap-2 border-b border-white/10 pb-7">
              <p className="text-5xl font-black tracking-[-0.05em] text-white">49 zł</p>
              <p className="pb-1 text-sm font-semibold text-neutral-300">miesięcznie</p>
            </div>

            <p className="relative mt-7 text-lg font-bold text-white">Kontakty bez limitu</p>
            <p className="relative mt-2 text-sm leading-6 text-neutral-300">
              Dla firm i zleceniodawców, którzy regularnie potrzebują ludzi i chcą działać bez limitu odkryć.
            </p>

            <ul className="relative mt-7 space-y-3 text-sm font-semibold text-neutral-100">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime text-ink">
                  <Icon name="check" size={13} />
                </span>
                Nielimitowane odkrycia numerów
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime text-ink">
                  <Icon name="check" size={13} />
                </span>
                Pełny dostęp do lokalnych kontaktów
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime text-ink">
                  <Icon name="check" size={13} />
                </span>
                Szybsze docieranie do dostępnych osób
              </li>
            </ul>

            <button type="button" onClick={handlePro} className="btn-primary relative mt-9 w-full sm:text-base">
              Odblokuj PRO bez limitu
              <Icon name="arrow-right" size={18} />
            </button>
          </article>
        </div>
      </div>
    </section>
  );
}
