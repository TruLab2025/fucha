import React from 'react';
import Link from 'next/link';
import Icon, { IconName } from './Icon';

const workerSteps: { title: string; desc: string; icon: IconName }[] = [
  { title: 'Dodaj wolny termin', desc: 'Napisz krótko, co potrafisz, gdzie jesteś i kiedy możesz działać.', icon: 'calendar' },
  { title: 'Pokaż się lokalnie', desc: 'Firmy i zleceniodawcy z okolicy zobaczą Twoją dostępność.', icon: 'map-pin' },
  { title: 'Dogadaj szczegóły', desc: 'Kontaktujecie się bezpośrednio i ustalacie stawkę oraz zakres pracy.', icon: 'phone' },
];

const companySteps: { title: string; desc: string; icon: IconName }[] = [
  { title: 'Ustaw konkretne filtry', desc: 'Wybierz miasto, termin i rodzaj pomocy, której teraz potrzebujesz.', icon: 'filter' },
  { title: 'Sprawdź dostępne osoby', desc: 'Od razu widzisz opis, stawkę i realną dostępność kandydatów.', icon: 'users' },
  { title: 'Odkryj kontakt', desc: 'Masz 5 bezpłatnych numerów na start. W PRO kontaktujesz się bez limitu.', icon: 'lock' },
];

function PathCard({
  accent,
  label,
  title,
  steps,
  href,
  cta,
}: {
  accent: 'blue' | 'green';
  label: string;
  title: string;
  steps: { title: string; desc: string; icon: IconName }[];
  href: string;
  cta: string;
}) {
  const isBlue = accent === 'blue';

  return (
    <article className={`relative overflow-hidden rounded-4xl border bg-white p-6 shadow-card sm:p-8 ${isBlue ? 'border-primary-100' : 'border-green-100'}`}>
      <div className={`absolute right-0 top-0 h-32 w-32 rounded-bl-full ${isBlue ? 'bg-primary-50' : 'bg-green-50'}`} aria-hidden="true" />
      <p className={`relative text-xs font-bold uppercase tracking-[0.18em] ${isBlue ? 'text-primary' : 'text-green-700'}`}>{label}</p>
      <h3 className="relative mt-3 max-w-sm text-2xl font-bold leading-tight sm:text-3xl">{title}</h3>

      <ol className="relative mt-8 space-y-6">
        {steps.map((step, index) => (
          <li key={step.title} className="grid grid-cols-[48px_1fr] gap-4">
            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isBlue ? 'bg-primary-50 text-primary' : 'bg-green-50 text-green-700'}`}>
              <Icon name={step.icon} size={21} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-neutral-400">0{index + 1}</span>
                <p className="font-bold text-ink">{step.title}</p>
              </div>
              <p className="mt-1 text-sm leading-6 text-muted">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>

      <Link href={href} className={`mt-8 w-full ${isBlue ? 'btn-primary' : 'btn-green'}`}>
        {cta}
        <Icon name="arrow-right" size={18} />
      </Link>
    </article>
  );
}

export default function HowItWorks() {
  return (
    <div className="bg-white py-20 sm:py-28">
      <div className="container mx-auto">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-kicker">Prosty proces po obu stronach</p>
          <h2 className="section-title mt-3">Od wolnego terminu do dogadanej roboty</h2>
          <p className="section-copy mx-auto mt-5 max-w-2xl">
            Bez wieloetapowej rekrutacji. Pokazujesz konkret, znajdujesz właściwą osobę i przechodzisz prosto do rozmowy.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <PathCard
            accent="blue"
            label="Chcę dorobić"
            title="Mam czas i chcę znaleźć konkretną fuchę"
            steps={workerSteps}
            href="/add"
            cta="Dodaj swoją dostępność"
          />
          <PathCard
            accent="green"
            label="Potrzebuję pomocy"
            title="Szukam osoby gotowej wejść do pracy"
            steps={companySteps}
            href="/companies/browse"
            cta="Zobacz dostępne osoby"
          />
        </div>
      </div>
    </div>
  );
}
