// components/JobForm.tsx
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const jobSchema = z.object({
  title: z.string().min(1, { message: 'Nazwa jest wymagana' }),
  description: z.string().min(1, { message: 'Opis jest wymagany' }),
  province: z.string().min(1, { message: 'Województwo jest wymagane' }),
  city: z.string().min(1, { message: 'Miasto jest wymagane' }),
  category: z.enum(['Transport','Ogród','Budowa','Magazyn','Inne']),
  available_date: z.string().min(1, { message: 'Data jest wymagana' }),
  available_hours: z.string().min(1, { message: 'Liczba godzin jest wymagana' }),
  rate: z.string().min(1, { message: 'Stawka jest wymagana' }),
  phone: z.string()
    .min(1, { message: 'Telefon jest wymagany' })
    .refine((val) => {
      const digits = val.replace(/\D/g, '');
      return digits.length >= 9 && digits.length <= 15;
    }, { message: 'Telefon musi mieć 9-15 cyfr' }),
  email: z.string().email({ message: 'Nieprawidłowy email' }),
  terms: z.boolean().refine(v => v, { message: 'Musisz zaakceptować regulamin' }),
  rodo: z.boolean().optional(), // RODO - informacyjne, nie wymagane
  hp: z.string().max(0).optional(), // honeypot must be empty
});

type JobInput = z.infer<typeof jobSchema>;

const ratePresets = [50,75,100,125,150,175,200];
const hourPresets = [2,3,4,5,6,7,8,10,12];

const provinces: Record<string,string[]> = {
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

const categories: { value: 'Transport' | 'Ogród' | 'Budowa' | 'Magazyn' | 'Inne'; icon: string; }[] = [
  { value: 'Transport', icon: '🚚' },
  { value: 'Ogród', icon: '🌿' },
  { value: 'Budowa', icon: '🔨' },
  { value: 'Magazyn', icon: '📦' },
  { value: 'Inne', icon: '➕' },
];


import { useSearchParams } from 'next/navigation';

export default function JobForm() {
  const router = useRouter();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<JobInput>({
    resolver: zodResolver(jobSchema),
    defaultValues: searchParams ? (() => {
      const allowedCategories = ['Transport','Ogród','Budowa','Magazyn','Inne'];
      const catRaw = searchParams.get('category');
      const cat = (typeof catRaw === 'string' && allowedCategories.includes(catRaw)) ? catRaw : undefined;
      return {
        title: searchParams.get('title') || '',
        description: searchParams.get('description') || '',
        province: searchParams.get('province') || '',
        city: searchParams.get('city') || '',
        category: cat,
        available_date: searchParams.get('available_date') || new Date().toISOString().slice(0, 10),
        available_hours: searchParams.get('available_hours') || '',
        rate: searchParams.get('rate') || '',
        phone: '',
        email: '',
        terms: false,
        rodo: false,
        hp: ''
      };
    })() : undefined,
  });

  const onFormSubmit = async (data: JobInput) => {
    const res = await fetch('/api/jobs/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, type: 'worker' }),
    });
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/jobs');
      }, 2000);
    } else {
      const err = await res.json();
      alert(err.error || 'Coś poszło nie tak');
    }
  };

  return (
    <div className="max-w-md">
      {success ? (
        <div className="p-6 bg-green-100 text-green-800 rounded-lg text-center space-y-4">
          <p>Ogłoszenie opublikowane! Zaraz Cię przekierujemy.</p>
          <p>
            Możesz też <a href="/jobs" className="text-primary underline">zobaczyć listę fuch</a> wcześniej.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className="block">Nazwa fuchy</label>
            <input {...register('title')} className={`w-full border p-2 rounded ${errors.title ? 'border-red-500' : ''}`} />
            {errors.title && <p className="text-red-500">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block">Opis</label>
            <textarea {...register('description')} className={`w-full border p-2 rounded ${errors.description ? 'border-red-500' : ''}`} />
            {errors.description && <p className="text-red-500">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block">Województwo</label>
              <select
                {...register('province')}
                className={`w-full border p-2 rounded ${errors.province ? 'border-red-500' : ''}`}
                onChange={(e) => {
                  const prov = e.target.value;
                  const cities = provinces[prov] || [];
                  if (cities.length) {
                    setValue('city', cities[0]);
                  }
                }}
              >
                <option value="">-- wybierz --</option>
                {Object.keys(provinces).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {errors.province && <p className="text-red-500">{errors.province.message}</p>}
            </div>
            <div>
              <label className="block">Miasto</label>
              <input list="city-list" placeholder="Wybierz miasto" {...register('city')} className={`w-full border p-2 rounded ${errors.city ? 'border-red-500' : ''}`} />
              <datalist id="city-list">
                {(provinces[watch('province')] || []).map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {errors.city && <p className="text-red-500">{errors.city.message}</p>}
            </div>
          </div>
          <div>
            <label className="block">Kategoria</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.map(cat => (
                <button
                  type="button"
                  key={cat.value}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg border ${
                    watch('category') === cat.value ? 'bg-primary text-white' : 'bg-white'
                  }`}
                  onClick={() => setValue('category', cat.value)}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.value}</span>
                </button>
              ))}
            </div>
            {errors.category && <p className="text-red-500">{errors.category.message}</p>}
          </div>
          <div>
            <label className="block">Data dostępności</label>
            <Controller
              control={control}
              name="available_date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              render={({ field }) => (
                <ReactDatePicker
                  className={`w-full border p-2 rounded ${errors.available_date ? 'border-red-500' : ''}`}
                  selected={field.value ? new Date(field.value) : null}
                  onChange={(date: Date | null) => {
                    field.onChange(date ? date.toISOString().slice(0,10) : '');
                  }}
                  dateFormat="yyyy-MM-dd"
                  minDate={new Date()}
                />
              )}
            />
            {errors.available_date && <p className="text-red-500">{errors.available_date.message}</p>}
          </div>
          <div>
            <label className="block">Ile godzin mogę pracować?</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {hourPresets.map(h => (
                <button
                  type="button"
                  key={h}
                  className={`px-3 py-1 rounded-lg border ${
                    watch('available_hours') === String(h) ? 'bg-primary text-white' : 'bg-white'
                  }`}
                  onClick={() => setValue('available_hours', String(h))}
                >{h}h</button>
              ))}
            </div>
            {errors.available_hours && <p className="text-red-500">{errors.available_hours.message}</p>}
          </div>
          <div>
            <label className="block">Wynagrodzenie (zł/h)</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {ratePresets.map(r => (
                <button
                  type="button"
                  key={r}
                  className={`px-3 py-1 rounded-lg border ${
                    watch('rate') === String(r) ? 'bg-primary text-white' : 'bg-white'
                  }`}
                  onClick={() => setValue('rate', String(r))}
                >{r}</button>
              ))}
            </div>
            <input placeholder="np. 200" {...register('rate')} className={`w-full border p-2 rounded mt-2 ${errors.rate ? 'border-red-500' : ''}`} />
            {errors.rate && <p className="text-red-500">{errors.rate.message}</p>}
          </div>
          {/* honeypot - ukryte pole dla botów */}
          <input type="text" {...register('hp')} className="hidden" tabIndex={-1} autoComplete="off" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block">Telefon</label>
              <input type="tel" placeholder="123 456 789" {...register('phone')} className={`w-full border p-2 rounded ${errors.phone ? 'border-red-500' : ''}`} />
              {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block">Email</label>
              <input type="email" {...register('email')} className={`w-full border p-2 rounded ${errors.email ? 'border-red-500' : ''}`} />
              {errors.email && <p className="text-red-500">{errors.email.message}</p>}
            </div>
          </div>
          <div className="flex items-center mt-4">
            <input type="checkbox" {...register('terms')} id="terms" className="mr-2" />
            <label htmlFor="terms" className="text-sm">
              Akceptuję <a href="#" className="underline">regulamin</a>
            </label>
          </div>
          {errors.terms && <p className="text-red-500 text-sm">{errors.terms.message}</p>}
          <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 w-full">
            {isSubmitting ? 'Wysyłanie...' : 'Dodaj ogłoszenie'}
          </button>
        </form>
      )}
    </div>
  );
}
