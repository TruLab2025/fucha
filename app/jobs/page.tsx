// app/jobs/page.tsx
import React from 'react';
import Link from 'next/link';
import { getListings } from '../../lib/db';
import JobCard from '../../components/JobCard';
import JobsFilters from '../../components/JobsFilters';

interface JobsPageProps {
  searchParams?: {
    province?: string;
    city?: string;
    category?: string;
    date?: string;
    page?: string;
  };
}

export const dynamic = 'force-dynamic';

const pageSize = 18;

const buildPageHref = (searchParams: JobsPageProps['searchParams'], page: number) => {
  const params = new URLSearchParams();
  if (searchParams?.province) params.set('province', searchParams.province);
  if (searchParams?.city) params.set('city', searchParams.city);
  if (searchParams?.category) params.set('category', searchParams.category);
  if (searchParams?.date) params.set('date', searchParams.date);
  if (page > 1) params.set('page', String(page));

  const query = params.toString();
  return query ? `/jobs?${query}` : '/jobs';
};

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const filters = {
    type: 'worker' as const,
    province: searchParams?.province,
    city: searchParams?.city,
    category: searchParams?.category,
    available_date: searchParams?.date,
  };
  const listings = await getListings(filters);
  const requestedPage = Number(searchParams?.page || '1');
  const totalPages = Math.max(1, Math.ceil(listings.length / pageSize));
  const currentPage = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, totalPages) : 1;
  const paginatedListings = listings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <section className="py-12">
      <div className="container mx-auto">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Dla osób szukających pracy</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Podejrzyj inne fuchy i skopiuj podobną dla siebie</h1>
          <p className="mt-4 text-gray-600 leading-7">
            Ta lista pomaga Ci zobaczyć, jak ogłaszają się inni, jakie stawki podają i jak opisują swoją dostępność. Przeglądasz {listings.length} wyników i możesz jednym kliknięciem przenieść dane do własnego formularza.
          </p>
        </div>

        <JobsFilters
          initialProvince={searchParams?.province}
          initialCity={searchParams?.city}
          initialCategory={searchParams?.category}
          initialDate={searchParams?.date}
        />

        <div className="mb-8 rounded-2xl bg-blue-50 px-6 py-5 text-center text-sm text-blue-900">
          <p>
            💡 <strong>Jak używać tej strony:</strong> znajdź ogłoszenie podobne do swojego, podejrzyj stawkę i kliknij <strong>Duplikuj fuchę</strong>, żeby nie wpisywać wszystkiego od zera.
          </p>
        </div>

        {paginatedListings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Brak dostępnych fuch</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedListings.map(listing => (
                <JobCard key={listing.id} job={listing} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={buildPageHref(searchParams, Math.max(1, currentPage - 1))}
                  className={`rounded-lg px-4 py-2 ${currentPage === 1 ? 'pointer-events-none bg-gray-100 text-gray-400' : 'bg-white text-gray-700 shadow-sm hover:bg-gray-50'}`}
                >
                  Wstecz
                </Link>
                <span className="text-sm text-gray-600">Strona {currentPage} z {totalPages}</span>
                <Link
                  href={buildPageHref(searchParams, Math.min(totalPages, currentPage + 1))}
                  className={`rounded-lg px-4 py-2 ${currentPage === totalPages ? 'pointer-events-none bg-gray-100 text-gray-400' : 'bg-white text-gray-700 shadow-sm hover:bg-gray-50'}`}
                >
                  Dalej
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
