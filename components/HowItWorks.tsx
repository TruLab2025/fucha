// components/HowItWorks.tsx
import React from 'react';

const workerSteps = [
  {
    num: 1,
    title: 'Znajdź fuchę',
    desc: 'Przejrzyj lokalne ogłoszenia.',
    icon: '🔎',
  },
  {
    num: 2,
    title: 'Odezwij się szybko',
    desc: 'Bez CV i bez zakładania konta.',
    icon: '📲',
  },
  {
    num: 3,
    title: 'Dogadaj termin',
    desc: 'Ustal szczegóły i działaj.',
    icon: '🤝',
  },
];

const companySteps = [
  {
    num: 1,
    title: 'Dodaj ogłoszenie',
    desc: 'Krótko, bez zbędnych formalności.',
    icon: '✍️',
  },
  {
    num: 2,
    title: 'Odbierz zgłoszenia',
    desc: 'Docierasz do ludzi z okolicy.',
    icon: '🧑‍🤝‍🧑',
  },
  {
    num: 3,
    title: 'Zamknij temat',
    desc: 'Kontaktujesz się i ustalasz szczegóły.',
    icon: '✅',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20">
      <h2 className="text-3xl font-bold text-center">Jak działa</h2>
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-center">Mam czas i chcę dorobić</h3>
          <div className="mt-6 space-y-5">
            {workerSteps.map(step => (
              <div key={step.num} className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-blue-400 bg-white text-2xl">
                  <span>{step.icon}</span>
                </div>
                <div>
                  <p className="font-semibold">{step.num}. {step.title}</p>
                  <p className="mt-1 text-sm text-gray-600 leading-6">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-center">Szukam ludzi do pracy</h3>
          <div className="mt-6 space-y-5">
            {companySteps.map(step => (
              <div key={step.num} className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-green bg-white text-2xl">
                  <span>{step.icon}</span>
                </div>
                <div>
                  <p className="font-semibold">{step.num}. {step.title}</p>
                  <p className="mt-1 text-sm text-gray-600 leading-6">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
