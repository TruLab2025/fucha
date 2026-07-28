"use client";

import React, { useState } from 'react';
import ContactModal from './ContactModal';
import Icon, { IconName } from './Icon';
import { Listing } from '../lib/db';

interface Props {
  job: Listing;
}

const categoryIcons: Record<string, IconName> = {
  Transport: 'transport',
  Ogród: 'leaf',
  Budowa: 'hammer',
  Magazyn: 'package',
  Inne: 'plus',
};

const formatAvailability = (job: Listing) => {
  if (!job.available_date) return 'Termin do ustalenia';

  const start = new Date(job.available_date).toLocaleDateString('pl-PL');
  if (job.available_to && job.available_to !== job.available_date) {
    return `${start} – ${new Date(job.available_to).toLocaleDateString('pl-PL')}`;
  }

  return start;
};

const formatRate = (job: Listing) => {
  if (!job.rate) return 'Stawka do ustalenia';
  return job.rate_type === 'daily' ? `${job.rate} zł / dzień` : `${job.rate} zł / h`;
};

export default function JobCard({ job }: Props) {
  const [open, setOpen] = useState(false);

  if (job.type === 'worker') {
    const categoryIcon = categoryIcons[job.category || ''] || 'briefcase';

    return (
      <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-card transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-float">
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary transition group-hover:bg-primary group-hover:text-white">
              <Icon name={categoryIcon} size={21} />
            </span>
            <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-green-700">
              Dostępny
            </span>
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-primary">{job.category || 'Inna kategoria'}</p>
          <h3 className="mt-1.5 text-xl font-bold leading-snug text-ink">{job.title}</h3>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-neutral-500">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="map-pin" size={16} className="text-neutral-400" />
              {[job.city, job.province].filter(Boolean).join(', ')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="calendar" size={16} className="text-neutral-400" />
              {formatAvailability(job)}
            </span>
            {job.rate_type !== 'daily' && job.available_hours && (
              <span className="inline-flex items-center gap-1.5">
                <Icon name="clock" size={16} className="text-neutral-400" />
                {job.available_hours} h
              </span>
            )}
          </div>

          {job.description && (
            <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted">{job.description}</p>
          )}

          <p className="mt-5 text-2xl font-black tracking-tight text-ink">{formatRate(job)}</p>
        </div>

        <div className="border-t border-neutral-100 bg-neutral-50/70 p-4">
          <button
            type="button"
            className="btn-secondary w-full border-white bg-white"
            onClick={() => {
              const params = new URLSearchParams({
                title: job.title || '',
                description: job.description || '',
                province: job.province || '',
                city: job.city || '',
                category: job.category || '',
                available_date: job.available_date || '',
                available_to: job.available_to || '',
                available_hours: job.available_hours || '',
                rate_type: job.rate_type || 'hourly',
                rate: '',
              }).toString();
              window.location.href = `/add?${params}`;
            }}
          >
            <Icon name="copy" size={17} />
            Użyj jako wzoru
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-green-100 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-float">
      <div className="flex-1 p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
            <Icon name="briefcase" size={21} />
          </span>
          <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-green-700">Firma szuka</span>
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-green-700">{job.company_name}</p>
        <h3 className="mt-1.5 text-xl font-bold leading-snug text-ink">{job.job_title}</h3>
        <p className="mt-4 text-sm font-medium text-neutral-500">
          {[job.category, job.experience_level].filter(Boolean).join(' · ')}
        </p>
        <p className="mt-2 text-lg font-black text-ink">{job.salary_min}–{job.salary_max} zł / h</p>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted">{job.description}</p>
      </div>
      <div className="border-t border-neutral-100 bg-neutral-50/70 p-4">
        <button type="button" className="btn-green w-full" onClick={() => setOpen(true)}>
          Szczegóły i kontakt
          <Icon name="arrow-right" size={17} />
        </button>
      </div>
      {open && <ContactModal listing={job} onClose={() => setOpen(false)} />}
    </article>
  );
}
