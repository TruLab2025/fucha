// app/page.tsx
import React from 'react';
import HeroSection from '../components/HeroSection';
import HowItWorks from '../components/HowItWorks';
import JobGrid from '../components/JobGrid';
import PricingSection from '../components/PricingSection';
import AdvantagesSection from '../components/AdvantagesSection';
import TestimonialsSection from '../components/TestimonialsSection';
import { Listing } from '../lib/db';

const sampleJobs: Listing[] = [
  {
    id: '1',
    title: 'Przeprowadzka 2-pokojowe mieszkanie',
    description: '',
    province: 'Mazowieckie',
    city: 'Warszawa',
    category: 'Transport',
    available_date: '2026-03-10',
    available_hours: '8',
    rate: '200 zł',
    phone: '123456789',
    email: 'user@example.com',
    created_at: new Date().toISOString(),
  },

  {
    id: '2',
    title: 'Koszenie trawy w ogrodzie',
    description: '',
    province: 'Małopolskie',
    city: 'Kraków',
    category: 'Ogród',
    available_date: '2026-03-12',
    available_hours: '5',
    rate: '50 zł/h',
    phone: '987654321',
    email: 'user2@example.com',
    created_at: new Date().toISOString(),
  },

  {
    id: '3',
    title: 'Malarz - pokój 20m²',
    description: '',
    province: 'Wielkopolskie',
    city: 'Poznań',
    category: 'Budowa',
    available_date: '2026-03-15',
    available_hours: '8',
    rate: '120 zł',
    phone: '555666777',
    email: 'user3@example.com',
    created_at: new Date().toISOString(),
  },

];

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <HowItWorks />
      <section className="py-20">
        <h2 className="text-3xl font-bold text-center">Ostatnie fuchy</h2>
        <div className="mt-8">
          <JobGrid jobs={sampleJobs} />
        </div>
      </section>
      <PricingSection />
      <AdvantagesSection />
      <TestimonialsSection />
    </main>
  );
}
