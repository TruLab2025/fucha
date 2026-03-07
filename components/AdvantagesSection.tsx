// components/AdvantagesSection.tsx
import React from 'react';

const items = [
  { icon: '⚡', text: 'szybka rejestracja' },
  { icon: '📄', text: 'brak CV' },
  { icon: '📍', text: 'lokalni pracownicy' },
  { icon: '🔔', text: 'powiadomienia' },
];

export default function AdvantagesSection() {
  return (
    <section className="py-20">
      <h2 className="text-3xl font-bold text-center">Zalety</h2>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {items.map(item => (
          <div
            key={item.text}
            className="flex flex-col items-center bg-white rounded-xl p-6 shadow hover:shadow-md transition"
          >
            <span className="text-3xl">{item.icon}</span>
            <p className="mt-2 font-medium capitalize text-center">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
