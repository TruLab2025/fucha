import React from 'react';

const gainGroups = [
  {
    title: 'Dla osób szukających fuchy',
    items: [
      'Lokalne zlecenia pod ręką.',
      'Bez CV i rejestracji.',
    ],
  },
  {
    title: 'Dla firm i zleceniodawców',
    items: [
      'Szybkie dodanie ogłoszenia.',
      'Szybszy kontakt z ludźmi z okolicy.',
    ],
  },
];

export default function GainsSection() {
  return (
    <section className="py-20 bg-neutral">
      <h2 className="text-3xl font-bold text-center">Co zyskujesz od razu</h2>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {gainGroups.map(group => (
          <div key={group.title} className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold">{group.title}</h3>
            <ul className="mt-4 space-y-2 text-gray-600">
              {group.items.map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 text-primary">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}