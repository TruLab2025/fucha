// components/JobForm.tsx
"use client";
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
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
  availability_mode: z.enum(['single', 'range']),
  available_date: z.string().min(1, { message: 'Data jest wymagana' }),
  available_to: z.string().optional(),
  available_hours: z.string().optional(),
  rate_type: z.enum(['hourly', 'daily']),
  rate: z.string().min(1, { message: 'Stawka jest wymagana' }),
  phone: z.string()
    .min(1, { message: 'Telefon jest wymagany' })
    .refine((val) => {
      const digits = val.replace(/\D/g, '');
      return digits.length === 9;
    }, { message: 'Telefon musi mieć dokładnie 9 cyfr' }),
  email: z.string().email({ message: 'Nieprawidłowy email' }),
  terms: z.boolean().refine(v => v, { message: 'Musisz zaakceptować regulamin' }),
  rodo: z.boolean().optional(), // RODO - informacyjne, nie wymagane
  hp: z.string().max(0).optional(), // honeypot must be empty
}).superRefine((data, ctx) => {
  if (data.availability_mode === 'range') {
    if (!data.available_to) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['available_to'],
        message: 'Podaj datę końcową',
      });
    } else if (data.available_to < data.available_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['available_to'],
        message: 'Data końcowa nie może być wcześniejsza niż początkowa',
      });
    }
  }

  if (data.rate_type === 'hourly' && !data.available_hours) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['available_hours'],
      message: 'Podaj liczbę godzin',
    });
  }
});

type JobInput = z.infer<typeof jobSchema>;

const ratePresets = [50,75,100,125,150,175,200,400];
const hourPresets = [1,2,3,4,5,6,7,8];
const rateTypes = [
  { value: 'hourly', label: 'zł / h' },
  { value: 'daily', label: 'zł / dzień' },
] as const;
const availabilityModes = [
  { value: 'single', label: 'Jeden dzień' },
  { value: 'range', label: 'Kilka dni' },
] as const;

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

const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const parseDateFromInput = (value: string) => {
  if (!value) return null;

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
};

export default function JobForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultValues = useMemo<JobInput>(() => {
    const allowedCategories = ['Transport','Ogród','Budowa','Magazyn','Inne'];
    const categoryValue = searchParams.get('category');
    const category = typeof categoryValue === 'string' && allowedCategories.includes(categoryValue)
      ? (categoryValue as 'Transport' | 'Ogród' | 'Budowa' | 'Magazyn' | 'Inne')
      : 'Inne';
    const rateTypeValue = searchParams.get('rate_type');
    const rateType = rateTypeValue === 'daily' ? 'daily' : 'hourly';

    return {
      title: searchParams.get('title') || '',
      description: searchParams.get('description') || '',
      province: searchParams.get('province') || '',
      city: searchParams.get('city') || '',
      category,
      availability_mode: searchParams.get('available_to') ? 'range' : 'single',
      available_date: searchParams.get('available_date') || formatDateForInput(new Date()),
      available_to: searchParams.get('available_to') || '',
      available_hours: searchParams.get('available_hours') || '',
      rate_type: rateType,
      rate: searchParams.get('rate') || '',
      phone: '',
      email: '',
      terms: false,
      rodo: false,
      hp: '',
    };
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<JobInput>({
    resolver: zodResolver(jobSchema),
    defaultValues,
  });

  const provinceField = register('province');
  const phoneField = register('phone');
  const selectedProvince = watch('province');
  const cityOptions = provinces[selectedProvince] || [];
  const availabilityMode = watch('availability_mode');
  const rateType = watch('rate_type');
  const rateValue = watch('rate');
  const rateNumber = Number(rateValue);

  const onFormSubmit: SubmitHandler<JobInput> = async (data) => {
    setSubmitError(null);

    const res = await fetch('/api/jobs/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, type: 'worker' }),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/jobs');
      }, 5000);
      return;
    }

    const err = await res.json().catch(() => null);
    setSubmitError(err?.error || 'Nie udało się opublikować ogłoszenia. Spróbuj jeszcze raz.');
  };

  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-sm sm:p-8">
      {success ? (
        <div className="p-6 bg-green-100 text-green-800 rounded-lg text-center space-y-4">
          <p>Ogłoszenie opublikowane! Za chwilę przejdziesz do listy fuch.</p>
          <p>
            Możesz też <Link href="/jobs" className="text-primary underline">zobaczyć listę fuch</Link> wcześniej.
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2 font-medium text-white transition hover:bg-blue-700"
          >
            Przejdź do listy teraz
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}
          <div>
            <label className="block font-medium">Nazwa fuchy</label>
            <input {...register('title')} className={`w-full border p-2 rounded ${errors.title ? 'border-red-500' : ''}`} />
            {errors.title && <p className="text-red-500">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block font-medium">Opis</label>
            <textarea {...register('description')} className={`w-full border p-2 rounded ${errors.description ? 'border-red-500' : ''}`} />
            {errors.description && <p className="text-red-500">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Województwo</label>
              <select
                {...provinceField}
                className={`w-full border p-2 rounded ${errors.province ? 'border-red-500' : ''}`}
                onChange={(e) => {
                  provinceField.onChange(e);
                  const prov = e.target.value;
                  const cities = provinces[prov] || [];
                  setValue('city', cities[0] || '');
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
              <label className="block font-medium">Miasto</label>
              <input list="city-list" placeholder="Wybierz miasto" {...register('city')} className={`w-full border p-2 rounded ${errors.city ? 'border-red-500' : ''}`} />
              <datalist id="city-list">
                {cityOptions.map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {errors.city && <p className="text-red-500">{errors.city.message}</p>}
            </div>
          </div>
          <div>
            <label className="block font-medium">Kategoria</label>
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
            <label className="block font-medium">Dostępność</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {availabilityModes.map((mode) => (
                <button
                  type="button"
                  key={mode.value}
                  className={`rounded-lg border px-3 py-1 ${
                    availabilityMode === mode.value ? 'bg-primary text-white' : 'bg-white'
                  }`}
                  onClick={() => {
                    setValue('availability_mode', mode.value);
                    if (mode.value === 'single') {
                      setValue('available_to', '');
                    }
                  }}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
          <div className={`grid gap-4 ${availabilityMode === 'range' ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
            <div>
              <label className="block font-medium">{availabilityMode === 'range' ? 'Od kiedy?' : 'Data dostępności'}</label>
              <Controller
                control={control}
                name="available_date"
                defaultValue={formatDateForInput(new Date())}
                render={({ field }) => (
                  <ReactDatePicker
                    className={`w-full border p-2 rounded ${errors.available_date ? 'border-red-500' : ''}`}
                    selected={field.value ? parseDateFromInput(field.value) : null}
                    onChange={(date: Date | null) => {
                      field.onChange(date ? formatDateForInput(date) : '');
                    }}
                    dateFormat="yyyy-MM-dd"
                    minDate={new Date()}
                  />
                )}
              />
              {errors.available_date && <p className="text-red-500">{errors.available_date.message}</p>}
            </div>
            {availabilityMode === 'range' && (
              <div>
                <label className="block font-medium">Do kiedy?</label>
                <Controller
                  control={control}
                  name="available_to"
                  render={({ field }) => (
                    <ReactDatePicker
                      className={`w-full border p-2 rounded ${errors.available_to ? 'border-red-500' : ''}`}
                      selected={field.value ? parseDateFromInput(field.value) : null}
                      onChange={(date: Date | null) => {
                        field.onChange(date ? formatDateForInput(date) : '');
                      }}
                      dateFormat="yyyy-MM-dd"
                      minDate={parseDateFromInput(watch('available_date')) || new Date()}
                    />
                  )}
                />
                {errors.available_to && <p className="text-red-500">{errors.available_to.message}</p>}
              </div>
            )}
          </div>
          <div>
            <label className="block font-medium">Typ stawki</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {rateTypes.map((item) => (
                <button
                  type="button"
                  key={item.value}
                  className={`rounded-lg border px-3 py-1 ${
                    rateType === item.value ? 'bg-primary text-white' : 'bg-white'
                  }`}
                  onClick={() => {
                    setValue('rate_type', item.value);
                    if (item.value === 'daily') {
                      setValue('available_hours', '');
                    }
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          {rateType === 'hourly' && (
            <div>
              <label className="block font-medium">Ile godzin mogę pracować?</label>
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
          )}
          <div>
            <label className="block font-medium">Wynagrodzenie ({rateType === 'hourly' ? 'zł/h' : 'zł/dzień'})</label>
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
            {rateType === 'hourly' && Number.isFinite(rateNumber) && rateNumber > 0 && (
              <p className="mt-1 text-xs text-gray-500">Orientacyjnie: około {rateNumber * 8} zł za 8h.</p>
            )}
          </div>
          {/* honeypot - ukryte pole dla botów */}
          <input type="text" {...register('hp')} className="hidden" tabIndex={-1} autoComplete="off" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Telefon</label>
              <input
                type="tel"
                placeholder="123456789"
                inputMode="numeric"
                maxLength={9}
                {...phoneField}
                onChange={(e) => {
                  const nextValue = e.target.value.replace(/\D/g, '').slice(0, 9);
                  e.target.value = nextValue;
                  phoneField.onChange(e);
                }}
                className={`w-full border p-2 rounded ${errors.phone ? 'border-red-500' : ''}`}
              />
              <p className="mt-1 text-xs text-gray-500">Numer zobaczą tylko osoby, które będą chciały się z Tobą skontaktować.</p>
              {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block font-medium">Email</label>
              <input type="email" {...register('email')} className={`w-full border p-2 rounded ${errors.email ? 'border-red-500' : ''}`} />
              <p className="mt-1 text-xs text-gray-500">Przyda się, jeśli ktoś woli odezwać się mailowo zamiast dzwonić.</p>
              {errors.email && <p className="text-red-500">{errors.email.message}</p>}
            </div>
          </div>
          <div className="flex items-center mt-4">
            <input type="checkbox" {...register('terms')} id="terms" className="mr-2" />
            <label htmlFor="terms" className="text-sm">
              Akceptuję <Link href="/regulamin" className="underline">regulamin</Link>
            </label>
          </div>
          {errors.terms && <p className="text-red-500 text-sm">{errors.terms.message}</p>}
          <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 w-full">
            {isSubmitting ? 'Wysyłanie...' : 'Dodaj ogłoszenie'}
          </button>
          <p className="text-center text-sm text-gray-500">
            Publikacja zajmuje chwilę. Po dodaniu ogłoszenia od razu pojawisz się na liście.
          </p>
        </form>
      )}
    </div>
  );
}
