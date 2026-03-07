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
        filtered = filtered.filter(l => l.available_date >= filterDate);
      }
      setDisplayedListings(filtered);
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
      filtered = filtered.filter(l => l.available_date >= filterDate);
    }

    setDisplayedListings(filtered);
  };

  if (loading) {
    return <div className="text-center py-12">Ładowanie pracowników...</div>;
  }

  return (
    <main className="py-12">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Zobacz kto dziś szuka fuchy</h1>
            <p className="text-gray-600">Przejrzyj i skontaktuj się z pracownikami ({displayedListings.length} wyników)</p>
          </div>
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Plan:</p>
              <p className="text-lg font-bold text-primary">
                {tier === 'pro' ? 'PRO – bez limitu' : `FREE – ${contactsRemaining} kontaktów`}
              </p>
            </div>
            {tier === 'free' && (
              <button
                onClick={() => {
                  localStorage.setItem('companyContactsRemaining', '5');
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
                className="w-full border border-gray-300 p-2 rounded bg-white text-gray-900 focus:outline-none focus:border-primary"
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
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-primary"
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
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-primary"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={handleFilter}
              className="px-6 py-2 bg-primary text-white rounded hover:bg-blue-700 font-medium whitespace-nowrap"
            >
              Filtruj
            </button>

            {/* Reset Button */}
            <button
              onClick={() => {
                setFilters({ province: '', city: '', category: '', date: null });
                setDisplayedListings(allListings);
              }}
              className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 font-medium whitespace-nowrap"
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
                  className={`px-4 py-2 rounded font-medium transition ${
                    filters.category === cat.value
                      ? 'bg-primary text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-primary'
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedListings.map(job => (
              <CompanyJobCard 
                key={`${job.id}-${resetCounter}`}
                job={job} 
                tier={tier}
                onShowProModal={() => setShowProModal(true)}
                onRemainingChange={(remaining) => setContactsRemaining(remaining)}
              />
            ))}
          </div>
        )}
      </div>

      {/* PRO Upsell Modal */}
      {showProModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md">
            <div className="text-center">
              <p className="text-6xl mb-4">🚀</p>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Limit wyczerpany!</h2>
              <p className="text-gray-600 mb-6">Już odkryłeś 5 telefonów. Przejdź na plan PRO aby odkrywać nieograniczoną liczbę kontaktów.</p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    router.push('/companies/zakup');
                  }}
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 transition"
                >
                  💳 Przejdź do zakupu PRO
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
  const [phoneRevealed, setPhoneRevealed] = React.useState(false);
  const [contactsRemaining, setContactsRemaining] = React.useState(
    tier === 'free' ? parseInt(localStorage.getItem('companyContactsRemaining') || '5') : -1
  );

  // Generate fake phone for demo
  const getFakePhone = (jobId: string) => {
    const seed = parseInt(jobId) || 0;
    const num = (seed * 7919 + 123) % 900000000;
    return `${String(500 + Math.floor(seed % 100)).padStart(3, '0')}${String(num).padStart(6, '0')}`;
  };

  const handleRevealPhone = () => {
    // Already revealed on this card - do not consume limit again
    if (phoneRevealed) {
      return;
    }

    if (tier === 'free') {
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
      onRemainingChange?.(newRemaining);
      setPhoneRevealed(true);
    } else if (tier === 'pro') {
      // PRO tier - always reveal
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

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary hover:shadow-lg transition">
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-2xl">{categoryIcons[job.category] || '❓'}</span>
          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
        </div>
        <p className="text-sm text-gray-500 mb-2">
          📍 {job.province}, {job.city}
        </p>
        <p className="text-sm text-gray-500 mb-3">
          📅 {new Date(job.available_date).toLocaleDateString('pl-PL')} • ⏰ {job.available_hours}h
        </p>
        <p className="text-sm text-gray-700 line-clamp-2 mb-3">{job.description}</p>
        <p className="text-lg font-bold text-primary">{job.rate} zł/h</p>
      </div>
      <button
        onClick={handleRevealPhone}
        className="mt-4 w-full px-4 py-2 rounded font-medium transition bg-primary text-white hover:bg-blue-700"
      >
        {phoneRevealed ? `📱 ${getFakePhone(job.id)}` : '📞 Odkryj telefon'}
      </button>
      {tier === 'free' && contactsRemaining > 0 && (
        <p className="text-xs text-center mt-2 font-semibold text-blue-600">
          {`🔓 Zostało: ${contactsRemaining}/5 odkryć`}
        </p>
      )}
    </div>
  );
}
