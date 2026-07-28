"use client";

import React, { useState } from 'react';
import Icon from './Icon';

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
    text: 'Prosty i intuicyjny serwis, szybko dostałem odpowiedź od klienta.',
  },
  {
    name: 'Monika Z.',
    role: 'transportowiec',
    text: 'Fucha24 to idealne miejsce dla kierowców szukających zleceń.',
  },
];

export default function TestimonialsSection() {
  // 1 na telefonie, 2 na tablecie, 3 na desktopie
  const [perPage, setPerPage] = React.useState(1);
  React.useEffect(() => {
    const update = () => {
      if (window.innerWidth < 768) setPerPage(1);
      else if (window.innerWidth < 1024) setPerPage(2);
      else setPerPage(3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  // each element is an array of testimonials
  const pages: typeof testimonials[] = [];
  for (let i = 0; i < testimonials.length; i += perPage) {
    pages.push(testimonials.slice(i, i + perPage));
  }

  const [pageIndex, setPageIndex] = useState(0);
  const totalPages = pages.length;

  React.useEffect(() => {
    setPageIndex((current) => Math.min(current, Math.max(0, totalPages - 1)));
  }, [totalPages]);

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
    <section className="relative overflow-hidden border-y border-neutral-200 bg-neutral-50 py-20 sm:py-24">
      <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-lime/25 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-primary-100/70 blur-3xl" aria-hidden="true" />

      <div className="container relative mx-auto">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-kicker">Historie z okolicy</p>
          <h2 className="section-title mt-3">Mało formalności. Dużo konkretu.</h2>
          <p className="section-copy mx-auto mt-5 max-w-2xl">
            Użytkownicy wracają tu po prosty proces, szybki kontakt i lokalne ogłoszenia, które da się realnie zamknąć bez długiej rekrutacji.
          </p>
        </div>

        <div
          className="relative mt-12"
          role="region"
          aria-roledescription="karuzela"
          aria-label="Opinie użytkowników"
        >
          <div
            id="testimonials-carousel"
            className="cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing"
            ref={sliderRef}
            aria-live="polite"
            onMouseDown={(e) => onDragStart(e.clientX)}
            onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
            onTouchEnd={onDragEnd}
          >
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{
                transform: `translateX(calc(-${pageIndex * 100}% + ${dragX}px))`,
              }}
            >
              {pages.map((group, gidx) => (
                <div
                  key={gidx}
                  className="flex min-w-full items-stretch gap-3 sm:gap-4 lg:gap-6"
                  aria-hidden={gidx !== pageIndex}
                >
                  {group.map((t, idx) => {
                    const initials = t.name
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join('')
                      .toUpperCase();

                    return (
                      <article
                        key={idx}
                        className="surface flex min-h-[300px] min-w-0 flex-1 flex-col p-6 sm:p-5 lg:p-7"
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime text-ink" aria-hidden="true">
                          <Icon name="quote" size={22} />
                        </span>
                        <blockquote className="mt-6 flex-1 text-base font-semibold leading-7 text-neutral-700 lg:text-lg lg:leading-8">
                          {t.text}
                        </blockquote>
                        <div className="mt-7 flex items-center gap-3 border-t border-neutral-100 pt-5">
                          <span
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-black text-primary"
                            aria-hidden="true"
                          >
                            {initials}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-ink">{t.name}</p>
                            <p className="mt-0.5 truncate text-xs font-semibold capitalize text-muted">{t.role}</p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-1" role="group" aria-label="Wybór strony opinii">
            {pages.map((_, idx) => {
              const isCurrent = idx === pageIndex;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPageIndex(idx)}
                  aria-label={`Pokaż stronę opinii ${idx + 1} z ${totalPages}`}
                  aria-controls="testimonials-carousel"
                  aria-current={isCurrent ? 'page' : undefined}
                  className="group inline-flex h-11 w-11 items-center justify-center rounded-full"
                >
                  <span
                    className={`h-2.5 rounded-full transition-all duration-200 ${
                      isCurrent
                        ? 'w-7 bg-primary'
                        : 'w-2.5 bg-neutral-500 group-hover:bg-neutral-600'
                    }`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
