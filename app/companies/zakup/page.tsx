"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '../../../components/Icon';

export default function CompanyPurchasePage() {
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem('selectedTier', 'pro');
    router.replace('/companies/payment');
  }, [router]);

  return (
    <section className="noise-wash py-20">
      <div className="container mx-auto max-w-xl">
        <div className="surface p-8 text-center sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary">
            <Icon name="wallet" size={25} />
          </span>
          <h1 className="mt-5 text-3xl font-bold">Przechodzimy do płatności</h1>
          <p className="mt-3 leading-7 text-muted">
            Ustawiamy plan PRO i przenosimy Cię prosto do checkoutu.
          </p>
          <div className="mx-auto mt-6 h-1.5 w-32 overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </section>
  );
}
