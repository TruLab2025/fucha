import React from 'react';
import Link from 'next/link';
import CategoryIcons from './CategoryIcons';
import Icon from './Icon';

export default function HeroSection() {
  return (
    <section className="noise-wash relative overflow-hidden border-b border-neutral-200">
      <div className="soft-grid absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="container relative mx-auto grid min-h-[680px] items-center gap-12 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:py-24">
        <div className="max-w-2xl">
          <span className="eyebrow">
            <Icon name="zap" size={15} />
            Lokalnie. Od ręki. Bez CV.
          </span>
          <h1 className="mt-6 text-[2.75rem] font-black leading-[0.98] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
            Masz wolny termin?
            <span className="mt-2 block text-primary">Ktoś ma dla Ciebie fuchę.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-muted sm:text-xl sm:leading-9">
            Dodaj swoją dostępność i pokaż się firmom z okolicy. Albo znajdź osobę gotową wskoczyć do pracy — bez kont, CV i długiej rekrutacji.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/add" className="btn-primary min-h-14 px-6 text-base">
              Chcę dorobić
              <Icon name="arrow-right" size={19} />
            </Link>
            <Link href="/companies/browse" className="btn-green min-h-14 px-6 text-base">
              <Icon name="users" size={20} />
              Szukam ludzi do pracy
            </Link>
          </div>

          <Link href="/jobs" className="mt-5 inline-flex items-center gap-2 rounded-lg text-sm font-bold text-ink hover:text-primary">
            <Icon name="copy" size={17} />
            Podejrzyj, jak ogłaszają się inni
            <Icon name="arrow-up-right" size={15} />
          </Link>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-neutral-300/70 pt-6 text-sm font-semibold text-neutral-600">
            <span className="flex items-center gap-2"><Icon name="check" size={17} className="text-green-600" /> Bez zakładania konta</span>
            <span className="flex items-center gap-2"><Icon name="check" size={17} className="text-green-600" /> Kontakt w kilka minut</span>
            <span className="flex items-center gap-2"><Icon name="check" size={17} className="text-green-600" /> Ogłoszenia z okolicy</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:mx-0">
          <div className="absolute -left-5 top-20 hidden h-40 w-40 rounded-full bg-lime blur-3xl sm:block" aria-hidden="true" />
          <div className="absolute -right-10 bottom-6 h-52 w-52 rounded-full bg-primary-200/70 blur-3xl" aria-hidden="true" />

          <div className="relative rotate-[-1.25deg] rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-float sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Dostępny od jutra
              </span>
              <span className="text-xs font-semibold text-neutral-400">Przykładowe ogłoszenie</span>
            </div>

            <div className="mt-6 flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary">
                <Icon name="package" size={28} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Przeprowadzki</p>
                <h2 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">Pomogę przy noszeniu i transporcie</h2>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-neutral-50 p-4">
                <Icon name="map-pin" size={18} className="text-primary" />
                <p className="mt-2 text-xs font-semibold text-neutral-500">Lokalizacja</p>
                <p className="mt-0.5 font-bold">Wrocław</p>
              </div>
              <div className="rounded-2xl bg-neutral-50 p-4">
                <Icon name="clock" size={18} className="text-primary" />
                <p className="mt-2 text-xs font-semibold text-neutral-500">Dostępność</p>
                <p className="mt-0.5 font-bold">5 godzin</p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-neutral-600">
              Mam doświadczenie przy przeprowadzkach, własne rękawice i mogę dojechać na terenie miasta.
            </p>

            <div className="mt-6 flex items-end justify-between gap-4 border-t border-neutral-100 pt-5">
              <div>
                <p className="text-xs font-semibold text-neutral-500">Stawka</p>
                <p className="mt-0.5 text-3xl font-black tracking-tight text-ink">55 zł<span className="text-base font-bold text-neutral-500"> / h</span></p>
              </div>
              <span className="inline-flex h-12 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-bold text-white">
                <Icon name="phone" size={18} />
                Pokaż kontakt
              </span>
            </div>
          </div>

          <div className="absolute -bottom-7 -left-3 flex max-w-[250px] rotate-[2deg] items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-card sm:-left-10">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime text-ink">
              <Icon name="sparkles" size={19} />
            </span>
            <p className="text-xs font-semibold leading-5 text-neutral-700">Nowe dopasowanie w Twojej okolicy — 2,4 km</p>
          </div>
        </div>
      </div>

      <CategoryIcons />
    </section>
  );
}
