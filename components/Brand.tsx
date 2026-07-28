import React from 'react';

interface BrandProps {
  compact?: boolean;
  inverse?: boolean;
}

export default function Brand({ compact = false, inverse = false }: BrandProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-primary text-white shadow-lg shadow-primary-200/60">
        <span className="text-lg font-black tracking-[-0.08em]">F</span>
        <span className="absolute -bottom-2 -right-2 h-5 w-5 rounded-full bg-lime" />
      </span>
      {!compact && (
        <span className={`text-xl font-black tracking-[-0.055em] ${inverse ? 'text-white' : 'text-ink'}`}>
          Fucha<span className={inverse ? 'text-lime' : 'text-primary'}>24</span>
        </span>
      )}
    </span>
  );
}
