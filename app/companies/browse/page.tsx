// app/companies/browse/page.tsx
"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactDatePicker from 'react-datepicker';
import Icon, { type IconName } from '../../../components/Icon';

const PROVINCES: Record<string, string[]> = {
  'Dolnośląskie': ['Wrocław','Legnica','Głogów'],
  'Kujawsko-Pomorskie': ['Bydgoszcz','Toruń','Włocławek'],
  'Lubelskie': ['Lublin','Zamość','Chełm'],
  'Lubuskie': ['Gorzów Wielkopolski','Zielona Góra'],
  'Łódzkie': ['Łódź','Piotrków Trybunalski','Pabianice'],
  'Małopolskie': ['Kraków','Tarnów','Nowy Sącz'],
  'Mazowieckie': ['Warszawa','Radom','Płock'],
  'Opolskie': ['Opole','Kędzierzyn-Koźle'],
  'Podkarpackie': ['Rzeszów','Przemyśl','Krosno'],
  'Podlaskie': ['Białystok','Suwałki','Łomża'],
  'Pomorskie': ['Gdańsk','Sopot','Gdynia'],
  'Śląskie': ['Katowice','Gliwice','Częstochowa'],
  'Świętokrzyskie': ['Kielce','Sandomierz'],
  'Warmińsko-Mazurskie': ['Olsztyn','Elbląg'],
  'Wielkopolskie': ['Poznań','Kalisz','Konin'],
  'Zachodniopomorskie': ['Szczecin','Koszalin'],
};

const CATEGORIES: Array<{ label: string; value: string; icon: IconName }> = [
  { label: 'Transport', value: 'Transport', icon: 'transport' },
  { label: 'Ogród', value: 'Ogród', icon: 'leaf' },
  { label: 'Budowa', value: 'Budowa', icon: 'hammer' },
  { label: 'Magazyn', value: 'Magazyn', icon: 'package' },
  { label: 'Inne', value: 'Inne', icon: 'plus' },
];

const CATEGORY_ICONS: Record<string, IconName> = {
  Transport: 'transport',
  Ogród: 'leaf',
  Budowa: 'hammer',
  Magazyn: 'package',
  Inne: 'plus',
};

const PAGE_SIZE = 18;
const REVEALED_PHONES_STORAGE_KEY = 'companyRevealedPhoneIds';

const getRevealedPhoneIds = () => {
  try {
    const rawValue = localStorage.getItem(REVEALED_PHONES_STORAGE_KEY);
    if (!rawValue) {
      return [] as string[];
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [] as string[];
  }
};

const persistRevealedPhoneId = (jobId: string) => {
  const revealedIds = getRevealedPhoneIds();
  if (revealedIds.includes(jobId)) {
    return;
  }

  localStorage.setItem(REVEALED_PHONES_STORAGE_KEY, JSON.stringify([...revealedIds, jobId]));
};

export default function CompanyBrowsePage() {
  const router = useRouter();
  const [allListings, setAllListings] = useState<any[]>([]);
  const [displayedListings, setDisplayedListings] = useState<any[]>([]);
  const [tier, setTier] = useState<'free' | 'pro' | null>(null);
  const [contactsRemaining, setContactsRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    province: '',
    city: '',
    category: '',
    date: null as Date | null,
  });

  const [showProModal, setShowProModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const proModalRef = useRef<HTMLDivElement>(null);

  const goToProCheckout = () => {
    localStorage.setItem('selectedTier', 'pro');
    router.push('/companies/payment');
  };

  useEffect(() => {
    // Check company tier
    const companyTier = localStorage.getItem('companyTier') as 'free' | 'pro' | null;
    
    // Jeśli brak tier - ustaw FREE automatycznie (dla testowania)
    if (!companyTier) {
      localStorage.setItem('companyTier', 'free');
      localStorage.setItem('companyContactsRemaining', '5');
      localStorage.setItem('companyStartDate', new Date().toISOString());
      setTier('free');
    } else {
      setTier(companyTier);
    }
    
    const remaining = localStorage.getItem('companyContactsRemaining');
    setContactsRemaining(parseInt(remaining || '5'));
    
    // Load listings
    loadAllListings();
  }, [router]);

  useEffect(() => {
    if (!showProModal) return;

    const previousOverflow = document.body.style.overflow;
    const previousActiveElement = document.activeElement as HTMLElement | null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowProModal(false);
        return;
      }

      if (event.key === 'Tab' && proModalRef.current) {
        const focusableElements = proModalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (!firstElement || !lastElement) return;

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [showProModal]);

  const loadAllListings = async () => {
    try {
      const response = await fetch('/api/jobs/list?type=worker');
      if (response.ok) {
        const data = await response.json();
        setAllListings(data);
        setDisplayedListings(data); // Pokaż wszystkie na starcie
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceChange = (province: string) => {
    const cities = PROVINCES[province] || [];
    const firstCity = cities.length ? cities[0] : '';
    setFilters({ ...filters, province, city: firstCity });
  };

  const handleCategoryClick = (categoryValue: string) => {
    const newCategory = filters.category === categoryValue ? '' : categoryValue;
    const newFilters = { ...filters, category: newCategory };
    setFilters(newFilters);
    
    // Apply filter immediately
    setTimeout(() => {
      let filtered = [...allListings];
      if (newFilters.province) {
        filtered = filtered.filter(l => l.province === newFilters.province);
      }
      if (newFilters.city) {
        filtered = filtered.filter(l => l.city?.toLowerCase().includes(newFilters.city.toLowerCase()));
      }
      if (newCategory) {
        filtered = filtered.filter(l => l.category === newCategory);
      }
      if (newFilters.date) {
        const filterDate = newFilters.date.toISOString().split('T')[0];
        filtered = filtered.filter(l => {
          const listingEnd = l.available_to || l.available_date;
          return listingEnd >= filterDate;
        });
      }
      setDisplayedListings(filtered);
      setCurrentPage(1);
    }, 0);
  };

  const handleFilter = () => {
    let filtered = [...allListings];

    if (filters.province) {
      filtered = filtered.filter(l => l.province === filters.province);
    }
    
    if (filters.city) {
      filtered = filtered.filter(l => l.city?.toLowerCase().includes(filters.city.toLowerCase()));
    }
    
    if (filters.category) {
      filtered = filtered.filter(l => l.category === filters.category);
    }
    
    if (filters.date) {
      const filterDate = filters.date.toISOString().split('T')[0];
      filtered = filtered.filter(l => {
        const listingEnd = l.available_to || l.available_date;
        return listingEnd >= filterDate;
      });
    }

    setDisplayedListings(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(displayedListings.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedListings = displayedListings.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);

  if (loading) {
    return (
      <section className="py-10 sm:py-14" aria-live="polite" aria-busy="true">
        <div className="container mx-auto">
          <div className="surface flex min-h-56 flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-primary-50 text-primary">
              <Icon name="users" size={26} />
            </span>
            <div>
              <p className="font-display text-lg font-bold text-ink">Szukamy dostępnych osób</p>
              <p className="mt-1 text-sm text-muted">To zajmie tylko chwilę.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-8 sm:py-12 lg:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-gradient-to-b from-primary-50/70 via-green-50/30 to-transparent" />
      <div className="container mx-auto">
        <header className="surface relative overflow-hidden p-5 sm:p-7 lg:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-lime/20 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
            <div className="min-w-0">
              <p className="section-kicker inline-flex items-center gap-2">
                <Icon name="users" size={16} />
                Baza dostępnych osób
              </p>
              <h1 className="mt-3 max-w-3xl text-3xl font-black leading-[1.08] sm:text-4xl lg:text-5xl">
                Znajdź osobę gotową do pracy
              </h1>
              <p className="section-copy mt-3 max-w-2xl">
                Przeglądaj lokalne profile, zawęż wyniki i skontaktuj się bez zbędnych formalności.
              </p>
              <div className="mt-5 inline-flex min-h-9 items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm font-semibold text-neutral-700">
                <span className="h-2 w-2 rounded-full bg-green" aria-hidden="true" />
                {displayedListings.length} {displayedListings.length === 1 ? 'wynik' : 'wyników'}
              </div>
            </div>

            <aside
              aria-label="Twój plan"
              className={`w-full rounded-2xl border p-4 sm:p-5 ${
                tier === 'pro'
                  ? 'border-green-200 bg-green-50'
                  : 'border-primary-200 bg-primary-50'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    tier === 'pro' ? 'bg-green text-white' : 'bg-primary text-white'
                  }`}
                >
                  <Icon name={tier === 'pro' ? 'zap' : 'wallet'} size={20} />
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black tracking-[0.12em] ${
                    tier === 'pro' ? 'bg-green-100 text-green-800' : 'bg-white text-primary-700'
                  }`}
                >
                  {tier === 'pro' ? 'PRO' : 'FREE'}
                </span>
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.15em] text-neutral-500">Twój plan</p>
              <p className="mt-1 text-xl font-black text-ink">
                {tier === 'pro' ? 'Kontakty bez limitu' : `${contactsRemaining} z 5 kontaktów`}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                {tier === 'pro' ? 'Odkrywaj numery bez ograniczeń.' : 'Każdy nowy numer wykorzystuje jedno odkrycie.'}
              </p>
            </aside>
          </div>

          {tier === 'free' && (
            <div className="relative mt-6 overflow-hidden rounded-2xl bg-ink p-5 sm:p-6">
              <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-lime/25 blur-2xl" />
              <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime text-ink">
                    <Icon name="sparkles" size={21} />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-lime">Więcej kontaktów</p>
                    <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">Przejdź na PRO, gdy chcesz działać bez limitu.</h2>
                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-neutral-300">
                      FREE daje 5 darmowych odkryć. W PRO każdy dostępny profil jest od razu w Twoim zasięgu.
                    </p>
                  </div>
                </div>
                <button type="button" onClick={goToProCheckout} className="btn-primary w-full shrink-0 lg:w-auto">
                  Zobacz plan PRO
                  <Icon name="arrow-right" size={18} />
                </button>
              </div>
            </div>
          )}
        </header>

        <section className="surface mt-6 p-5 sm:p-7" aria-labelledby="filters-heading">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary">
              <Icon name="filter" size={19} />
            </span>
            <div>
              <p className="section-kicker">Dopasuj wyniki</p>
              <h2 id="filters-heading" className="mt-1 text-xl font-bold sm:text-2xl">Kogo potrzebujesz?</h2>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto] xl:items-end">
            <div className="min-w-0">
              <label htmlFor="province-filter" className="field-label">Województwo</label>
              <select
                id="province-filter"
                value={filters.province}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className="w-full"
              >
                <option value="">Wszystkie województwa</option>
                {Object.keys(PROVINCES).map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label htmlFor="city-filter" className="field-label">Miasto</label>
              <input
                id="city-filter"
                type="text"
                list="city-datalist"
                placeholder="Wszystkie z regionu"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="w-full"
              />
              <datalist id="city-datalist">
                {(PROVINCES[filters.province] || []).map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div className="min-w-0">
              <label htmlFor="date-filter" className="field-label">Dostępny od</label>
              <ReactDatePicker
                id="date-filter"
                selected={filters.date}
                onChange={(date: Date | null) => setFilters({ ...filters, date })}
                dateFormat="yyyy-MM-dd"
                minDate={new Date()}
                placeholderText="Wybierz datę"
                wrapperClassName="w-full"
                className="w-full"
              />
            </div>

            <div className="flex min-w-0 flex-col gap-2 sm:col-span-2 sm:flex-row xl:col-span-1">
              <button type="button" onClick={handleFilter} className="btn-primary w-full whitespace-nowrap sm:w-auto">
                <Icon name="search" size={18} />
                Filtruj
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilters({ province: '', city: '', category: '', date: null });
                  setDisplayedListings(allListings);
                  setCurrentPage(1);
                }}
                className="btn-secondary w-full whitespace-nowrap sm:w-auto"
              >
                Resetuj
              </button>
            </div>
          </div>

          <fieldset className="mt-6 border-t border-neutral-100 pt-5">
            <legend className="field-label mb-0 px-1">Kategoria</legend>
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Kategorie pracowników">
              {CATEGORIES.map(cat => {
                const isActive = filters.category === cat.value;

                return (
                  <button
                    type="button"
                    key={cat.value}
                    onClick={() => handleCategoryClick(cat.value)}
                    aria-pressed={isActive}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition ${
                      isActive
                        ? 'border-primary bg-primary text-white shadow-lg shadow-primary-200/50'
                        : 'border-neutral-200 bg-white text-neutral-700 shadow-sm hover:-translate-y-0.5 hover:border-primary-300 hover:text-primary'
                    }`}
                  >
                    <Icon name={cat.icon} size={17} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </section>

        <section className="mt-10" aria-labelledby="results-heading" id="browse-results">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-kicker">Dostępni kandydaci</p>
              <h2 id="results-heading" className="mt-1 text-2xl font-black sm:text-3xl">Profile gotowe do kontaktu</h2>
            </div>
            <p className="text-sm font-semibold text-muted">
              {displayedListings.length} {displayedListings.length === 1 ? 'osoba' : 'osób'}
            </p>
          </div>

        {displayedListings.length === 0 ? (
          <div className="surface flex min-h-64 flex-col items-center justify-center p-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
              <Icon name="search" size={25} />
            </span>
            <h3 className="mt-4 text-xl font-bold">Brak pasujących profili</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">Zmień lokalizację, datę lub kategorię i spróbuj ponownie.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {paginatedListings.map(job => (
                <CompanyJobCard 
                  key={job.id}
                  job={job} 
                  tier={tier}
                  contactsRemaining={contactsRemaining}
                  onShowProModal={() => setShowProModal(true)}
                  onRemainingChange={(remaining) => setContactsRemaining(remaining)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="mt-10 flex flex-wrap items-center justify-center gap-3" aria-label="Paginacja wyników">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safeCurrentPage === 1}
                  className="btn-secondary min-h-11 px-4 disabled:pointer-events-none disabled:opacity-45"
                >
                  <Icon name="arrow-right" size={17} className="rotate-180" />
                  Wstecz
                </button>
                <span className="min-w-28 text-center text-sm font-semibold text-muted">Strona {safeCurrentPage} z {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="btn-secondary min-h-11 px-4 disabled:pointer-events-none disabled:opacity-45"
                >
                  Dalej
                  <Icon name="arrow-right" size={17} />
                </button>
              </nav>
            )}
          </>
        )}
        </section>
      </div>

      {showProModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowProModal(false);
          }}
        >
          <div
            ref={proModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pro-modal-title"
            aria-describedby="pro-modal-description"
            className="surface relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto p-5 shadow-float sm:p-8"
          >
            <button
              type="button"
              onClick={() => setShowProModal(false)}
              autoFocus
              aria-label="Zamknij okno planu PRO"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-ink"
            >
              <Icon name="x" size={20} />
            </button>
            <div className="pr-12">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary">
                <Icon name="zap" size={26} />
              </span>
              <p className="section-kicker mt-5">Plan PRO</p>
              <h2 id="pro-modal-title" className="mt-1 text-2xl font-black sm:text-3xl">Darmowy limit został wykorzystany</h2>
            </div>
            <p id="pro-modal-description" className="mt-4 text-sm leading-7 text-muted sm:text-base">
              W planie FREE możesz odkryć 5 numerów. Przejdź na PRO, aby kontaktować się z dostępnymi osobami bez limitu.
            </p>
            <div className="mt-6 rounded-2xl border border-green-100 bg-green-50 p-4">
              <div className="flex items-center gap-3 text-sm font-bold text-green-800">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green text-white">
                  <Icon name="check" size={17} />
                </span>
                Nielimitowane odkrywanie kontaktów
              </div>
            </div>
            <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  onClick={goToProCheckout}
                  className="btn-primary w-full"
                >
                  Przejdź na PRO
                  <Icon name="arrow-right" size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowProModal(false)}
                  className="btn-secondary w-full"
                >
                  Zostań przy FREE
                </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

interface CompanyJobCardProps {
  job: any;
  tier: 'free' | 'pro' | null;
  contactsRemaining: number;
  onShowProModal?: () => void;
  onRemainingChange?: (remaining: number) => void;
}

function CompanyJobCard({ job, tier, contactsRemaining, onShowProModal, onRemainingChange }: CompanyJobCardProps) {
  const [phoneRevealed, setPhoneRevealed] = React.useState(() => getRevealedPhoneIds().includes(String(job.id)));
  const [descriptionExpanded, setDescriptionExpanded] = React.useState(false);

  React.useEffect(() => {
    setPhoneRevealed(getRevealedPhoneIds().includes(String(job.id)));
  }, [job.id]);

  // Generate fake phone for demo
  const getFakePhone = (jobId: string) => {
    const seed = parseInt(jobId) || 0;
    const prefix = String(500 + (seed % 100)).padStart(3, '0');
    const suffix = String((seed * 7919 + 123) % 1000000).padStart(6, '0');
    return `${prefix}${suffix}`;
  };

  const handleRevealPhone = () => {
    // Already revealed on this card - do not consume limit again
    if (phoneRevealed) {
      return;
    }

    if (tier === 'free') {
      if (getRevealedPhoneIds().includes(String(job.id))) {
        setPhoneRevealed(true);
        return;
      }

      // Read fresh value from localStorage to ensure accuracy
      const currentRemaining = parseInt(localStorage.getItem('companyContactsRemaining') || '5');
      if (currentRemaining <= 0) {
        // Show modal and don't reveal
        onRemainingChange?.(0);
        onShowProModal?.();
        return;
      }
      
      // Decrement and reveal
      const newRemaining = currentRemaining - 1;
      localStorage.setItem('companyContactsRemaining', newRemaining.toString());
      persistRevealedPhoneId(String(job.id));
      onRemainingChange?.(newRemaining);
      setPhoneRevealed(true);
    } else if (tier === 'pro') {
      // PRO tier - always reveal
      persistRevealedPhoneId(String(job.id));
      setPhoneRevealed(true);
    }
  };

  const availabilityLabel = (() => {
    const start = new Date(job.available_date).toLocaleDateString('pl-PL');
    if (job.available_to && job.available_to !== job.available_date) {
      return `${start} - ${new Date(job.available_to).toLocaleDateString('pl-PL')}`;
    }
    return start;
  })();

  const rateLabel = job.rate_type === 'daily' ? `${job.rate} zł/dzień` : `${job.rate} zł/h`;
  const revealedPhone = getFakePhone(job.id);
  const formattedPhone = revealedPhone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  const shouldShowDescriptionToggle = job.description && job.description.length > 120;
  const categoryIcon = CATEGORY_ICONS[job.category] || 'briefcase';

  return (
    <article className="surface group relative flex h-full min-w-0 flex-col overflow-hidden transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-float">
      <div className="flex-1 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary transition group-hover:bg-primary group-hover:text-white">
            <Icon name={categoryIcon} size={22} />
          </span>
          <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green" aria-hidden="true" />
            Dostępny
          </span>
        </div>

        <p className="mt-5 text-xs font-black uppercase tracking-[0.15em] text-primary">{job.category || 'Inna kategoria'}</p>
        <h3 className="mt-1.5 break-words text-xl font-black leading-snug text-ink sm:text-2xl">{job.title}</h3>

        <div className="mt-4 grid gap-2.5 text-sm font-medium text-neutral-600">
          <div className="flex min-w-0 items-start gap-2">
            <Icon name="map-pin" size={17} className="mt-0.5 shrink-0 text-neutral-400" />
            <span className="min-w-0 break-words">{job.province}, {job.city}</span>
          </div>
          <div className="flex min-w-0 items-start gap-2">
            <Icon name="calendar" size={17} className="mt-0.5 shrink-0 text-neutral-400" />
            <span className="min-w-0 break-words">{availabilityLabel}</span>
          </div>
          {job.rate_type !== 'daily' && job.available_hours && (
            <div className="flex items-center gap-2">
              <Icon name="clock" size={17} className="shrink-0 text-neutral-400" />
              <span>{job.available_hours} h dostępności</span>
            </div>
          )}
        </div>

        {job.description && (
          <div className="mt-5 border-t border-neutral-100 pt-4">
          <p className={`${descriptionExpanded ? '' : 'line-clamp-3'} break-words text-sm leading-6 text-muted`}>
            {job.description}
          </p>
          {shouldShowDescriptionToggle && (
              <button
              type="button"
              onClick={() => setDescriptionExpanded((expanded) => !expanded)}
                aria-expanded={descriptionExpanded}
                className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-700"
              >
              {descriptionExpanded ? 'Zwiń opis' : 'Czytaj cały opis'}
                <Icon name="arrow-right" size={16} className={descriptionExpanded ? '-rotate-90' : 'rotate-90'} />
            </button>
          )}
        </div>
        )}

        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">Oczekiwana stawka</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-ink">{rateLabel}</p>
        </div>
      </div>

      <div className="border-t border-neutral-100 bg-neutral-50/75 p-4 sm:p-5">
        {phoneRevealed ? (
          <div className="w-full min-w-0 rounded-2xl border border-green-200 bg-white p-3.5 shadow-sm ring-4 ring-green-50">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-green-700">
              <Icon name="phone" size={16} />
              Numer telefonu
            </span>
            <span className="mt-2 block max-w-full break-words font-mono text-xl font-black tracking-[0.08em] text-ink sm:text-2xl">
              {formattedPhone}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleRevealPhone}
            className="btn-green w-full"
          >
            <Icon name="phone" size={18} />
            Odkryj numer telefonu
          </button>
        )}
        <p className="mt-3 flex min-h-5 items-center justify-center gap-1.5 text-center text-xs font-semibold text-neutral-500">
          {tier === 'free' ? (
            <>
              <Icon name="lock" size={14} className="shrink-0" />
              {contactsRemaining > 0 ? `Pozostało ${contactsRemaining} z 5 odkryć` : 'Limit darmowych odkryć wykorzystany'}
            </>
          ) : (
            <>
              <Icon name="zap" size={14} className="shrink-0 text-green-600" />
              Kontakty bez limitu w planie PRO
            </>
          )}
        </p>
      </div>
    </article>
  );
}
