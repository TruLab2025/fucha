// components/HowItWorks.tsx
import React from 'react';

const steps = [
  {
    num: 1,
    title: 'Dodaj fuchę',
    desc: 'Wypełnij krótki formularz: tytuł, miasto, data i stawka. Ogłoszenie pokażemy od razu publicznie.',
    icon: '✍️',
  },
  {
    num: 2,
    title: 'Znajdź ludzi',
    desc: 'Przeglądaj oferty lub zgłoszenia pracowników. Filtruj według miasta, kategorii i daty.',
    icon: '🧑‍🤝‍🧑',
  },
  {
    num: 3,
    title: 'Zacznij pracę',
    desc: 'Napisz wiadomość przez formularz kontaktowy, otrzymaj email i umów się na realizację.',
    icon: '💼',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20">
      <h2 className="text-3xl font-bold text-center">Jak działa</h2>
      <div className="mt-10 flex flex-col md:flex-row justify-center items-start gap-10">
        {steps.map(step => (
          <div key={step.num} className="flex flex-col items-center max-w-xs text-center">
            <div className="w-24 h-24 flex items-center justify-center rounded-full shadow-md bg-white border-2 border-blue-400">
              <span className="text-5xl">{step.icon}</span>
            </div>
            <h3 className="mt-4 font-semibold text-lg">{step.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
