// app/jobs/page.tsx
import React from 'react';
import Link from 'next/link';
import { getListings } from '../../lib/db';
import JobCard from '../../components/JobCard';
import JobsFilters from '../../components/JobsFilters';
import Icon from '../../components/Icon';

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
    <>
      <section className="noise-wash border-b border-neutral-200 py-14 sm:py-20">
        <div className="container mx-auto">
          <div className="max-w-3xl">
            <span className="eyebrow"><Icon name="copy" size={15} /> Baza inspiracji</span>
            <h1 className="mt-5 text-4xl font-black leading-[1.03] sm:text-5xl lg:text-6xl">
              Nie zaczynaj od pustego formularza.
            </h1>
            <p className="section-copy mt-5 max-w-2xl">
              Zobacz, jak inni opisują swoją dostępność i stawki. Znajdź podobny przykład, a potem użyj go jako wzoru dla własnego ogłoszenia.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-ink shadow-sm ring-1 ring-neutral-200">
                <span className="text-xl font-black text-primary">{listings.length}</span> dostępnych przykładów
              </span>
              <Link href="/add" className="btn-primary min-h-11 py-2.5">
                Dodaj własną fuchę
                <Icon name="arrow-right" size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-10 sm:py-14">
        <JobsFilters
          initialProvince={searchParams?.province}
          initialCity={searchParams?.city}
          initialCategory={searchParams?.category}
          initialDate={searchParams?.date}
        />

        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-primary-100 bg-primary-50 px-5 py-4 text-sm leading-6 text-primary-900">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
            <Icon name="sparkles" size={18} />
          </span>
          <p className="pt-1.5">
            <strong>Jak to działa:</strong> wybierz podobne ogłoszenie i kliknij „Użyj jako wzoru”. Treść, lokalizacja i termin przeniosą się do formularza, a Ty tylko poprawisz szczegóły.
          </p>
        </div>

        {paginatedListings.length === 0 ? (
          <div className="surface px-6 py-16 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
              <Icon name="search" size={24} />
            </span>
            <h2 className="mt-5 text-xl font-bold">Brak pasujących przykładów</h2>
            <p className="mt-2 text-sm text-muted">Wyczyść część filtrów i spróbuj ponownie.</p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">Przykładowe ogłoszenia</h2>
              <span className="text-sm font-semibold text-muted">Strona {currentPage} z {totalPages}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedListings.map(listing => (
                <JobCard key={listing.id} job={listing} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={buildPageHref(searchParams, Math.max(1, currentPage - 1))}
                  aria-disabled={currentPage === 1}
                  className={`btn-secondary ${currentPage === 1 ? 'pointer-events-none opacity-45' : ''}`}
                >
                  Wstecz
                </Link>
                <Link
                  href={buildPageHref(searchParams, Math.min(totalPages, currentPage + 1))}
                  aria-disabled={currentPage === totalPages}
                  className={`btn-secondary ${currentPage === totalPages ? 'pointer-events-none opacity-45' : ''}`}
                >
                  Dalej
                  <Icon name="arrow-right" size={17} />
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
