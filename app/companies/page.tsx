// app/companies/page.tsx
import React from 'react';
import PricingPlans from '../../components/PricingPlans';

export default function CompaniesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="pt-4 pb-12">
        <PricingPlans />
      </div>
    </div>
  );
}
