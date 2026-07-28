"use client";

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactDatePicker from 'react-datepicker';
import Icon from './Icon';

interface JobsFiltersProps {
  initialProvince?: string;
  initialCity?: string;
  initialCategory?: string;
  initialDate?: string;
}

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

const CATEGORIES = ['Transport', 'Ogród', 'Budowa', 'Magazyn', 'Inne'];

const parseDate = (value?: string) => {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const formatDate = (date: Date | null) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function JobsFilters({
  initialProvince = '',
  initialCity = '',
  initialCategory = '',
  initialDate = '',
}: JobsFiltersProps) {
  const router = useRouter();
  const [province, setProvince] = useState(initialProvince);
  const [city, setCity] = useState(initialCity);
  const [category, setCategory] = useState(initialCategory);
  const [selectedDate, setSelectedDate] = useState<Date | null>(parseDate(initialDate));

  const cityOptions = useMemo(() => PROVINCES[province] || [], [province]);

  const submitFilters = () => {
    const params = new URLSearchParams();
    if (province) params.set('province', province);
    if (city) params.set('city', city);
    if (category) params.set('category', category);
    if (selectedDate) params.set('date', formatDate(selectedDate));

    const query = params.toString();
    router.push(query ? `/jobs?${query}` : '/jobs');
  };

  const resetFilters = () => {
    setProvince('');
    setCity('');
    setCategory('');
    setSelectedDate(null);
    router.push('/jobs');
  };

  return (
    <section className="surface mb-8 overflow-hidden" aria-labelledby="jobs-filters-title">
      <div className="border-b border-neutral-200 bg-neutral-50/80 px-5 py-5 sm:px-7">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary">
            <Icon name="filter" size={19} />
          </span>
          <div>
            <h2 id="jobs-filters-title" className="text-lg font-bold sm:text-xl">
              Dopasuj wyniki
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Wybierz lokalizację, kategorię lub termin, żeby szybciej znaleźć podobną fuchę.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="field-label" htmlFor="jobs-province">Województwo</label>
            <select
              id="jobs-province"
              value={province}
              onChange={(e) => {
                const nextProvince = e.target.value;
                setProvince(nextProvince);
                if (!nextProvince) {
                  setCity('');
                  return;
                }
                const nextCities = PROVINCES[nextProvince] || [];
                if (city && nextCities.includes(city)) return;
                setCity(nextCities[0] || '');
              }}
              className="min-h-12 w-full"
            >
              <option value="">-- Wszystkie --</option>
              {Object.keys(PROVINCES).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="jobs-city">Miasto</label>
            <input
              id="jobs-city"
              list="jobs-city-list"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Wpisz lub wybierz"
              className="min-h-12 w-full"
            />
            <datalist id="jobs-city-list">
              {cityOptions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="field-label" htmlFor="jobs-category">Kategoria</label>
            <select
              id="jobs-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="min-h-12 w-full"
            >
              <option value="">-- Wszystkie --</option>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="jobs-date">Od daty</label>
            <ReactDatePicker
              id="jobs-date"
              selected={selectedDate}
              onChange={(nextDate: Date | null) => setSelectedDate(nextDate)}
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
              isClearable
              placeholderText="Wybierz datę"
              wrapperClassName="w-full"
              className="min-h-12 w-full"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={resetFilters}
            className="btn-secondary w-full sm:w-auto"
          >
            Wyczyść filtry
          </button>
          <button
            type="button"
            onClick={submitFilters}
            className="btn-primary w-full sm:min-w-36 sm:w-auto"
          >
            Pokaż wyniki
          </button>
        </div>
      </div>
    </section>
  );
}
