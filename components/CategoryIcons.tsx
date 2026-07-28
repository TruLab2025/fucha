import React from 'react';
import Link from 'next/link';
import Icon, { IconName } from './Icon';

const categories: { icon: IconName; label: string }[] = [
  { icon: 'transport', label: 'Transport' },
  { icon: 'leaf', label: 'Ogród' },
  { icon: 'hammer', label: 'Budowa' },
  { icon: 'package', label: 'Magazyn' },
  { icon: 'plus', label: 'Inne' },
];

export default function CategoryIcons() {
  return (
    <div className="relative border-t border-neutral-200/80 bg-white/70 backdrop-blur">
      <div className="container mx-auto py-5">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 lg:justify-center lg:overflow-visible">
          <span className="mr-1 shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">Popularne</span>
          {categories.map((category) => (
            <Link
              key={category.label}
              href={`/jobs?category=${encodeURIComponent(category.label)}`}
              className="group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-bold text-neutral-600 shadow-sm hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary"
            >
              <Icon name={category.icon} size={18} className="text-neutral-400 group-hover:text-primary" />
              {category.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
