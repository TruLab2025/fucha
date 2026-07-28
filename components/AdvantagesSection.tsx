import React from 'react';
import Link from 'next/link';
import Icon, { IconName } from './Icon';

const items: { icon: IconName; title: string; text: string }[] = [
  { icon: 'zap', title: 'Start w kilka minut', text: 'Krótki formularz i od razu jesteś widoczny dla lokalnych zleceniodawców.' },
  { icon: 'shield', title: 'Kontakt pod kontrolą', text: 'Numer nie leży publicznie na stronie — firmy odkrywają go świadomie.' },
  { icon: 'map-pin', title: 'Naprawdę lokalnie', text: 'Miasto, województwo i termin pomagają szybko znaleźć sensowne dopasowanie.' },
  { icon: 'file', title: 'Bez CV i konta', text: 'Liczy się to, co potrafisz, kiedy możesz i za jaką stawkę chcesz pracować.' },
];

export default function AdvantagesSection() {
  return (
    <div className="noise-wash py-20 sm:py-28">
      <div className="container mx-auto grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16">
        <div>
          <p className="section-kicker">Mniej tarcia, więcej konkretu</p>
          <h2 className="section-title mt-3">Stworzone dla szybkich, lokalnych decyzji</h2>
          <p className="section-copy mt-5 max-w-xl">
            Fucha24 skraca drogę od „mam wolny dzień” do „widzimy się jutro rano”. Bez budowania profilu i bez czekania na odpowiedź tygodniami.
          </p>
          <Link href="/faq" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-700">
            Zobacz najczęstsze pytania
            <Icon name="arrow-right" size={17} />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item, index) => (
            <article key={item.title} className={`surface p-6 ${index === 1 ? 'sm:translate-y-6' : ''}`}>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-lime">
                <Icon name={item.icon} size={21} />
              </span>
              <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
