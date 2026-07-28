import React from 'react';
import Icon from '../../components/Icon';

const sections = [
  {
    title: '1. Informacje ogólne',
    paragraphs: [
      'Niniejszy regulamin określa zasady korzystania z serwisu Fucha24, służącego do publikowania lokalnych ogłoszeń oraz nawiązywania kontaktu między osobami szukającymi pracy a firmami i zleceniodawcami.',
      'Regulamin ma charakter przykładowy i powinien zostać dostosowany do rzeczywistego modelu działania serwisu, danych operatora oraz obowiązków prawnych przed publikacją produkcyjną.',
    ],
  },
  {
    title: '2. Definicje',
    paragraphs: [
      'Serwis: platforma internetowa Fucha24 dostępna pod odpowiednią domeną.',
      'Użytkownik: osoba fizyczna, firma lub inny podmiot korzystający z serwisu.',
      'Ogłoszenie: treść dodana przez użytkownika w celu znalezienia pracy, zlecenia lub pracownika.',
    ],
  },
  {
    title: '3. Zakres usługi',
    paragraphs: [
      'Serwis umożliwia publikację ogłoszeń, przeglądanie ofert oraz kontakt pomiędzy użytkownikami za pomocą udostępnionych formularzy i funkcji.',
      'Operator serwisu nie jest stroną umów zawieranych pomiędzy użytkownikami i nie gwarantuje zawarcia współpracy ani wykonania zlecenia.',
    ],
  },
  {
    title: '4. Zasady korzystania',
    paragraphs: [
      'Użytkownik zobowiązuje się do podawania prawdziwych danych, publikowania treści zgodnych z prawem oraz niewprowadzania w błąd innych osób korzystających z serwisu.',
      'Zabronione jest publikowanie treści bezprawnych, obraźliwych, naruszających prawa osób trzecich lub niezwiązanych z celem serwisu.',
    ],
  },
  {
    title: '5. Ogłoszenia i kontakt',
    paragraphs: [
      'Użytkownik ponosi pełną odpowiedzialność za treść publikowanych ogłoszeń oraz za działania podejmowane po nawiązaniu kontaktu z innymi użytkownikami.',
      'Operator może usuwać lub ograniczać widoczność treści, które naruszają regulamin albo budzą uzasadnione wątpliwości co do ich rzetelności.',
    ],
  },
  {
    title: '6. Płatności i plany',
    paragraphs: [
      'Wybrane funkcje serwisu mogą być odpłatne, zgodnie z aktualną ofertą prezentowaną w serwisie.',
      'Szczegółowe warunki płatnych planów, okresy rozliczeniowe i zasady rozliczeń powinny zostać doprecyzowane przez operatora przed uruchomieniem sprzedaży.',
    ],
  },
  {
    title: '7. Reklamacje',
    paragraphs: [
      'Reklamacje dotyczące działania serwisu mogą być zgłaszane drogą elektroniczną na adres kontaktowy operatora.',
      'Przykładowy termin odpowiedzi na reklamację wynosi 14 dni od dnia jej otrzymania.',
    ],
  },
  {
    title: '8. Odpowiedzialność',
    paragraphs: [
      'Operator dokłada starań, aby serwis działał w sposób ciągły, jednak nie gwarantuje nieprzerwanej dostępności ani braku błędów technicznych.',
      'W zakresie dopuszczalnym przez prawo operator nie odpowiada za skutki decyzji podjętych przez użytkowników na podstawie ogłoszeń zamieszczonych w serwisie.',
    ],
  },
  {
    title: '9. Postanowienia końcowe',
    paragraphs: [
      'Regulamin może być aktualizowany. Zmiany wchodzą w życie w terminie wskazanym przez operatora.',
      'W sprawach nieuregulowanych zastosowanie mają odpowiednie przepisy prawa polskiego.',
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <section className="noise-wash border-b border-neutral-200 py-14 sm:py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="eyebrow"><Icon name="file" size={15} /> Dokumenty</span>
          <h1 className="mt-5 text-4xl font-black leading-[1.03] sm:text-5xl lg:text-6xl">Regulamin Fucha24</h1>
          <p className="section-copy mx-auto mt-5 max-w-3xl">
            Zasady publikowania lokalnych ogłoszeń i nawiązywania kontaktu w serwisie.
          </p>
          <div className="mx-auto mt-7 flex max-w-3xl items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-left text-sm leading-6 text-amber-900">
            <Icon name="shield" size={20} className="mt-0.5 shrink-0" />
            <p><strong>Wersja robocza:</strong> przed publikacją produkcyjną dokument należy uzupełnić o dane operatora, politykę prywatności i pełne zasady płatności.</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-12 sm:py-16">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
          <aside className="hidden lg:sticky lg:top-28 lg:block">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">W tym dokumencie</p>
            <nav className="mt-4 space-y-1" aria-label="Spis treści regulaminu">
              {sections.map((section, index) => (
                <a key={section.title} href={`#terms-${index + 1}`} className="block rounded-lg px-3 py-2 text-sm font-semibold text-neutral-500 hover:bg-white hover:text-primary">
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          <article className="surface overflow-hidden px-5 sm:px-8">
            {sections.map((section, index) => (
              <section key={section.title} id={`terms-${index + 1}`} className="scroll-mt-28 border-b border-neutral-200 py-7 last:border-0 sm:py-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-xs font-black text-primary">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h2 className="text-xl font-bold">{section.title.replace(/^\d+\.\s*/, '')}</h2>
                    <div className="mt-3 space-y-3 text-sm leading-7 text-muted sm:text-base">
                      {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </article>
        </div>
      </section>
    </>
  );
}
