// components/TestimonialsSection.tsx
"use client";
import React, { useState } from 'react';

const testimonials = [
  {
    name: 'Jan Kowalski',
    role: 'kierowca',
    text: 'Dzięki Fucha24 znalazłem kilka zleceń w pobliżu i dorobiłem w weekend.',
  },
  {
    name: 'Firma Budowlana XYZ',
    role: 'majster',
    text: 'Szybko skontaktowałem się z ekipą do malowania. Prosty formularz i komunikacja przez email.',
  },
  {
    name: 'Ewa Nowak',
    role: 'ogrodniczka',
    text: 'Uwielbiam, że nie muszę tworzyć konta. Wystarczyło wpisać ofertę i czekać na zgłoszenia.',
  },
  {
    name: 'Adam Nowak',
    role: 'magazynier',
    text: 'Dzięki filtrom szybko znalazłem odpowiednie ogłoszenie. Polecam.',
  },
  {
    name: 'Karol K.',
    role: 'ogrodnik',
    text: 'Prosty i intuicyjny serwis, szybko dostałem odpowiedź from klienta.',
  },
  {
    name: 'Monika Z.',
    role: 'transportowiec',
    text: 'Fucha24 to idealne miejsce dla kierowców szukających zleceń.',
  },
];

export default function TestimonialsSection() {
  const perPage = 3;
  // each element is an array of testimonials
  const pages: typeof testimonials[] = [];
  for (let i = 0; i < testimonials.length; i += perPage) {
    pages.push(testimonials.slice(i, i + perPage));
  }

  const [pageIndex, setPageIndex] = useState(0);
  const totalPages = pages.length;

  const prev = () => setPageIndex((i) => (i - 1 + totalPages) % totalPages);
  const next = () => setPageIndex((i) => (i + 1) % totalPages);

  const sliderRef = React.useRef<HTMLDivElement>(null);
  const startX = React.useRef(0);
  const [dragX, setDragX] = useState(0);
  const isDragging = React.useRef(false);

  const onDragStart = (clientX: number) => {
    isDragging.current = true;
    startX.current = clientX;
  };
  const onDragMove = (clientX: number) => {
    if (!isDragging.current) return;
    const diff = clientX - startX.current;
    setDragX(diff);
  };
  const onDragEnd = () => {
    if (!isDragging.current) return;
    const width = sliderRef.current?.clientWidth || window.innerWidth;
    const threshold = width / 3;
    if (dragX > threshold) prev();
    else if (dragX < -threshold) next();
    setDragX(0);
    isDragging.current = false;
  };

  // track mouse events globally for drag
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => onDragMove(e.clientX);
    const handleMouseUp = () => onDragEnd();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragX]);

  return (
    <section className="py-20 bg-neutral">
      <h2 className="text-3xl font-bold text-center">Opinie użytkowników</h2>
      <div className="relative mt-10">
        {/* arrows removed, dragging handles navigation */}
        <div
          className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
          ref={sliderRef}
          onMouseDown={(e) => onDragStart(e.clientX)}
          onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
          onTouchEnd={onDragEnd}
        >
          <div
            className="flex transition-transform duration-300"
            style={{
              transform: `translateX(calc(-${pageIndex * 100}% + ${dragX}px))`,
            }}
          >
            {pages.map((group, gidx) => (
              <div key={gidx} className="min-w-full flex gap-4">
                {group.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-white p-4 rounded-xl shadow"
                  >
                    <p className="text-gray-800 text-sm">“{t.text}”</p>
                    <p className="mt-2 font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{t.role}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* no right arrow */}
      </div>
      <div className="mt-4 flex justify-center space-x-2">
        {pages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setPageIndex(idx)}
            className={`w-3 h-3 rounded-full ${
              idx === pageIndex ? 'bg-primary' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
