import React from 'react';
import Link from 'next/link';

const faqItems = [
  {
    question: 'Czym jest Fucha24?',
    answer: 'To prosta strona do szybkiego łączenia osób, które chcą dorobić, z firmami i zleceniodawcami, którzy szukają ludzi do pracy.',
  },
  {
    question: 'Czy muszę zakładać konto?',
    answer: 'Nie. Możesz przeglądać oferty i przejść do kontaktu bez zakładania konta.',
  },
  {
    question: 'Czy potrzebuję CV?',
    answer: 'Nie. Tutaj liczy się szybki kontakt, dostępność, lokalizacja i konkretne ustalenia.',
  },
  {
    question: 'Jak dodać ogłoszenie?',
    answer: 'Wybierz ścieżkę dla osoby szukającej pracy albo dla firmy, wypełnij krótki formularz i opublikuj ofertę lub zgłoszenie.',
  },
  {
    question: 'Czy korzystanie jest darmowe?',
    answer: 'Dla osób szukających pracy tak. Firmy mogą zacząć za darmo, a większy dostęp do kontaktów odblokować planem PRO.',
  },
  {
    question: 'Dla jakich prac to działa?',
    answer: 'Najlepiej dla lokalnych, szybkich zleceń: transport, ogród, budowa, magazyn i podobne prace, gdzie liczy się sprawny kontakt.',
  },
  {
    question: 'Jak szybko mogę się skontaktować?',
    answer: 'Jeśli ogłoszenie jest aktualne, kontakt może nastąpić od razu po wysłaniu wiadomości przez formularz.',
  },
  {
    question: 'Czy Fucha24 działa w całej Polsce?',
    answer: 'Tak, ale największą wartość daje przy lokalnych ofertach i osobach z Twojej okolicy.',
  },
];

export default function FaqPage() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">FAQ</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight">Najczęstsze pytania</h1>
        <p className="mt-4 text-gray-600 leading-7">
          Krótko i konkretnie: jak działa Fucha24, dla kogo jest i kiedy warto z niego skorzystać.
        </p>

        <div className="mt-10 space-y-4">
          {faqItems.map((item) => (
            <details key={item.question} className="rounded-2xl bg-white p-5 shadow-sm">
              <summary className="cursor-pointer list-none font-semibold text-text">
                {item.question}
              </summary>
              <p className="mt-3 text-gray-600 leading-7">{item.answer}</p>
            </details>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-neutral px-6 py-8 text-center">
          <p className="text-xl font-semibold">Wiesz już, co dalej?</p>
          <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/add" className="w-full rounded-xl bg-primary px-6 py-3 text-center text-white shadow-sm transition hover:bg-blue-700 sm:w-auto">
              Mam czas i chcę dorobić
            </Link>
            <Link href="/companies/browse" className="w-full rounded-xl bg-green px-6 py-3 text-center text-white transition hover:bg-green-600 sm:w-auto">
              Szukam ludzi do pracy
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}