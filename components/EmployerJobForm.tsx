// components/EmployerJobForm.tsx
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';

const jobOfferSchema = z.object({
  company_name: z.string().min(1, { message: 'Nazwa firmy jest wymagana' }),
  job_title: z.string().min(1, { message: 'Stanowisko jest wymagane' }),
  description: z.string().min(10, { message: 'Opis musi mieć co najmniej 10 znaków' }),
  category: z.enum(['Transport', 'Ogród', 'Budowa', 'Magazyn', 'Inne'], { 
    errorMap: () => ({ message: 'Wybierz kategorię' }) 
  }),
  skills_required: z.string().min(1, { message: 'Umiejętności są wymagane' }),
  experience_level: z.enum(['Bez doświadczenia', 'Junior', 'Mid', 'Senior'], {
    errorMap: () => ({ message: 'Wybierz poziom doświadczenia' })
  }),
  salary_min: z.string().min(1, { message: 'Stawka minimalna wymagana' }),
  salary_max: z.string().min(1, { message: 'Stawka maksymalna wymagana' }),
  phone: z.string()
    .min(1, { message: 'Telefon jest wymagany' })
    .refine((val) => {
      const digits = val.replace(/\D/g, '');
      return digits.length >= 9 && digits.length <= 15;
    }, { message: 'Telefon musi mieć 9-15 cyfr' }),
  email: z.string().email({ message: 'Email musi być poprawny' }),
  terms: z.boolean().refine(val => val === true, { message: 'Musisz zaakceptować regulamin' }),
  hp: z.string().max(0, { message: 'Honeypot' }),
});

type JobOfferFormData = z.infer<typeof jobOfferSchema>;

const CATEGORIES = [
  { label: '🚚 Transport', value: 'Transport' },
  { label: '🌿 Ogród', value: 'Ogród' },
  { label: '🔨 Budowa', value: 'Budowa' },
  { label: '📦 Magazyn', value: 'Magazyn' },
  { label: '➕ Inne', value: 'Inne' },
];

const EXPERIENCE_LEVELS = ['Bez doświadczenia', 'Junior', 'Mid', 'Senior'];

export default function EmployerJobForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedExperience, setSelectedExperience] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<JobOfferFormData>({
    resolver: zodResolver(jobOfferSchema),
  });

  const salaryMin = watch('salary_min');
  const salaryMax = watch('salary_max');

  const onSubmit = async (data: JobOfferFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          type: 'employer', // Aby odróżnić oferty pracodawcy od "mam czas"
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Błąd podczas publikacji');
      }

      const result = await response.json();
      localStorage.removeItem('paymentData');
      
      router.push('/employers/success?id=' + result.id);
    } catch (error) {
      console.error('Błąd:', error);
      alert('Błąd: ' + (error instanceof Error ? error.message : 'Nieznany błąd'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Publikuj ofertę pracy</h1>
        <p className="text-gray-600">Znajdź idealnych pracowników dla Twojej firmy</p>
      </div>

      {/* Hidden honeypot */}
      <input type="hidden" {...register('hp')} />

      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nazwa firmy
        </label>
        <input
          type="text"
          placeholder="np. ABC Construction"
          {...register('company_name')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
        />
        {errors.company_name && (
          <p className="text-red-500 text-sm mt-1">{errors.company_name.message}</p>
        )}
      </div>

      {/* Job Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stanowisko
        </label>
        <input
          type="text"
          placeholder="np. Elektryk, Kierowca, Magazynier"
          {...register('job_title')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
        />
        {errors.job_title && (
          <p className="text-red-500 text-sm mt-1">{errors.job_title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Opis oferty
        </label>
        <textarea
          placeholder="Opisz stanowisko, obowiązki i warunki pracy"
          rows={4}
          {...register('description')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kategoria
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.value);
                setValue('category', cat.value as any);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === cat.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
        )}
      </div>

      {/* Skills Required */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Wymagane umiejętności
        </label>
        <input
          type="text"
          placeholder="np. prawo jazdy kat. C, obsługa urządzeń, angielski"
          {...register('skills_required')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
        />
        {errors.skills_required && (
          <p className="text-red-500 text-sm mt-1">{errors.skills_required.message}</p>
        )}
      </div>

      {/* Experience Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Poziom doświadczenia
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {EXPERIENCE_LEVELS.map(level => (
            <button
              key={level}
              type="button"
              onClick={() => {
                setSelectedExperience(level);
                setValue('experience_level', level as any);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                selectedExperience === level
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        {errors.experience_level && (
          <p className="text-red-500 text-sm mt-1">{errors.experience_level.message}</p>
        )}
      </div>

      {/* Salary Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stawka minimalna (zł/h)
          </label>
          <input
            type="number"
            placeholder="np. 35"
            {...register('salary_min')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
          {errors.salary_min && (
            <p className="text-red-500 text-sm mt-1">{errors.salary_min.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stawka maksymalna (zł/h)
          </label>
          <input
            type="number"
            placeholder="np. 60"
            {...register('salary_max')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          />
          {errors.salary_max && (
            <p className="text-red-500 text-sm mt-1">{errors.salary_max.message}</p>
          )}
        </div>
      </div>
      {salaryMin && salaryMax && parseInt(salaryMin) > parseInt(salaryMax) && (
        <p className="text-orange-500 text-sm">
          ⚠️ Stawka minimalna nie powinna być wyższa od maksymalnej
        </p>
      )}

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Telefon
        </label>
        <input
          type="tel"
          placeholder="+48 123 456 789"
          {...register('phone')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email kontaktowy
        </label>
        <input
          type="email"
          placeholder="kontakt@firma.pl"
          {...register('email')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Terms */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="terms"
          {...register('terms')}
          className="w-5 h-5 accent-primary"
        />
        <label htmlFor="terms" className="text-sm text-gray-700">
          Poświadczam, że dane są poprawne i zgadzam się z regulaminem
        </label>
      </div>
      {errors.terms && (
        <p className="text-red-500 text-sm">{errors.terms.message}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full px-4 py-3 rounded-lg font-bold text-white transition ${
          isSubmitting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-primary hover:bg-blue-700'
        }`}
      >
        {isSubmitting ? 'Publikuję... ⏳' : '🚀 Opublikuj ofertę'}
      </button>

      <p className="text-sm text-center text-gray-500">
        Twoja oferta będzie widoczna dla pracowników na liście ofert
      </p>
    </form>
  );
}
