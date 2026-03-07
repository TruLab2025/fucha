// components/CategoryIcons.tsx
import React from 'react';

const categories = [
  { icon: '🚚', label: 'Transport' },
  { icon: '🌿', label: 'Ogród' },
  { icon: '🔨', label: 'Budowa' },
  { icon: '📦', label: 'Magazyn' },
  { icon: '➕', label: 'Inne' },
];

export default function CategoryIcons() {
  return (
    <div className="mt-10 flex justify-center space-x-6 text-2xl">
      {categories.map(cat => (
        <div key={cat.label} className="flex flex-col items-center">
          <span>{cat.icon}</span>
          <span className="text-sm mt-1">{cat.label}</span>
        </div>
      ))}
    </div>
  );
}
