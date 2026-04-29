// app/page.tsx
import React from 'react';
import HeroSection from '../components/HeroSection';
import HowItWorks from '../components/HowItWorks';
import JobGrid from '../components/JobGrid';
import PricingSection from '../components/PricingSection';
import AdvantagesSection from '../components/AdvantagesSection';
import GainsSection from '../components/GainsSection';
import TestimonialsSection from '../components/TestimonialsSection';
import { getListings } from '../lib/db';

export default async function HomePage() {
  const latestWorkerJobs = (await getListings({ type: 'worker' })).slice(0, 3);

  return (
    <>
      <HeroSection />
      <section id="how-it-works">
        <HowItWorks />
      </section>
      <section id="advantages">
        <AdvantagesSection />
      </section>
      <section className="py-20">
        <h2 className="text-3xl font-bold text-center">Ostatnie fuchy</h2>
        <div className="mt-8">
          <JobGrid jobs={latestWorkerJobs} />
        </div>
      </section>
      <section>
        <GainsSection />
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
