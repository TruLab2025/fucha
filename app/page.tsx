// app/page.tsx
import React from 'react';
import HeroSection from '../components/HeroSection';
import HowItWorks from '../components/HowItWorks';
import JobGrid from '../components/JobGrid';
import PricingSection from '../components/PricingSection';
import AdvantagesSection from '../components/AdvantagesSection';
import TestimonialsSection from '../components/TestimonialsSection';
import { getListings } from '../lib/db';

export default async function HomePage() {
  const latestWorkerJobs = (await getListings({ type: 'worker' })).slice(0, 6);

  return (
    <main>
      <HeroSection />
      <HowItWorks />
      <section className="py-20">
        <h2 className="text-3xl font-bold text-center">Ostatnie fuchy</h2>
        <div className="mt-8">
          <JobGrid jobs={latestWorkerJobs} />
        </div>
      </section>
      <PricingSection />
      <AdvantagesSection />
      <TestimonialsSection />
    </main>
  );
}
