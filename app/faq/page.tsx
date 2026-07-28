import React from 'react';
import Link from 'next/link';
import Icon from '../../components/Icon';

const faqItems = [
  { question: 'Czym jest Fucha24?', answer: 'To prosta strona do szybkiego łączenia osób, które chcą dorobić, z firmami i zleceniodawcami, którzy szukają ludzi do pracy.' },
  { question: 'Czy muszę zakładać konto?', answer: 'Nie. Możesz dodać swoją dostępność i przeglądać ogłoszenia bez zakładania konta.' },
  { question: 'Czy potrzebuję CV?', answer: 'Nie. Tutaj liczy się szybki kontakt, dostępność, lokalizacja i konkretne ustalenia.' },
  { question: 'Jak dodać ogłoszenie?', answer: 'Kliknij „Dodaj dostępność”, wypełnij krótki formularz z terminem, miejscem i stawką, a następnie opublikuj zgłoszenie.' },
  { question: 'Czy korzystanie jest darmowe?', answer: 'Dla osób szukających pracy tak. Firmy mają 5 bezpłatnych odkryć numeru na start, a plan PRO usuwa ten limit.' },
  { question: 'Dla jakich prac to działa?', answer: 'Najlepiej dla lokalnych, szybkich zleceń: transport, ogród, budowa, magazyn i podobne prace, gdzie liczy się sprawny kontakt.' },
  { question: 'Jak szybko można się skontaktować?', answer: 'Od razu po znalezieniu pasującej osoby. Firma może odkryć numer i dogadać szczegóły bezpośrednio.' },
  { question: 'Czy Fucha24 działa w całej Polsce?', answer: 'Tak, ale największą wartość daje przy lokalnych ofertach i osobach z Twojej okolicy.' },
];

export default function FaqPage() {
  return (
    <>
      <section className="noise-wash border-b border-neutral-200 py-14 text-center sm:py-20">
        <div className="container mx-auto">
          <span className="eyebrow"><Icon name="sparkles" size={15} /> Pomoc bez formalności</span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-black leading-[1.03] sm:text-5xl lg:text-6xl">Najczęstsze pytania, konkretne odpowiedzi</h1>
          <p className="section-copy mx-auto mt-5 max-w-2xl">Wszystko, co warto wiedzieć przed dodaniem dostępności albo znalezieniem osoby do pracy.</p>
        </div>
      </section>

      <section className="container mx-auto py-12 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-3">
          {faqItems.map((item, index) => (
            <details key={item.question} className="group surface overflow-hidden open:border-primary-200">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-bold text-ink marker:hidden sm:px-6">
                <span className="flex items-center gap-3">
                  <span className="text-xs font-black text-neutral-400">{String(index + 1).padStart(2, '0')}</span>
                  {item.question}
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition group-open:rotate-45 group-open:bg-primary group-open:text-white">
                  <Icon name="plus" size={18} />
                </span>
              </summary>
              <p className="border-t border-neutral-100 px-5 py-5 pl-12 text-sm leading-7 text-muted sm:px-6 sm:pl-16">{item.answer}</p>
            </details>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-3xl bg-ink p-6 text-white shadow-float sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-lime">Wiesz już, co dalej?</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Przejdź prosto do działania</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-300">Dodaj wolny termin albo znajdź osobę z okolicy.</p>
            </div>
            <div className="flex shrink-0 flex-col gap-3">
              <Link href="/add" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-lime px-5 py-3 text-sm font-bold text-ink hover:bg-white">
                Chcę dorobić <Icon name="arrow-right" size={17} />
              </Link>
              <Link href="/companies/browse" className="inline-flex items-center justify-center gap-2 text-sm font-bold text-white hover:text-lime">
                Szukam ludzi <Icon name="arrow-up-right" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
