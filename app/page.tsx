// app/page.tsx
import React from 'react';
import HeroSection from '../components/HeroSection';
import HowItWorks from '../components/HowItWorks';
import JobGrid from '../components/JobGrid';
import PricingSection from '../components/PricingSection';
import AdvantagesSection from '../components/AdvantagesSection';
import TestimonialsSection from '../components/TestimonialsSection';
import { getListings } from '../lib/db';
import Link from 'next/link';
import Icon from '../components/Icon';

export default async function HomePage() {
  const latestWorkerJobs = (await getListings({ type: 'worker' })).slice(0, 3);

  return (
    <>
      <HeroSection />
      <section id="how-it-works">
        <HowItWorks />
      </section>
      <section className="py-20 sm:py-28">
        <div className="container mx-auto">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-kicker">Ostatnio dodane</p>
              <h2 className="section-title mt-3">Zobacz, jak ogłaszają się inni</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                Podejrzyj realne przykłady, wybierz podobną fuchę i przenieś jej układ do swojego formularza jednym kliknięciem.
              </p>
            </div>
            <Link href="/jobs" className="btn-secondary shrink-0">
              Wszystkie przykłady
              <Icon name="arrow-right" size={18} />
            </Link>
          </div>
          <div className="mt-10">
            <JobGrid jobs={latestWorkerJobs} />
          </div>
        </div>
      </section>
      <section id="advantages">
        <AdvantagesSection />
      </section>
      <section id="testimonials">
        <TestimonialsSection />
      </section>
      <section id="pricing">
        <PricingSection />
      </section>
    </>
  );
}
