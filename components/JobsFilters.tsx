"use client";

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
    <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Województwo</label>
          <select
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
            className="w-full rounded border p-2"
          >
            <option value="">-- Wszystkie --</option>
            {Object.keys(PROVINCES).map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Miasto</label>
          <input
            list="jobs-city-list"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Wpisz lub wybierz"
            className="w-full rounded border p-2"
          />
          <datalist id="jobs-city-list">
            {cityOptions.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Kategoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded border p-2"
          >
            <option value="">-- Wszystkie --</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Od daty</label>
          <ReactDatePicker
            selected={selectedDate}
            onChange={(nextDate: Date | null) => setSelectedDate(nextDate)}
            dateFormat="yyyy-MM-dd"
            minDate={new Date()}
            isClearable
            placeholderText="Wybierz datę"
            className="w-full rounded border p-2"
          />
        </div>

        <div className="flex items-end gap-3">
          <button
            type="button"
            onClick={submitFilters}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-white hover:bg-blue-700"
          >
            Filtruj
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}