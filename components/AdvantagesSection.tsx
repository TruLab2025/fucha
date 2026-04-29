// components/AdvantagesSection.tsx
import React from 'react';
import Link from 'next/link';

const items = [
  {
    icon: '⚡',
    title: 'Start w kilka minut',
    text: 'Dodajesz ofertę albo zgłoszenie bez rozbudowanego procesu i bez czekania na akceptację.',
  },
  {
    icon: '📄',
    title: 'Bez CV i formalności',
    text: 'Liczy się dostępność, lokalizacja i konkret. Minimum tarcia, maksimum szybkiego kontaktu.',
  },
  {
    icon: '📍',
    title: 'Ludzie z Twojej okolicy',
    text: 'Przeglądasz lokalne fuchy i lokalnych pracowników, więc łatwiej dogadać termin i dojazd.',
  },
  {
    icon: '🔔',
    title: 'Szybkie decyzje',
    text: 'Jasny formularz i prosty kontakt skracają drogę od ogłoszenia do realnego zlecenia.',
  },
];

export default function AdvantagesSection() {
  return (
    <section className="py-20">
      <h2 className="text-3xl font-bold text-center">Zalety</h2>
      <p className="mt-4 max-w-2xl mx-auto text-center text-gray-600 leading-7">
        Mniej formalności, więcej lokalnych kontaktów i szybsza droga do dogadania roboty.
      </p>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {items.map(item => (
          <div
            key={item.title}
            className="flex flex-col items-center bg-white rounded-xl p-6 shadow hover:shadow-md transition"
          >
            <span className="text-3xl">{item.icon}</span>
            <p className="mt-3 font-semibold text-center">{item.title}</p>
            <p className="mt-2 text-sm text-gray-600 text-center leading-6">{item.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 rounded-2xl bg-neutral px-6 py-8 text-center">
        <p className="text-xl font-semibold">Chcesz ruszyć teraz?</p>
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/add" className="w-full rounded-xl bg-primary px-6 py-3 text-center text-white shadow-sm transition hover:bg-blue-700 sm:w-auto">
            Mam czas i chcę dorobić
          </Link>
          <Link href="/companies/browse" className="w-full rounded-xl bg-green px-6 py-3 text-center text-white transition hover:bg-green-600 sm:w-auto">
            Szukam ludzi do pracy
          </Link>
        </div>
      </div>
    </section>
  );
}
