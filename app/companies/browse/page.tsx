// app/companies/browse/page.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

const CATEGORIES = [
  { label: '🚚 Transport', value: 'Transport' },
  { label: '🌿 Ogród', value: 'Ogród' },
  { label: '🔨 Budowa', value: 'Budowa' },
  { label: '📦 Magazyn', value: 'Magazyn' },
  { label: '➕ Inne', value: 'Inne' },
];

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

const clearRevealedPhoneIds = () => {
  localStorage.removeItem(REVEALED_PHONES_STORAGE_KEY);
};

export default function CompanyBrowsePage() {
  const router = useRouter();
  const [allListings, setAllListings] = useState<any[]>([]);
  const [displayedListings, setDisplayedListings] = useState<any[]>([]);
  const [tier, setTier] = useState<'free' | 'pro' | null>(null);
  const [contactsRemaining, setContactsRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const [filters, setFilters] = useState({
    province: '',
    city: '',
    category: '',
    date: null as Date | null,
  });

  const [showProModal, setShowProModal] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

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
    setSelectedCategory(newCategory);
    
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
    return <div className="text-center py-12">Ładowanie pracowników...</div>;
  }

  return (
    <main className="py-12">
      <div className="container mx-auto">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Zobacz, kto jest gotowy do pracy</h1>
            <p className="text-gray-600">Przeglądasz ludzi do pracy z okolicy ({displayedListings.length} wyników)</p>
          </div>
          <div className="w-full max-w-xs space-y-3 sm:w-auto sm:min-w-[220px]">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
              <p className="text-sm text-gray-600">Plan:</p>
              <p className="text-lg font-bold text-primary whitespace-nowrap">
                {tier === 'pro' ? 'PRO – bez limitu' : `FREE – ${contactsRemaining} odkryć`}
              </p>
            </div>
            {tier === 'free' && (
              <button
                onClick={() => {
                  localStorage.setItem('companyContactsRemaining', '5');
                  clearRevealedPhoneIds();
                  setContactsRemaining(5);
                  setResetCounter(resetCounter + 1); // Force remount of all cards
                  alert('✅ Limit zresetowany do 5 odkryć (ADMIN)');
                }}
                className="w-full px-3 py-2 bg-yellow-500 text-white rounded text-xs font-bold hover:bg-yellow-600"
              >
                🔧 ADMIN: Reset
              </button>
            )}
            {tier === 'pro' && (
              <button
                onClick={() => {
                  localStorage.setItem('companyTier', 'free');
                  localStorage.setItem('companyContactsRemaining', '5');
                  localStorage.removeItem('companyPaymentData');
                  localStorage.removeItem('selectedTier');
                  clearRevealedPhoneIds();
                  setTier('free');
                  setContactsRemaining(5);
                  setResetCounter(resetCounter + 1);
                  setShowProModal(false);
                  alert('✅ ADMIN: PRO zresetowany do FREE (5 odkryć)');
                }}
                className="w-full px-3 py-2 bg-orange-500 text-white rounded text-xs font-bold hover:bg-orange-600"
              >
                🧪 ADMIN: Reset PRO → FREE
              </button>
            )}
          </div>
        </div>

        {tier === 'free' && (
          <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">Dla firm</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">Najpierw sprawdzasz ludzi. Potem płacisz za większy zasięg.</h2>
                <p className="mt-2 text-gray-700">
                  Na start masz 5 darmowych odkryć numerów. Jeśli chcesz działać bez limitu, podbijasz na PRO.
                </p>
              </div>
              <div>
                <button
                  onClick={goToProCheckout}
                  className="rounded-lg bg-green px-5 py-3 font-bold text-white transition hover:bg-green-600"
                >
                  Podbij na PRO
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="font-bold text-lg mb-4">Filtry</h2>
          
          <div className="flex gap-4 items-end flex-wrap">
            {/* Województwo Dropdown */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Województwo</label>
              <select
                value={filters.province}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 focus:outline-none focus:border-green-500"
              >
                <option value="">-- Wszystkie --</option>
                {Object.keys(PROVINCES).map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>

            {/* Miasto */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Miasto</label>
              <input
                type="text"
                list="city-datalist"
                placeholder="-- Wszystkie z regionu --"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:border-green-500"
              />
              <datalist id="city-datalist">
                {(PROVINCES[filters.province] || []).map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            {/* Datepicker */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Od daty</label>
              <ReactDatePicker
                selected={filters.date}
                onChange={(date: Date | null) => setFilters({ ...filters, date })}
                dateFormat="yyyy-MM-dd"
                minDate={new Date()}
                placeholderText="--"
                className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:border-green-500"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={handleFilter}
              className="whitespace-nowrap rounded-lg bg-green px-6 py-3 font-bold text-white shadow-sm shadow-green-200 transition hover:bg-green-600"
            >
              Filtruj
            </button>

            {/* Reset Button */}
            <button
              onClick={() => {
                setFilters({ province: '', city: '', category: '', date: null });
                setDisplayedListings(allListings);
                setCurrentPage(1);
              }}
              className="whitespace-nowrap rounded-lg bg-white px-6 py-3 font-bold text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-100"
            >
              Reset
            </button>
          </div>

          {/* Kategoria - Buttons below */}
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategoria</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryClick(cat.value)}
                  className={`rounded-lg px-4 py-2 font-medium transition ${
                    filters.category === cat.value
                      ? 'bg-green text-white shadow-sm shadow-green-200'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-green-500'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {displayedListings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Brak pracowników spełniających kryteria</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedListings.map(job => (
                <CompanyJobCard 
                  key={`${job.id}-${resetCounter}`}
                  job={job} 
                  tier={tier}
                  onShowProModal={() => setShowProModal(true)}
                  onRemainingChange={(remaining) => setContactsRemaining(remaining)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safeCurrentPage === 1}
                  className={`rounded-lg px-4 py-2 ${safeCurrentPage === 1 ? 'cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-white text-gray-700 shadow-sm hover:bg-gray-50'}`}
                >
                  Wstecz
                </button>
                <span className="text-sm text-gray-600">Strona {safeCurrentPage} z {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className={`rounded-lg px-4 py-2 ${safeCurrentPage === totalPages ? 'cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-white text-gray-700 shadow-sm hover:bg-gray-50'}`}
                >
                  Dalej
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* PRO Upsell Modal */}
      {showProModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md">
            <div className="text-center">
              <p className="text-6xl mb-4">🚀</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Limit wyczerpany!</h2>
              <p className="text-gray-600 mb-6">W FREE masz 5 odkryć numerów. Jeśli chcesz przeglądać ludzi bez limitu, podbij na PRO.</p>
              <div className="space-y-3">
                <button
                  onClick={goToProCheckout}
                  className="w-full px-6 py-3 bg-green text-white rounded-lg font-bold hover:bg-green-600 transition"
                >
                  💳 Podbij na PRO
                </button>
                <button
                  onClick={() => setShowProModal(false)}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

interface CompanyJobCardProps {
  job: any;
  tier: 'free' | 'pro' | null;
  onShowProModal?: () => void;
  onRemainingChange?: (remaining: number) => void;
}

function CompanyJobCard({ job, tier, onShowProModal, onRemainingChange }: CompanyJobCardProps) {
  const [phoneRevealed, setPhoneRevealed] = React.useState(() => getRevealedPhoneIds().includes(String(job.id)));
  const [contactsRemaining, setContactsRemaining] = React.useState(
    tier === 'free' ? parseInt(localStorage.getItem('companyContactsRemaining') || '5') : -1
  );
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
      setContactsRemaining(currentRemaining);
      
      if (currentRemaining <= 0) {
        // Show modal and don't reveal
        onRemainingChange?.(0);
        onShowProModal?.();
        return;
      }
      
      // Decrement and reveal
      const newRemaining = currentRemaining - 1;
      setContactsRemaining(newRemaining);
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

  const categoryIcons: Record<string, string> = {
    Transport: '🚚',
    Ogród: '🌿',
    Budowa: '🔨',
    Magazyn: '📦',
    Inne: '➕',
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
  const shouldShowDescriptionToggle = job.description && job.description.length > 120;

  return (
    <div className="relative flex h-full flex-col rounded-xl border-l-4 border-green bg-white p-6 shadow-sm transition hover:shadow-lg">
      {descriptionExpanded && (
        <div className="absolute inset-0 z-10 rounded-xl bg-white/96 p-6 backdrop-blur-[1px]">
          <div className="flex h-full flex-col rounded-lg border-2 border-[#22C55E] bg-white p-4 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#15803D]">Pełny opis</p>
                <h4 className="mt-1 text-base font-semibold text-gray-900">{job.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setDescriptionExpanded(false)}
                className="rounded-md bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
              >
                Zamknij
              </button>
            </div>
            <p className="mt-4 flex-1 overflow-y-auto text-sm leading-7 text-gray-700">
              {job.description}
            </p>
          </div>
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-2xl">{categoryIcons[job.category] || '❓'}</span>
          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
        </div>
        <p className="text-sm text-gray-500 mb-2">
          📍 {job.province}, {job.city}
        </p>
        <p className="text-sm text-gray-500 mb-3">
          📅 {availabilityLabel}{job.rate_type !== 'daily' && job.available_hours ? ` • ⏰ ${job.available_hours}h` : ''}
        </p>
        <div className="mb-3">
          <p
            className="line-clamp-3 text-sm text-gray-700"
            title={job.description}
          >
            {job.description}
          </p>
          {shouldShowDescriptionToggle && (
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setDescriptionExpanded(true)}
                className="text-sm font-semibold text-green-700 transition hover:text-green-800"
              >
                Rozwiń opis
              </button>
            </div>
          )}
        </div>
        <p className="text-lg font-bold text-green-700">{rateLabel}</p>
      </div>
      <div className="mt-4 min-h-[84px]">
        {phoneRevealed ? (
          <div className="flex h-14 w-full items-center justify-between gap-3 rounded-lg border-[3px] border-[#22C55E] bg-white px-4 py-3 shadow-sm ring-2 ring-[#22C55E]/20">
            <span className="flex items-center gap-2 text-sm font-semibold text-[#15803D]">
              <span aria-hidden="true">📞</span>
              Numer telefonu
            </span>
            <span className="rounded-md border-2 border-[#22C55E] bg-[#DCFCE7] px-3 py-1 text-lg font-bold tracking-[0.18em] text-[#166534] shadow-sm">
              {revealedPhone}
            </span>
          </div>
        ) : (
          <button
            onClick={handleRevealPhone}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-[#22C55E] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#16A34A]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-base text-white" aria-hidden="true">
              🔓
            </span>
            <span className="text-white">Odkryj telefon</span>
          </button>
        )}
        <div className="mt-2 h-5 text-center text-xs font-semibold text-green-700">
          {tier === 'free' && contactsRemaining > 0 ? `🔓 Zostało: ${contactsRemaining}/5 odkryć numeru` : ' '}
        </div>
      </div>
    </div>
  );
}
