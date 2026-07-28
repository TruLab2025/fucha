// components/JobGrid.tsx
import React from 'react';
import JobCard from './JobCard';
import { Listing } from '../lib/db';

interface Props {
  jobs: Listing[];
}

export default function JobGrid({ jobs }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
