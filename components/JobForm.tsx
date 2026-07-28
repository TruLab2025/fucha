// components/JobForm.tsx
"use client";
import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import ReactDatePicker from 'react-datepicker';
import Icon, { IconName } from './Icon';

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
const hourPresets = [1,2,3,4,5,6,7,8,10];
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

const categories: { value: 'Transport' | 'Ogród' | 'Budowa' | 'Magazyn' | 'Inne'; icon: IconName; }[] = [
  { value: 'Transport', icon: 'transport' },
  { value: 'Ogród', icon: 'leaf' },
  { value: 'Budowa', icon: 'hammer' },
  { value: 'Magazyn', icon: 'package' },
  { value: 'Inne', icon: 'plus' },
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
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JobInput>({
    resolver: zodResolver(jobSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
    setSuccess(false);
    setSubmitError(null);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (success) successHeadingRef.current?.focus();
  }, [success]);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

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
      redirectTimerRef.current = setTimeout(() => {
        router.push('/jobs');
      }, 5000);
      return;
    }

    const err = await res.json().catch(() => null);
    setSubmitError(err?.error || 'Nie udało się opublikować ogłoszenia. Spróbuj jeszcze raz.');
  };

  return (
    <div className="surface mx-auto max-w-2xl overflow-hidden">
      {success ? (
        <div role="status" aria-live="polite" className="space-y-5 bg-primary-50 px-6 py-12 text-center sm:px-10">
          <span
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl text-white shadow-lg shadow-primary-200/60"
            aria-hidden="true"
          >
            <Icon name="check" size={25} />
          </span>
          <div className="space-y-2">
            <h2 ref={successHeadingRef} tabIndex={-1} className="text-2xl font-bold outline-none">Ogłoszenie opublikowane</h2>
            <p className="text-sm leading-6 text-muted">
              Za chwilę przejdziesz do listy fuch. Możesz też otworzyć ją od razu.
            </p>
          </div>
          <Link
            href="/jobs"
            className="btn-primary"
          >
            Przejdź do listy teraz
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="border-b border-neutral-200 bg-neutral-50/80 px-5 py-5 sm:px-8 sm:py-6">
            <p className="text-sm font-semibold text-primary">Krótko i konkretnie</p>
            <h2 className="mt-1 text-2xl font-bold">Opowiedz, kiedy możesz pomóc</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Uzupełnij najważniejsze informacje. Całość zajmuje tylko kilka minut.
            </p>
          </div>

          {submitError && (
            <div className="mx-5 mt-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 sm:mx-8" role="alert">
              <span className="font-bold" aria-hidden="true">!</span>
              <span>{submitError}</span>
            </div>
          )}

          <fieldset className="space-y-6 border-0 px-5 py-7 sm:px-8 sm:py-8">
            <legend className="sr-only">Podstawowe informacje</legend>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-sm font-bold text-primary">1</span>
              <div>
                <h3 className="text-lg font-bold">Podstawowe informacje</h3>
                <p className="mt-1 text-sm leading-6 text-muted">Napisz, w czym możesz pomóc i gdzie jesteś dostępny.</p>
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="job-title">Nazwa fuchy</label>
              <input
                id="job-title"
                {...register('title')}
                placeholder="np. Pomogę przy przeprowadzce"
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? 'job-title-error' : undefined}
                className={`min-h-12 w-full ${errors.title ? 'border-red-400' : ''}`}
              />
              {errors.title && <p id="job-title-error" className="field-error">{errors.title.message}</p>}
            </div>

            <div>
              <label className="field-label" htmlFor="job-description">Opis</label>
              <textarea
                id="job-description"
                {...register('description')}
                placeholder="Dodaj kilka zdań o swoim doświadczeniu, zakresie pomocy i ważnych szczegółach."
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? 'job-description-error' : undefined}
                className={`min-h-32 w-full ${errors.description ? 'border-red-400' : ''}`}
              />
              {errors.description && <p id="job-description-error" className="field-error">{errors.description.message}</p>}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="job-province">Województwo</label>
                <select
                  id="job-province"
                  {...provinceField}
                  aria-invalid={Boolean(errors.province)}
                  aria-describedby={errors.province ? 'job-province-error' : undefined}
                  className={`min-h-12 w-full ${errors.province ? 'border-red-400' : ''}`}
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
                {errors.province && <p id="job-province-error" className="field-error">{errors.province.message}</p>}
              </div>
              <div>
                <label className="field-label" htmlFor="job-city">Miasto</label>
                <input
                  id="job-city"
                  list="city-list"
                  placeholder="Wybierz miasto"
                  {...register('city')}
                  aria-invalid={Boolean(errors.city)}
                  aria-describedby={errors.city ? 'job-city-error' : undefined}
                  className={`min-h-12 w-full ${errors.city ? 'border-red-400' : ''}`}
                />
                <datalist id="city-list">
                  {cityOptions.map(c => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                {errors.city && <p id="job-city-error" className="field-error">{errors.city.message}</p>}
              </div>
            </div>

            <div>
              <span className="field-label">Kategoria</span>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    type="button"
                    key={cat.value}
                    aria-pressed={watch('category') === cat.value}
                    className={`choice-chip min-h-12 ${
                      watch('category') === cat.value
                        ? 'border-primary bg-primary text-white hover:border-primary-600 hover:bg-primary-600 hover:text-white'
                        : ''
                    }`}
                    onClick={() => setValue('category', cat.value)}
                  >
                    <Icon name={cat.icon} size={18} />
                    <span>{cat.value}</span>
                  </button>
                ))}
              </div>
              {errors.category && <p className="field-error">{errors.category.message}</p>}
            </div>
          </fieldset>

          <fieldset className="space-y-6 border-0 border-t border-neutral-200 bg-neutral-50/50 px-5 py-7 sm:px-8 sm:py-8">
            <legend className="sr-only">Dostępność i wynagrodzenie</legend>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-sm font-bold text-primary">2</span>
              <div>
                <h3 className="text-lg font-bold">Dostępność i stawka</h3>
                <p className="mt-1 text-sm leading-6 text-muted">Określ termin i wybierz sposób rozliczenia.</p>
              </div>
            </div>

            <div>
              <span className="field-label">Dostępność</span>
              <div className="flex flex-wrap gap-2">
                {availabilityModes.map((mode) => (
                  <button
                    type="button"
                    key={mode.value}
                    aria-pressed={availabilityMode === mode.value}
                    className={`choice-chip min-h-12 ${
                      availabilityMode === mode.value
                        ? 'border-primary bg-primary text-white hover:border-primary-600 hover:bg-primary-600 hover:text-white'
                        : ''
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

            <div className={`grid gap-5 ${availabilityMode === 'range' ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
              <div>
                <label className="field-label" htmlFor="job-available-date">{availabilityMode === 'range' ? 'Od kiedy?' : 'Data dostępności'}</label>
                <Controller
                  control={control}
                  name="available_date"
                  defaultValue={formatDateForInput(new Date())}
                  render={({ field }) => (
                    <ReactDatePicker
                      id="job-available-date"
                      className={`min-h-12 w-full ${errors.available_date ? 'border-red-400' : ''}`}
                      wrapperClassName="w-full"
                      selected={field.value ? parseDateFromInput(field.value) : null}
                      onChange={(date: Date | null) => {
                        field.onChange(date ? formatDateForInput(date) : '');
                      }}
                      dateFormat="yyyy-MM-dd"
                      minDate={new Date()}
                      aria-invalid={errors.available_date ? 'true' : 'false'}
                      aria-describedby={errors.available_date ? 'job-available-date-error' : undefined}
                    />
                  )}
                />
                {errors.available_date && <p id="job-available-date-error" className="field-error">{errors.available_date.message}</p>}
              </div>
              {availabilityMode === 'range' && (
                <div>
                  <label className="field-label" htmlFor="job-available-to">Do kiedy?</label>
                  <Controller
                    control={control}
                    name="available_to"
                    render={({ field }) => (
                      <ReactDatePicker
                        id="job-available-to"
                        className={`min-h-12 w-full ${errors.available_to ? 'border-red-400' : ''}`}
                        wrapperClassName="w-full"
                        selected={field.value ? parseDateFromInput(field.value) : null}
                        onChange={(date: Date | null) => {
                          field.onChange(date ? formatDateForInput(date) : '');
                        }}
                      dateFormat="yyyy-MM-dd"
                      minDate={parseDateFromInput(watch('available_date')) || new Date()}
                      aria-invalid={errors.available_to ? 'true' : 'false'}
                      aria-describedby={errors.available_to ? 'job-available-to-error' : undefined}
                    />
                  )}
                />
                  {errors.available_to && <p id="job-available-to-error" className="field-error">{errors.available_to.message}</p>}
                </div>
              )}
            </div>

            <div>
              <span className="field-label">Typ stawki</span>
              <div className="flex flex-wrap gap-2">
                {rateTypes.map((item) => (
                  <button
                    type="button"
                    key={item.value}
                    aria-pressed={rateType === item.value}
                    className={`choice-chip min-h-12 ${
                      rateType === item.value
                        ? 'border-primary bg-primary text-white hover:border-primary-600 hover:bg-primary-600 hover:text-white'
                        : ''
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
                <span className="field-label">Ile godzin mogę pracować?</span>
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="Liczba dostępnych godzin"
                  aria-invalid={Boolean(errors.available_hours)}
                  aria-describedby={errors.available_hours ? 'job-available-hours-error' : undefined}
                >
                  {hourPresets.map(h => (
                    <button
                      type="button"
                      key={h}
                      aria-pressed={watch('available_hours') === String(h)}
                      className={`choice-chip min-h-12 min-w-12 ${
                        watch('available_hours') === String(h)
                          ? 'border-primary bg-primary text-white hover:border-primary-600 hover:bg-primary-600 hover:text-white'
                          : ''
                      }`}
                      onClick={() => setValue('available_hours', String(h))}
                    >{h}h</button>
                  ))}
                </div>
                {errors.available_hours && <p id="job-available-hours-error" className="field-error">{errors.available_hours.message}</p>}
              </div>
            )}

            <div>
              <label className="field-label" htmlFor="job-rate">Wynagrodzenie ({rateType === 'hourly' ? 'zł/h' : 'zł/dzień'})</label>
              <div className="mb-3 flex flex-wrap gap-2">
                {ratePresets.map(r => (
                  <button
                    type="button"
                    key={r}
                    aria-pressed={watch('rate') === String(r)}
                    className={`choice-chip min-h-12 min-w-12 ${
                      watch('rate') === String(r)
                        ? 'border-primary bg-primary text-white hover:border-primary-600 hover:bg-primary-600 hover:text-white'
                        : ''
                    }`}
                    onClick={() => setValue('rate', String(r))}
                  >{r}</button>
                ))}
              </div>
              <input
                id="job-rate"
                placeholder="np. 200"
                inputMode="decimal"
                {...register('rate')}
                aria-invalid={Boolean(errors.rate)}
                aria-describedby={errors.rate ? 'job-rate-error' : undefined}
                className={`min-h-12 w-full ${errors.rate ? 'border-red-400' : ''}`}
              />
              {errors.rate && <p id="job-rate-error" className="field-error">{errors.rate.message}</p>}
              {rateType === 'hourly' && Number.isFinite(rateNumber) && rateNumber > 0 && (
                <p className="mt-2 text-xs leading-5 text-muted">Orientacyjnie: około {rateNumber * 8} zł za 8h.</p>
              )}
            </div>
          </fieldset>

          <fieldset className="space-y-6 border-0 border-t border-neutral-200 px-5 py-7 sm:px-8 sm:py-8">
            <legend className="sr-only">Kontakt i publikacja</legend>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-sm font-bold text-primary">3</span>
              <div>
                <h3 className="text-lg font-bold">Kontakt i publikacja</h3>
                <p className="mt-1 text-sm leading-6 text-muted">Podaj dane, przez które zainteresowane osoby mogą się odezwać.</p>
              </div>
            </div>

            {/* honeypot - ukryte pole dla botów */}
            <input type="text" {...register('hp')} className="hidden" tabIndex={-1} autoComplete="off" />

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="job-phone">Telefon</label>
                <input
                  id="job-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="123456789"
                  inputMode="numeric"
                  maxLength={9}
                  {...phoneField}
                  onChange={(e) => {
                    const nextValue = e.target.value.replace(/\D/g, '').slice(0, 9);
                    e.target.value = nextValue;
                    phoneField.onChange(e);
                  }}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'job-phone-help job-phone-error' : 'job-phone-help'}
                  className={`min-h-12 w-full ${errors.phone ? 'border-red-400' : ''}`}
                />
                <p id="job-phone-help" className="mt-2 text-xs leading-5 text-muted">Numer zobaczą tylko osoby, które będą chciały się z Tobą skontaktować.</p>
                {errors.phone && <p id="job-phone-error" className="field-error">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="field-label" htmlFor="job-email">Email</label>
                <input
                  id="job-email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'job-email-help job-email-error' : 'job-email-help'}
                  className={`min-h-12 w-full ${errors.email ? 'border-red-400' : ''}`}
                />
                <p id="job-email-help" className="mt-2 text-xs leading-5 text-muted">Przyda się, jeśli ktoś woli odezwać się mailowo zamiast dzwonić.</p>
                {errors.email && <p id="job-email-error" className="field-error">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <div className={`flex items-start gap-3 rounded-2xl border px-4 py-4 ${errors.terms ? 'border-red-300 bg-red-50/60' : 'border-neutral-200 bg-neutral-50'}`}>
                <input type="checkbox" {...register('terms')} id="terms" className="mt-0.5" aria-invalid={Boolean(errors.terms)} aria-describedby={errors.terms ? 'job-terms-error' : undefined} />
                <label htmlFor="terms" className="text-sm leading-6 text-neutral-700">
                  Akceptuję <Link href="/regulamin" className="font-semibold text-primary underline decoration-primary-200 underline-offset-4 hover:text-primary-700">regulamin</Link>
                </label>
              </div>
              {errors.terms && <p id="job-terms-error" className="field-error">{errors.terms.message}</p>}
            </div>

            <div className="border-t border-neutral-200 pt-6">
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? 'Wysyłanie...' : 'Dodaj ogłoszenie'}
              </button>
              <p className="mt-3 text-center text-xs leading-5 text-muted">
                Publikacja zajmuje chwilę. Po dodaniu ogłoszenia od razu pojawisz się na liście.
              </p>
            </div>
          </fieldset>
        </form>
      )}
    </div>
  );
}
