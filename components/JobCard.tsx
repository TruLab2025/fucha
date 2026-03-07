// components/JobCard.tsx
"use client";
import React, { useState } from 'react';
import ContactModal from './ContactModal';
import { Listing } from '../lib/db';

interface Props {
  job: Listing;
}

const categoryIcons: Record<string, string> = {
  Transport: '🚚',
  Ogród: '🌿',
  Budowa: '🔨',
  Magazyn: '📦',
  Inne: '➕',
};

export default function JobCard({ job }: Props) {
  const [open, setOpen] = useState(false);

  // Worker listing (mam czas)
  if (job.type === 'worker') {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">
              {categoryIcons[job.category || ''] || '❓'}
            </span>
            <h3 className="text-lg font-semibold text-text">{job.title}</h3>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {job.province}, {job.city} – {new Date(job.available_date!).toLocaleDateString('pl-PL')} ({job.available_hours}h)
          </p>
          <p className="mt-2 font-medium text-primary">{job.rate}</p>
        </div>
        <button
          className="mt-4 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
          onClick={() => {
            // Przekieruj do /add z query stringiem z danymi tej fuchy
            const params = new URLSearchParams({
              title: job.title || '',
              description: job.description || '',
              province: job.province || '',
              city: job.city || '',
              category: job.category || '',
              available_date: job.available_date || '',
              available_hours: job.available_hours || '',
              rate: job.rate || ''
            }).toString();
            window.location.href = `/add?${params}`;
          }}
        >
          Duplikuj fuchę
        </button>
      </div>
    );
  }

  // Employer listing (szukam ludzi)
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col justify-between border-2 border-blue-100">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-text">{job.job_title}</h3>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">SZUKA LUDZI</span>
        </div>
        <p className="text-sm font-medium text-primary mb-1">{job.company_name}</p>
        <p className="text-sm text-gray-500 mb-2">
          {job.category} • {job.experience_level} • {job.salary_min}-{job.salary_max} zł/h
        </p>
        <p className="text-sm text-gray-700 line-clamp-2">{job.description}</p>
      </div>
      <button
        className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
        onClick={() => setOpen(true)}
      >
        Szczegóły i aplikacja
      </button>
      {open && <ContactModal listing={job} onClose={() => setOpen(false)} />}
    </div>
  );
}
