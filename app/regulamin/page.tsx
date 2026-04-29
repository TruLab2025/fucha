import React from 'react';

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
    <section className="py-12">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Regulamin</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight">Przykładowy regulamin Fucha24</h1>
        <p className="mt-4 text-gray-600 leading-7">
          Poniższy dokument jest przykładową wersją regulaminu. Przed publikacją warto uzupełnić go o dane operatora, zasady płatności, politykę prywatności i szczegóły wymagane dla Twojego modelu działania.
        </p>

        <div className="mt-10 space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <div className="mt-3 space-y-3 text-gray-600 leading-7">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}