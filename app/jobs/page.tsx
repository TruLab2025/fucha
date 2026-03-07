// app/jobs/page.tsx
import React from 'react';
import { getListings } from '../../lib/db';
import JobCard from '../../components/JobCard';

interface JobsPageProps {
  searchParams?: {
    province?: string;
    city?: string;
    category?: string;
    date?: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const filters = {
    type: 'worker' as const,
    province: searchParams?.province,
    city: searchParams?.city,
    category: searchParams?.category,
    available_date: searchParams?.date,
  };
  const listings = await getListings(filters);

  return (
    <main className="py-12">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">Dostępne fuchy</h1>
        <p className="text-center text-gray-600 mb-8">Pracownicy szukają zleceń, mogą się z sobą łączyć</p>
        
        <form method="get" className="mb-8 grid grid-cols-1 sm:grid-cols-5 gap-4">
          <input
            name="province"
            placeholder="Województwo"
            defaultValue={searchParams?.province}
            className="border p-2 rounded"
          />
          <input
            name="city"
            placeholder="Miasto"
            defaultValue={searchParams?.city}
            className="border p-2 rounded"
          />
          <select
            name="category"
            defaultValue={searchParams?.category || ''}
            className="border p-2 rounded"
          >
            <option value="">-- Kategoria --</option>
            <option value="Transport">Transport</option>
            <option value="Ogród">Ogród</option>
            <option value="Budowa">Budowa</option>
            <option value="Magazyn">Magazyn</option>
            <option value="Inne">Inne</option>
          </select>
          <input
            type="date"
            name="date"
            defaultValue={searchParams?.date}
            className="border p-2 rounded"
          />
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">
            Filtruj
          </button>
        </form>

        {listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Brak dostępnych fuch</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <JobCard key={listing.id} job={listing} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
