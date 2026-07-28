// app/add/page.tsx
import React, { Suspense } from 'react';
import Link from 'next/link';
import JobForm from '../../components/JobForm';
import Icon, { IconName } from '../../components/Icon';

const benefits: { icon: IconName; title: string; text: string }[] = [
  { icon: 'clock', title: '3 minuty', text: 'Tyle zwykle zajmuje dodanie ogłoszenia.' },
  { icon: 'lock', title: 'Bez konta', text: 'Nie prosimy o rejestrację ani rozbudowany profil.' },
  { icon: 'map-pin', title: 'Lokalny zasięg', text: 'Firmy filtrują osoby po mieście i terminie.' },
];

export default function AddPage() {
  return (
    <>
      <section className="noise-wash border-b border-neutral-200 py-12 sm:py-16">
        <div className="container mx-auto text-center">
          <span className="eyebrow"><Icon name="briefcase" size={15} /> Twoja dostępność</span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-[1.03] sm:text-5xl lg:text-6xl">Pokaż, kiedy możesz wskoczyć do pracy</h1>
          <p className="section-copy mx-auto mt-5 max-w-2xl">
            Kilka konkretnych informacji wystarczy, żeby lokalne firmy mogły Cię znaleźć i odezwać się bezpośrednio.
          </p>
        </div>
      </section>

      <section className="container mx-auto py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,672px)] lg:items-start lg:justify-center lg:gap-10">
          <aside className="lg:sticky lg:top-28">
            <div className="surface p-5 sm:p-6">
              <p className="section-kicker">Zanim zaczniesz</p>
              <h2 className="mt-2 text-xl font-bold">Tylko to, co ważne</h2>
              <div className="mt-6 space-y-5">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary">
                      <Icon name={benefit.icon} size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-bold">{benefit.title}</p>
                      <p className="mt-1 text-xs leading-5 text-muted">{benefit.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-ink p-5 text-white">
              <Icon name="copy" size={20} className="text-lime" />
              <p className="mt-3 text-sm font-bold text-white">Nie wiesz, co napisać?</p>
              <p className="mt-1 text-xs leading-5 text-neutral-300">Skorzystaj z gotowego przykładu i popraw tylko szczegóły.</p>
              <Link href="/jobs" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-lime hover:text-white">
                Podejrzyj inne fuchy <Icon name="arrow-right" size={15} />
              </Link>
            </div>
          </aside>

          <div>
            <Suspense fallback={<div className="surface p-8 text-center text-muted">Ładowanie formularza...</div>}>
              <JobForm />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
